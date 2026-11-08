import Image from "next/image";
import logo from "@/assets/images/logo.png";
import logoReversed from "@/assets/images/logo-reversed.png";

import { cn } from "@/lib/helpers/class-names";

interface AdminLogoProps {
  className?: string;
  priority?: boolean;
}

export function AdminLogo({ className, priority }: AdminLogoProps) {
  return (
    <>
      <Image src={logo} alt="Synergy QMP" priority={priority} className={cn("w-auto dark:hidden", className)}/>
      <Image src={logoReversed} alt="Synergy QMP" priority={priority} className={cn("hidden w-auto dark:block", className)}/>
    </>
  );
}
