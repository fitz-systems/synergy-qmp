import { shareEndpoints } from "@/constants/links";
import type { ShareLink } from "@/types/courses";

export function buildShareLinks(url: string, title: string): ShareLink[] {
  const encodedUrl = encodeURIComponent(url);
  return [
    { key: "linkedin", href: `${shareEndpoints.linkedin}${encodedUrl}`, external: true },
    { key: "facebook", href: `${shareEndpoints.facebook}${encodedUrl}`, external: true },
    { key: "email", href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedUrl}`, external: false }
  ];
}
