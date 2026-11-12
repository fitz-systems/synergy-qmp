import { brandIconPaths } from "@/constants/brand-icons";
import type { BrandIconName } from "@/types/icons";

interface BrandIconProps {
  name: BrandIconName;
  className?: string;
}

interface SocialIconProps {
  className?: string;
}

export function BrandIcon({ name, className = "size-4" }: BrandIconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d={brandIconPaths[name]}/>
    </svg>
  );
}

export function LinkedInIcon({ className }: SocialIconProps) {
  return <BrandIcon name="linkedin" className={className}/>;
}

export function FacebookIcon({ className }: SocialIconProps) {
  return <BrandIcon name="facebook" className={className}/>;
}
