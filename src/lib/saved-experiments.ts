import {z} from 'zod';
import type {StationId} from '@/config/stations';
import {circuitSchema} from '@/features/logic-circuit/engine';
import {particleExperimentSchema} from '@/features/particle-sandbox/engine';
import {savedGlassSchema} from '@/features/glass-studio/engine';
import {networkSchema} from '@/features/network-studio/engine';
import {motionSchema} from '@/features/motion-studio/engine';

const circuits=z.array(z.object({id:z.string(),name:z.string(),circuit:circuitSchema})).max(20);
const binary=z.object({version:z.literal(1),width:z.union([z.literal(8),z.literal(16),z.literal(32)]),signed:z.boolean(),a:z.string().regex(/^\d{1,10}$/),b:z.string().regex(/^\d{1,10}$/)}).refine(v=>BigInt(v.a)<(1n<<BigInt(v.width))&&BigInt(v.b)<(1n<<BigInt(v.width)));
export function hasSavedExperiment(id:StationId,raw:string|null):boolean {
  if(!raw)return false;
  try{
    const value:unknown=JSON.parse(raw);
    if(id==='logic-circuit'){const p=circuits.safeParse(value);return p.success&&p.data.length>0;}
    if(id==='glass-studio'){const p=savedGlassSchema.safeParse(value);return p.success&&p.data.presets.length>0;}
    if(id==='binary-explorer')return binary.safeParse(value).success;
    if(id==='particle-sandbox')return particleExperimentSchema.safeParse(value).success;
    if(id==='network-studio')return networkSchema.safeParse(value).success;
    return motionSchema.safeParse(value).success;
  }catch{return false;}
}
