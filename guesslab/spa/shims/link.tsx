import type { AnchorHTMLAttributes, ReactNode } from "react";
import { pathToHash } from "../route";

/** Stand-in for next/link in the static build: renders a hash link. */
export default function Link({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode; prefetch?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { prefetch, ...props } = rest as typeof rest & { prefetch?: boolean };
  return (
    <a href={pathToHash(href)} {...props}>
      {children}
    </a>
  );
}
