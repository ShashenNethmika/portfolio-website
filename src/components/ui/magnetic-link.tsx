'use client';
import Link from '@/components/ui/site-link';
import type {ComponentProps} from 'react';
export default function MagneticLink(props:ComponentProps<typeof Link>){return <Link {...props} onPointerMove={event=>{if(event.pointerType!=='mouse'||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const bounds=event.currentTarget.getBoundingClientRect();const x=(event.clientX-bounds.left-bounds.width/2)*.1,y=(event.clientY-bounds.top-bounds.height/2)*.16;event.currentTarget.style.transform=`translate3d(${x}px,${y}px,0)`;}} onPointerLeave={event=>{event.currentTarget.style.transform='translate3d(0,0,0)';}}/>;}
