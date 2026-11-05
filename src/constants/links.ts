import { Mail } from "lucide-react";
import type { ComponentType } from "react";
import { FacebookIcon, LinkedInIcon } from "@/components/icons/social-icons";
import type { ShareLink } from "@/types/courses";

export const externalLinks = {
  camrt: "https://www.camrt.ca/"
}

export const shareEndpoints = {
  linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=",
  facebook: "https://www.facebook.com/sharer/sharer.php?u="
}

export const shareIcons: Record<ShareLink["key"], ComponentType<{ className?: string }>> = {
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  email: Mail
}
