'use client';
import { create } from 'zustand';
import { z } from 'zod';
import type { StationId } from '@/config/stations';
const station=z.enum(['logic-circuit','binary-explorer','particle-sandbox','glass-studio','network-studio','motion-studio']);
const schema=z.object({recent:z.array(station).max(6),pinned:z.array(station).max(6),completed:z.array(z.string().max(80)).max(50)});
type LabState={recent:StationId[];pinned:StationId[];completed:string[];ready:boolean;hydrate:()=>void;visit:(id:StationId)=>void;pin:(id:StationId)=>void;complete:(id:string)=>void;};
const persist=(state:Pick<LabState,'recent'|'pinned'|'completed'>)=>{try{localStorage.setItem('shashen.lab.dashboard.v1',JSON.stringify({recent:state.recent,pinned:state.pinned,completed:state.completed}));}catch{/* Local-only functionality remains available without persistence. */}};
export const useLabStore=create<LabState>((set,get)=>({recent:[],pinned:[],completed:[],ready:false,
hydrate:()=>{try{const data=schema.safeParse(JSON.parse(localStorage.getItem('shashen.lab.dashboard.v1')||'null'));if(data.success)set({...data.data,ready:true});else set({ready:true});}catch{set({ready:true});}},
visit:id=>{set(s=>({recent:[id,...s.recent.filter(v=>v!==id)].slice(0,6)}));persist(get());},
pin:id=>{set(s=>({pinned:s.pinned.includes(id)?s.pinned.filter(v=>v!==id):[...s.pinned,id]}));persist(get());},
complete:id=>{set(s=>({completed:[...new Set([...s.completed,id])].slice(0,50)}));persist(get());},
}));
