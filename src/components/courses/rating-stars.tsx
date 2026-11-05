import { Star } from "lucide-react";
import { ratingMax } from "@/constants/courses";

interface RatingStarsProps {
  rating: number;
  label: string;
  size?: "sm" | "md";
}

export function RatingStars({ rating, label, size = "sm" }: RatingStarsProps) {
  const filled = Math.round(rating);

  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-0.5">
      {Array.from({ length: ratingMax }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          strokeWidth={1.75}
          className={`${size === "md" ? "size-5" : "size-4"} ${index < filled ? "fill-brand text-brand" : "text-line-strong"}`}
        />
      ))}
    </span>
  );
}
