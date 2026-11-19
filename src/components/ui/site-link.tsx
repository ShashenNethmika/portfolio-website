import NextLink from 'next/link';
import type {ComponentProps} from 'react';
// Loading an experiment is intentional. Avoid downloading other station bundles
// simply because their navigation links enter the viewport.
export default function SiteLink(props:ComponentProps<typeof NextLink>){return <NextLink prefetch={false} {...props}/>;}
