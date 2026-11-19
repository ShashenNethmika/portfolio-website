'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
export default function Experience(){
  const path=usePathname() || '/';const cursor=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches)return;
    let disposed=false;let cleanup=()=>{};
    // Only portfolio pages receive smooth scrolling; workspaces retain native gestures.
    if(!path.startsWith('/lab')&&!path.startsWith('/pages/lab.html'))void Promise.all([import('lenis'),import('gsap'),import('gsap/ScrollTrigger')]).then(([{default:Lenis},{gsap},{ScrollTrigger}])=>{
      if(disposed)return;gsap.registerPlugin(ScrollTrigger);const lenis=new Lenis({autoRaf:false,anchors:true});
      const tick=(time:number)=>lenis.raf(time*1000);gsap.ticker.add(tick);lenis.on('scroll',ScrollTrigger.update);
      const ctx=gsap.context(()=>{gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>gsap.fromTo(el,{y:22},{y:0,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}}));});
      const visibility=()=>{if(document.hidden)gsap.ticker.remove(tick);else gsap.ticker.add(tick);};document.addEventListener('visibilitychange',visibility);
      cleanup=()=>{document.removeEventListener('visibilitychange',visibility);gsap.ticker.remove(tick);ctx.revert();lenis.destroy();};
    }).catch(()=>{ /* Optional enhancement: native scrolling remains available. */ });
    const move=(e:PointerEvent)=>{if(cursor.current){cursor.current.style.opacity='1';cursor.current.style.transform=`translate3d(${e.clientX-12}px,${e.clientY-12}px,0)`;}};
    window.addEventListener('pointermove',move,{passive:true});
    return()=>{disposed=true;cleanup();window.removeEventListener('pointermove',move);};
  },[path]);
  return <div ref={cursor} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[100] hidden size-6 rounded-full border border-accent/40 opacity-0 transition-opacity duration-200 md:block motion-reduce:hidden"/>;
}
