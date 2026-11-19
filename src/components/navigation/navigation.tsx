'use client';
import Link from '@/components/ui/site-link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, FlaskConical } from 'lucide-react';

const links=[['Home','/','hero'],['Work','/projects/','projects'],['The Lab','/lab/','lab'],['About','/about/','about'],['Contact','/contact/','contact']] as const;

export default function Navigation(){
  const pathname=usePathname() || '/';
  const path=pathname==='/'?'/':pathname.replace(/\/$/,'')+'/';
  const [open,setOpen]=useState(false);
  const [section,setSection]=useState('hero');
  const toggle=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&open){setOpen(false);toggle.current?.focus();}};
    document.addEventListener('keydown',escape);
    return()=>document.removeEventListener('keydown',escape);
  },[open]);
  useEffect(()=>{
    if(path!=='/')return;
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)setSection(entry.target.id==='skills'?'about':entry.target.id);
    },{rootMargin:'-80px 0px -65% 0px',threshold:0});
    for(const id of ['hero','projects','lab','about','skills','contact']){const el=document.getElementById(id);if(el)observer.observe(el);}
    return()=>observer.disconnect();
  },[path]);
  const active=(url:string,id:string)=>path==='/'?section===id:path===url||url!=='/'&&path.startsWith(url);
  const target=(url:string)=>path==='/'&&url==='/projects/'?'/#projects':path==='/'&&url==='/about/'?'/#about':url;
  return <header className="sticky top-0 z-50 border-b border-line/70 bg-background/95 backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 sm:px-9 lg:px-14">
      <Link href="/" title="Shashen Nethmika home" className="flex items-center gap-3"><span aria-hidden="true" className="grid size-9 place-items-center rounded-lg border border-accent/40 font-mono text-sm text-accent">SN</span><span className="text-lg font-semibold tracking-tight">shashen<span className="text-accent">.</span></span></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-9 md:flex">
        {links.map(([title,url,id])=><Link key={url} href={target(url)} aria-current={active(url,id)?path==='/'?'location':'page':undefined} className={`relative py-2 text-sm transition-colors hover:text-accent ${active(url,id)?'text-accent after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:bg-accent':'text-muted'}`}>{title}</Link>)}
      </nav>
      <Link href="/lab/" className="hidden items-center gap-2 rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-accent/60 md:flex"><FlaskConical size={15} className="text-accent"/>Enter the playground</Link>
      <button ref={toggle} className="rounded-lg p-3 md:hidden" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="mobile-nav" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<nav id="mobile-nav" aria-label="Mobile navigation" className="grid gap-1 border-t border-line p-5 md:hidden">
      {links.map(([title,url,id])=><Link key={url} href={target(url)} onClick={()=>setOpen(false)} aria-current={active(url,id)?'page':undefined} className="rounded-lg p-3 hover:bg-surface">{title}</Link>)}
    </nav>}
  </header>;
}
