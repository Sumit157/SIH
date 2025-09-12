import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2">
            <Skeleton className="h-[450px] w-full" />
        </div>
        <div className="lg:col-span-3">
          <div className="space-y-6 rounded-xl border bg-card p-6 shadow">
            <Skeleton className="h-8 w-1/2" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
