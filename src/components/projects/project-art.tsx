import Image from 'next/image';
import {Sparkles} from 'lucide-react';
import type {Project} from '@/config/portfolio';
import {asset} from '@/lib/utils';

export default function ProjectArt({project,palette}:{project:Project;palette?:string}){
  if(project.repo&&!(project.art==='lantern'&&palette))return <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10">
    <Image src={asset(`/images/projects/${project.slug}.webp`)} alt={`Screenshot of ${project.name}`} width={1280} height={850} sizes="(max-width:768px) 90vw, (max-width:1024px) 45vw, 400px" className="h-full w-full object-cover object-top"/>
  </div>;
  const color=palette==='amber'?'#f5bd78':project.color;
  return <div aria-hidden="true" className="grid-field relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border border-white/5" style={{background:`radial-gradient(ellipse at 50% 120%,${color}28,transparent 75%),#0b1320`,color}}>
    <div className="absolute inset-6 rounded-full border opacity-10" style={{borderColor:color}}/>
    {project.art==='lantern'?<svg width="160" height="200" viewBox="0 0 160 200" fill="none"><path d="M80 0v36M45 45h70l25 40-25 40H45L20 85z" stroke="currentColor" strokeWidth="2"/><path d="M45 45l15 40-15 40M115 45l-15 40 15 40M80 45v80M20 85h120M45 125v50m15-50v65m20-65v75m20-75v65m15-65v50" stroke="currentColor" strokeOpacity=".6"/><path d="M45 45h70l25 40-25 40H45L20 85z" fill="currentColor" fillOpacity=".13"/></svg>:<div className="grid h-32 w-56 place-items-center rounded-lg border border-current/40"><Sparkles size={54} strokeWidth={.8}/><span className="font-mono text-xs tracking-[.3em]">AI CINEMA</span></div>}
  </div>;
}
