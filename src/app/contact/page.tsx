import type {Metadata} from 'next';
import ContactContent from '@/components/contact/contact-content';
export const metadata:Metadata={title:'Contact',alternates:{canonical:'https://shashennethmika.github.io/portfolio-website/contact/'}};
export default function Page(){return <ContactContent/>;}
