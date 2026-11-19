import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {stations} from '@/config/stations';
import Workspace from '@/components/lab/workspace';
export const dynamicParams=false;
export function generateStaticParams(){return stations.map(s=>({station:s.id}));}
export async function generateMetadata({params}:{params:Promise<{station:string}>}):Promise<Metadata>{const {station}=await params;const s=stations.find(s=>s.id===station);return {title:s?.title||'Experiment',description:s?.description,alternates:{canonical:`https://shashennethmika.github.io/portfolio-website/lab/${station}/`}};}
export default async function Page({params}:{params:Promise<{station:string}>}){const {station}=await params;const s=stations.find(s=>s.id===station);if(!s)notFound();return <Workspace id={s.id}/>;}
