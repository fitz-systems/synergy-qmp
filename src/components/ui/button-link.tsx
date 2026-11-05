import Link from "next/link";

import { ArrowRight } from "lucide-react";

const variants = {
  primary: "bg-brand text-ink hover:bg-brand-hover",
  dark: "bg-ink text-canvas hover:bg-night",
  outlineLight: "border border-canvas/40 text-canvas hover:border-canvas hover:bg-canvas hover:text-ink"
}

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  arrow?: boolean;
  className?: string;
}

export function ButtonLink({ href, children, variant = "primary", arrow = false, className = "" }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-base font-semibold transition-[background-color,color,border-color,transform] duration-200 ease-out-expo active:translate-y-px ${variants[variant]} ${className}`}
    >
      {children}
      {arrow && <ArrowRight aria-hidden className="size-4" strokeWidth={2}/>}
    </Link>
  );
}
