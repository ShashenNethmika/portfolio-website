import type {MetadataRoute} from 'next';
import {stations} from '@/config/stations';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{const root='https://shashennethmika.github.io/portfolio-website';return ['','/about','/projects','/contact','/lab',...stations.map(s=>`/lab/${s.id}`)].map(path=>({url:`${root}${path}/`,changeFrequency:'monthly',priority:path===''?1:.7}));}
