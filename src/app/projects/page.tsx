import type {Metadata} from 'next';
import ProjectGrid from '@/components/projects/project-grid';
export const metadata:Metadata={title:'Projects',alternates:{canonical:'https://shashennethmika.github.io/portfolio-website/projects/'}};
export default function Page(){return <section className="mx-auto max-w-[1400px] px-6 py-20 sm:px-9 lg:px-14"><p className="mb-5 font-mono text-sm uppercase tracking-widest text-accent">The portfolio</p><h1 className="text-5xl tracking-[-.05em] sm:text-7xl">Selected work<span className="text-accent">.</span></h1><p className="mt-6 mb-12 max-w-xl leading-7 text-muted">Web layouts, study tools, and experiments in visual storytelling. Explore an idea, try a preview, or look under the hood.</p><ProjectGrid headingLevel={2}/></section>;}
