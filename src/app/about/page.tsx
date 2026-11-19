import type {Metadata} from 'next';
import AboutContent from '@/components/about/about-content';
export const metadata:Metadata={title:'About',alternates:{canonical:'https://shashennethmika.github.io/portfolio-website/about/'}};
export default function Page(){return <><div className="mx-auto max-w-[1400px] px-6 pt-16 sm:px-9 lg:px-14"><h1 className="text-5xl tracking-tight">The person behind the pixels<span className="text-accent">.</span></h1></div><AboutContent/></>;}
