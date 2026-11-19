import { describe, expect, it } from "vitest";
import { calculateSubnet, initialNetwork, ipv4ToNumber, maskToPrefix, networkSchema, numberToIpv4, packetJourney, shortestPath } from "./engine";

describe("IPv4 subnet calculator", () => {
  it("calculates a /26 across its host boundary", () => {
    expect(calculateSubnet("192.168.10.91", 26)).toMatchObject({ mask: "255.255.255.192", network: "192.168.10.64", broadcast: "192.168.10.127", firstHost: "192.168.10.65", lastHost: "192.168.10.126", usableHosts: 62 });
  });
  it("supports all addresses in /0 without signed 32-bit overflow", () => {
    expect(calculateSubnet("255.255.255.255", 0)).toMatchObject({ network: "0.0.0.0", broadcast: "255.255.255.255", totalAddresses: 4294967296, usableHosts: 4294967294 });
    expect(numberToIpv4(ipv4ToNumber("254.250.128.255"))).toBe("254.250.128.255");
  });
  it("treats /31 as RFC 3021 point-to-point and /32 as a host route", () => {
    expect(calculateSubnet("10.0.0.3", 31)).toMatchObject({ firstHost: "10.0.0.2", lastHost: "10.0.0.3", usableHosts: 2 });
    expect(calculateSubnet("10.0.0.3", 32)).toMatchObject({ firstHost: "10.0.0.3", lastHost: "10.0.0.3", usableHosts: 1, mask: "255.255.255.255" });
  });
  it("rejects malformed addresses, prefixes, and non-contiguous masks", () => {
    ["1.2.3", "256.0.0.1", "1.2.3.-1", "1e2.0.0.1", "1..3.4"].forEach((value) => expect(() => ipv4ToNumber(value)).toThrow());
    [-1, 33, 2.5, NaN].forEach((prefix) => expect(() => calculateSubnet("1.2.3.4", prefix)).toThrow());
    expect(() => maskToPrefix("255.0.255.0")).toThrow();
    expect(maskToPrefix("255.255.252.0")).toBe(22);
    expect(maskToPrefix("0.0.0.0")).toBe(0);
    expect(maskToPrefix("255.255.255.255")).toBe(32);
  });
});

describe("educational packet forwarding", () => {
  it("discovers a connected journey and honors the sample router entry", () => {
    expect(shortestPath(initialNetwork, "pc", "server")).toEqual(["pc", "switch", "router", "server"]);
    expect(packetJourney(initialNetwork, "pc", "server")).toEqual(["pc", "switch", "router", "server"]);
  });
  it("reports unreachable destinations and routing loops", () => {
    expect(() => packetJourney({ ...initialNetwork, connections: [] }, "pc", "server")).toThrow("No connected route");
    expect(() => packetJourney({ ...initialNetwork, routes: [{ routerId: "router", destination: "10.0.0.0/24", nextHop: "switch" }] }, "pc", "server")).toThrow("Routing loop");
  });
  it("selects the longest-prefix route", () => {
    const network = { ...initialNetwork, routes: [{ routerId: "router", destination: "0.0.0.0/0", nextHop: "switch" }, { routerId: "router", destination: "10.0.0.0/24", nextHop: "server" }] };
    expect(packetJourney(network, "pc", "server")).toEqual(["pc", "switch", "router", "server"]);
  });
  it("rejects saved topologies with missing endpoints or invalid routes", () => {
    expect(networkSchema.safeParse(initialNetwork).success).toBe(true);
    expect(networkSchema.safeParse({ ...initialNetwork, connections: [{ a: "pc", b: "missing" }] }).success).toBe(false);
    expect(networkSchema.safeParse({ ...initialNetwork, routes: [{ routerId: "router", destination: "10.0.0.0/99", nextHop: "server" }] }).success).toBe(false);
  });
});
