'use client';
import {useEffect,useRef,useState} from 'react';
import {computeGate,type Circuit,type Gate,type Signal} from './engine';
export const signalChallenges=[
  {name:'Power the relay',gates:['AND','OR','AND'],active:3,hint:'AND needs A and B. OR needs C or D.'},
  {name:'Split the signal',gates:['XOR','NAND','AND'],active:2,hint:'Make the first pair differ and keep the second NAND on.'},
  {name:'Invert the output',gates:['OR','AND','XOR'],active:3,hint:'The final XOR needs exactly one branch high.'},
  {name:'Balance both branches',gates:['XOR','XOR','NOR'],active:2,hint:'Make both XOR branches low using matching pairs.'},
] as const;
export function classicCircuit(level:number,values:Signal[]):Circuit{
  const challenge=signalChallenges[level];
  return {version:1,nodes:[
    ...['a','b','c','d'].map((id,i)=>({id,name:id.toUpperCase(),kind:'INPUT' as const,value:values[i],inputs:[],x:30,y:20+i*130})),
    {id:'left',name:'Left branch',kind:challenge.gates[0],value:0,inputs:['a','b'],x:300,y:80},
    {id:'right',name:'Right branch',kind:challenge.gates[1],value:0,inputs:['c','d'],x:300,y:340},
    {id:'final',name:'Final gate',kind:challenge.gates[2],value:0,inputs:['left','right'],x:560,y:210},
    {id:'out',name:'Output',kind:'OUTPUT',value:0,inputs:['final'],x:800,y:210},
  ]};
}
export default function SignalChallenges({onOpen}:{onOpen:(c:Circuit)=>void}){
  const [level,setLevel]=useState(0),[bits,setBits]=useState<Signal[]>([0,0,0,0]),[solved,setSolved]=useState<number[]>([]),[sound,setSound]=useState(false);
  const audio=useRef<AudioContext|null>(null);
  useEffect(()=>()=>{void audio.current?.close();},[]);
  const challenge=signalChallenges[level];
  const left=computeGate(challenge.gates[0] as Gate,bits.slice(0,2)),right=computeGate(challenge.gates[1] as Gate,bits.slice(2));
  const output=computeGate(challenge.gates[2] as Gate,[left,right]);
  const active=bits.reduce<number>((sum,bit)=>sum+bit,0),passed=output===1&&active===challenge.active;
  useEffect(()=>{try{const old=JSON.parse(localStorage.getItem('shashen-portfolio.signal-lab.v1')||'[]');if(Array.isArray(old))setSolved(old.filter(v=>Number.isInteger(v)&&v>=0&&v<4));}catch{/* Optional local progress. */}},[]);
  useEffect(()=>{if(!passed)return;setSolved(old=>{const next=[...new Set([...old,level])];try{localStorage.setItem('shashen-portfolio.signal-lab.v1',JSON.stringify(next));}catch{/* In-memory progress stays available. */}return next;});window.dispatchEvent(new CustomEvent('lab:challenge',{detail:{station:'logic-circuit',id:`signal-${level}`}}));},[passed,level]);
  function toggle(i:number){setBits(old=>old.map((v,j)=>j===i?(1-v) as Signal:v));if(sound){try{const ctx=audio.current??new AudioContext();audio.current=ctx;void ctx.resume();const tone=ctx.createOscillator(),volume=ctx.createGain();tone.connect(volume);volume.connect(ctx.destination);tone.frequency.value=440+i*90;volume.gain.setValueAtTime(.025,ctx.currentTime);volume.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.06);tone.start();tone.stop(ctx.currentTime+.07);}catch{setSound(false);}}}
  return <section className="panel space-y-5 p-5 sm:p-7" aria-labelledby="classic-challenges"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-sm text-accent">From the original Signal Lab</p><h2 id="classic-challenges" className="text-xl">Four circuits. One signal.</h2></div><span className="text-sm text-muted">{solved.length} of 4 solved</span></div><div className="flex flex-wrap gap-2">{signalChallenges.map((c,i)=><button key={c.name} aria-pressed={level===i} className="lab-button" onClick={()=>{setLevel(i);setBits([0,0,0,0]);}}>{c.name}{solved.includes(i)?' ✓':''}</button>)}</div><p className="text-sm leading-6 text-muted">Turn the output on with exactly {challenge.active} inputs active. {challenge.hint}</p><div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]"><div className="grid grid-cols-2 gap-2">{bits.map((v,i)=><button key={i} className={`lab-button ${v?'!border-accent !text-accent':''}`} aria-pressed={v===1} onClick={()=>toggle(i)}>Signal {String.fromCharCode(65+i)}: {v}</button>)}</div><div className="grid grid-cols-2 items-center gap-3 font-mono text-sm"><span className="rounded-lg border border-line p-4">{challenge.gates[0]}: {left}</span><span className="rounded-lg border border-line p-4">{challenge.gates[1]}: {right}</span></div><div className="grid place-content-center rounded-lg border border-accent/30 p-4 font-mono text-accent">{challenge.gates[2]} → Output {output}</div></div><p role="status" className="text-sm text-accent">{passed?'Circuit solved.':`${active} of ${challenge.active} required inputs active. Signal ${output?'on':'off'}.`}</p><div className="flex flex-wrap gap-3"><button className="lab-button" onClick={()=>onOpen(classicCircuit(level,bits))}>Open this circuit in builder</button><button className="lab-button" aria-pressed={sound} onClick={()=>setSound(!sound)}>Sound {sound?'on':'off'}</button></div></section>;
}
