import Link from '@/components/ui/site-link';
import ContactContent from '@/components/contact/contact-content';
export const metadata={title:'Contact',alternates:{canonical:'https://shashennethmika.github.io/portfolio-website/contact/'}};
export default function Page(){return <><p className="mx-auto max-w-7xl px-6 pt-5 text-sm text-muted">Looking for the new address? <Link href="/contact/" className="text-accent underline">Contact</Link></p><ContactContent/></>;}
