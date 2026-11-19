import type { Metadata,Viewport } from 'next';
import localFont from 'next/font/local';
import Navigation from '@/components/navigation/navigation';
import Footer from '@/components/layout/footer';
import Experience from '@/components/animations/experience';
import './globals.css';
const space=localFont({src:'../../public/fonts/space-grotesk.woff',variable:'--font-space',display:'swap',weight:'300 700'});
export const metadata:Metadata={metadataBase:new URL('https://shashennethmika.github.io/portfolio-website/'),title:{default:'Shashen Nethmika — Creative Developer',template:'%s | Shashen Nethmika'},description:'ICT undergraduate at the University of Ruhuna. Responsive web experiences, creative media, and an interactive engineering playground.',authors:[{name:'Shashen Nethmika'}],icons:{icon:'/portfolio-website/images/mark.png'},openGraph:{title:'Shashen Nethmika — Creative Developer',description:'Interfaces. Digital systems. Creative media. Explore my work and The Lab.',type:'website',url:'https://shashennethmika.github.io/portfolio-website/',images:[{url:'https://shashennethmika.github.io/portfolio-website/images/profile.webp',width:960,height:960,alt:'Shashen Nethmika'}]},twitter:{card:'summary_large_image',title:'Shashen Nethmika — Creative Developer',images:['https://shashennethmika.github.io/portfolio-website/images/profile.webp']}};
export const viewport:Viewport={themeColor:'#080d16'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={space.variable}><body><a href="#main" className="fixed top-2 left-3 z-[200] -translate-y-24 rounded-lg bg-accent px-5 py-3 text-background focus:translate-y-0">Skip to content</a><Navigation/><main id="main" tabIndex={-1}>{children}</main><Footer/><Experience/></body></html>;}
