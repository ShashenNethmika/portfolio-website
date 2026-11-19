import {readdir,copyFile,access} from 'node:fs/promises';
import path from 'node:path';
// Next 16's segment prefetch URLs are flat; its export writes some payloads into
// nested __next.* directories. Static hosts cannot rewrite those URLs. Publish
// aliases alongside the original payloads so navigation needs no server.
const root=path.resolve('out');
let aliases=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())await walk(file);
  else if(entry.name.endsWith('.txt')){
    const pieces=path.relative(root,file).split(path.sep);
    const index=pieces.findIndex(part=>part.startsWith('__next.'));
    if(index<0||index===pieces.length-1)continue;
    const target=path.join(root,...pieces.slice(0,index),pieces.slice(index).join('.'));
    try{await access(target);}catch{await copyFile(file,target);aliases++;}
  }
}}
await walk(root);
process.stdout.write(`Prepared ${aliases} static navigation payload aliases.\n`);
