import type {Metadata} from 'next';
import LabDashboard from '@/components/lab/lab-dashboard';
export const metadata:Metadata={title:'The Lab — Engineering Playground',alternates:{canonical:'https://shashennethmika.github.io/portfolio-website/lab/'}};
export default function Page(){return <LabDashboard/>;}
