import { z } from "zod";

export function ipv4ToNumber(address: string): number {
  const octets = address.trim().split(".");
  if (octets.length !== 4 || octets.some((v) => !/^\d{1,3}$/.test(v) || Number(v) > 255)) {
    throw new Error("Enter four IPv4 octets between 0 and 255.");
  }
  return octets.reduce((total, value) => total * 256 + Number(value), 0);
}

export function numberToIpv4(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) throw new Error("IPv4 value is outside its 32-bit range.");
  return [24, 16, 8, 0].map((shift) => Math.floor(value / 2 ** shift) % 256).join(".");
}

export function maskToPrefix(mask: string): number {
  const binary = ipv4ToNumber(mask).toString(2).padStart(32, "0");
  if (!/^1*0*$/.test(binary)) throw new Error("A subnet mask must contain consecutive ones followed by zeros.");
  return binary.indexOf("0") === -1 ? 32 : binary.indexOf("0");
}

export function calculateSubnet(address: string, prefix: number) {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error("CIDR prefix must be between 0 and 32.");
  const ip = ipv4ToNumber(address);
  const size = 2 ** (32 - prefix);
  const network = Math.floor(ip / size) * size;
  const broadcast = network + size - 1;
  const pointToPoint = prefix === 31;
  const singleHost = prefix === 32;
  return {
    address: numberToIpv4(ip), prefix,
    mask: numberToIpv4(2 ** 32 - size),
    network: numberToIpv4(network), broadcast: numberToIpv4(broadcast),
    firstHost: numberToIpv4(prefix >= 31 ? network : network + 1),
    lastHost: numberToIpv4(prefix >= 31 ? broadcast : broadcast - 1),
    usableHosts: prefix >= 31 ? size : size - 2,
    totalAddresses: size,
    binary: ip.toString(2).padStart(32, "0").match(/.{8}/g)!.join("."),
    binaryMask: (2 ** 32 - size).toString(2).padStart(32, "0").match(/.{8}/g)!.join("."),
    note: pointToPoint ? "/31 uses both addresses on point-to-point links (RFC 3021); there is no directed broadcast." : singleHost ? "/32 identifies one host route; there is no directed broadcast." : "Network and broadcast addresses are reserved; the remaining addresses are usable hosts.",
  };
}

export const deviceSchema = z.object({
  id: z.string().min(1).max(80), type: z.enum(["computer", "switch", "router", "server"]),
  name: z.string().min(1).max(40), ip: z.string().max(20),
  x: z.number().min(30).max(730), y: z.number().min(30).max(370),
});
export const networkSchema = z.object({
  devices: z.array(deviceSchema).max(24),
  connections: z.array(z.object({ a: z.string().max(80), b: z.string().max(80) })).max(80),
  routes: z.array(z.object({ routerId: z.string().max(80), destination: z.string().max(30), nextHop: z.string().max(80) })).max(80),
}).superRefine((network, ctx) => {
  const ids = network.devices.map((d) => d.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Device IDs must be unique." });
  network.devices.forEach((d) => { try { ipv4ToNumber(d.ip); } catch { ctx.addIssue({ code: "custom", message: `Invalid address for ${d.name}.` }); } });
  network.connections.forEach((e) => { if (!ids.includes(e.a) || !ids.includes(e.b) || e.a === e.b) ctx.addIssue({ code: "custom", message: "Connections must join two existing devices." }); });
  network.routes.forEach((r) => {
    const [address, prefix, extra] = r.destination.split("/");
    try {
      if (!prefix || extra || !/^\d{1,2}$/.test(prefix)) throw new Error();
      calculateSubnet(address, Number(prefix));
      if (!network.devices.some((d) => d.id === r.routerId && d.type === "router") || !ids.includes(r.nextHop) || !network.connections.some((e) => (e.a === r.routerId && e.b === r.nextHop) || (e.b === r.routerId && e.a === r.nextHop))) throw new Error();
    } catch { ctx.addIssue({ code: "custom", message: "Static routes need a valid CIDR destination and an adjacent next hop." }); }
  });
});
export type Network = z.infer<typeof networkSchema>;
export type Device = z.infer<typeof deviceSchema>;

export const initialNetwork: Network = {
  devices: [
    { id: "pc", type: "computer", name: "Your computer", ip: "192.168.1.10", x: 95, y: 200 },
    { id: "switch", type: "switch", name: "Access switch", ip: "192.168.1.2", x: 280, y: 200 },
    { id: "router", type: "router", name: "Edge router", ip: "192.168.1.1", x: 470, y: 200 },
    { id: "server", type: "server", name: "Web server", ip: "10.0.0.20", x: 665, y: 200 },
  ],
  connections: [{ a: "pc", b: "switch" }, { a: "switch", b: "router" }, { a: "router", b: "server" }],
  routes: [{ routerId: "router", destination: "10.0.0.0/24", nextHop: "server" }],
};

function neighbors(network: Network, id: string): string[] {
  return network.connections.flatMap((e) => e.a === id ? [e.b] : e.b === id ? [e.a] : []);
}

export function shortestPath(network: Network, source: string, destination: string, blocked: string[] = []): string[] {
  if (!network.devices.some((d) => d.id === source) || !network.devices.some((d) => d.id === destination)) return [];
  const queue = [[source]];
  const visited = new Set(blocked);
  visited.delete(source);
  while (queue.length) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    if (visited.has(current)) continue;
    visited.add(current);
    if (current === destination) return path;
    neighbors(network, current).forEach((next) => { if (!visited.has(next)) queue.push([...path, next]); });
  }
  return [];
}

/** Educational forwarding: routers honor longest-prefix static matches, other hops follow a shortest path. */
export function packetJourney(network: Network, source: string, destination: string): string[] {
  const target = network.devices.find((d) => d.id === destination);
  if (!target || !network.devices.some((d) => d.id === source)) throw new Error("Choose an existing source and destination.");
  const targetIp = ipv4ToNumber(target.ip);
  const path = [source];
  for (let ttl = 0; ttl < 32; ttl++) {
    const current = path[path.length - 1];
    if (current === destination) return path;
    const routes = network.routes.filter((r) => r.routerId === current).filter((r) => {
      const [address, prefix] = r.destination.split("/");
      const subnet = calculateSubnet(address, Number(prefix));
      return targetIp >= ipv4ToNumber(subnet.network) && targetIp <= ipv4ToNumber(subnet.broadcast);
    }).sort((a, b) => Number(b.destination.split("/")[1]) - Number(a.destination.split("/")[1]));
    const fallback = shortestPath(network, current, destination, path.slice(0, -1));
    const next = routes[0]?.nextHop ?? fallback[1];
    if (!next || !neighbors(network, current).includes(next)) throw new Error("No connected route to the destination. Add a link or correct the static route.");
    if (path.includes(next)) throw new Error("Routing loop detected. Check the next-hop entries.");
    path.push(next);
  }
  throw new Error("Packet exceeded the educational TTL of 32 hops.");
}
