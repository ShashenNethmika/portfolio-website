'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Code2 as Github, Play, Pause, RotateCcw, Globe } from 'lucide-react';
import { projects, projectRepo, projectDemo, type Project } from '@/config/portfolio';
import ProjectArt from './project-art';

function FocusTimer() {
  const [remaining,setRemaining]=useState(1500);
  const [running,setRunning]=useState(false);
  const endsAt=useRef(0);
  useEffect(()=>{
    if(!running)return;
    const id=setInterval(()=>{
      const value=Math.max(0,Math.ceil((endsAt.current-Date.now())/1000));
      setRemaining(value);
      if(value===0)setRunning(false);
    },200);
    return()=>clearInterval(id);
  },[running]);
  function toggle(){if(!running){endsAt.current=Date.now()+(remaining||1500)*1000;if(!remaining)setRemaining(1500);}setRunning(!running);}
  return <div className="mt-6 rounded-xl border border-line p-5">
    <p className="text-sm text-muted">Try the focus timer</p>
    <p role="timer" className="my-4 font-mono text-4xl text-accent">{String(Math.floor(remaining/60)).padStart(2,'0')}:{String(remaining%60).padStart(2,'0')}</p>
    <div className="flex gap-3">
      <button className="lab-button flex items-center gap-2" onClick={toggle}>{running?<Pause size={15}/>:<Play size={15}/>}{running?'Pause':'Start'}</button>
      <button className="lab-button flex items-center gap-2" onClick={()=>{setRunning(false);setRemaining(1500);}}><RotateCcw size={15}/>Reset</button>
    </div>
  </div>;
}

export default function ProjectGrid({headingLevel=3}:{headingLevel?:2|3}){
  const ProjectHeading=headingLevel===2?'h2':'h3';
  const [filter,setFilter]=useState('all');
  const [selected,setSelected]=useState<Project|null>(null);
  const dialog=useRef<HTMLDialogElement>(null);
  const [palette,setPalette]=useState('lilac');
  const reduced=useReducedMotion();
  function open(p:Project){setSelected(p);setPalette('lilac');dialog.current?.showModal();}
  function close(){dialog.current?.close();setSelected(null);}
  const visible=projects.filter(p=>filter==='all'||p.category===filter);
  return <>
    <div role="group" aria-label="Filter projects" className="mb-8 flex flex-wrap gap-2">
      {([['all','All work'],['web','Web apps'],['creative','Creative UI']] as const).map(([v,l])=><button key={v} onClick={()=>setFilter(v)} aria-pressed={filter===v} className={`rounded-full border px-5 py-2 text-sm transition-colors ${filter===v?'border-accent/50 bg-accent/10 text-accent':'border-line text-muted hover:text-white'}`}>{l}</button>)}
    </div>
    <p role="status" className="sr-only">{visible.length} projects shown</p>
    <div className="grid gap-x-7 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {visible.map(p=><motion.article key={p.slug} layout={!reduced} initial={{opacity:1,y:reduced?0:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.25}} className="group min-w-0">
          <button onClick={()=>open(p)} className="block w-full text-left">
            <div className="transition-transform duration-500 group-hover:-translate-y-1"><ProjectArt project={p}/></div>
            <div id={`project-type-${p.slug}`} className="mt-5 flex items-center gap-2 text-xs text-muted"><span className="h-px w-5" style={{background:p.color}}/>{p.type}</div>
            <ProjectHeading id={`project-${p.slug}`} className="mt-2 text-xl tracking-tight group-hover:text-accent">{p.name}</ProjectHeading>
          </button>
          <p className="mt-3 text-sm leading-6 text-muted">{p.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">{p.tech.map(t=><span key={t} className="rounded border border-line px-2 py-1 text-xs text-slate-300">{t}</span>)}</div>
          <div className="mt-5 flex gap-5">
            <a href={projectRepo(p)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-accent"><Github size={15}/>{p.repo?'Repository':'GitHub profile'}</a>
            {projectDemo(p)&&<a href={projectDemo(p)!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-accent"><Globe size={15}/>Live demo</a>}
          </div>
        </motion.article>)}
      </AnimatePresence>
    </div>
    <dialog ref={dialog} aria-labelledby="project-dialog-title" onCancel={close} onClick={e=>{if(e.target===dialog.current)close();}} className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,720px)] overflow-auto rounded-2xl border border-line bg-[#101925] p-5 text-foreground sm:p-8">
      {selected&&<>
        <div className="mb-5 flex items-start justify-between gap-5">
          <div><p className="mb-2 text-sm text-accent">Project explorer</p><h2 id="project-dialog-title" className="text-2xl font-medium">{selected.name}</h2></div>
          <button autoFocus onClick={close} aria-label="Close project details" className="rounded-lg p-2 hover:bg-white/10"><X/></button>
        </div>
        <ProjectArt project={selected} palette={palette}/>
        <p className="mt-6 leading-7 text-muted">{selected.description}</p>
        <dl className="mt-6 space-y-5"><div><dt className="mb-1 font-medium">The idea</dt><dd className="leading-7 text-muted">{selected.goal}</dd></div><div><dt className="mb-1 font-medium">The approach</dt><dd className="leading-7 text-muted">{selected.approach}</dd></div></dl>
        {selected.art==='lantern'&&<div className="mt-5 flex items-center gap-3"><span className="text-sm">Try a palette</span>{['lilac','amber'].map(v=><button key={v} aria-pressed={palette===v} onClick={()=>setPalette(v)} className="lab-button capitalize">{v}</button>)}</div>}
        {selected.art==='timer'&&<FocusTimer/>}
        <div className="mt-6 flex flex-wrap gap-3"><a className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-background" href={projectRepo(selected)} target="_blank" rel="noreferrer"><Github size={18}/>View on GitHub</a>{projectDemo(selected)&&<a className="lab-button inline-flex items-center gap-2" href={projectDemo(selected)!} target="_blank" rel="noreferrer"><Globe size={18}/>Open live demo</a>}</div>
      </>}
    </dialog>
  </>;
}
