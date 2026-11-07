import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminSkeletonRows } from "@/constants/admin";

export function AdminPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40"/>
        <Skeleton className="h-8 w-56"/>
        <Skeleton className="h-4 w-80 max-w-full"/>
      </div>
      <Card className="gap-0 overflow-hidden py-0">
        {Array.from({ length: adminSkeletonRows }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="h-4 flex-1"/>
            <Skeleton className="hidden h-4 w-32 sm:block"/>
            <Skeleton className="hidden h-4 w-24 md:block"/>
          </div>
        ))}
      </Card>
    </div>
  );
}
