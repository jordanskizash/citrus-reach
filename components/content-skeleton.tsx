// components/content-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export const ContentSkeleton = () => {
  return (
    <div className="min-h-screen w-full bg-white"> {/* Full viewport height */}
      <div className="w-full space-y-6 animate-pulse">
        {/* Hero section */}
        <div className="space-y-4 py-8">
          <Skeleton className="h-8 w-3/4 bg-gray-200" /> {/* Title */}
          <Skeleton className="h-6 w-1/2 bg-gray-200" /> {/* Subtitle */}
        </div>

        {/* Content sections - multiple to fill viewport */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-[95%] bg-gray-200" />
          <Skeleton className="h-4 w-[90%] bg-gray-200" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3 bg-gray-200" /> {/* Subheading */}
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-[92%] bg-gray-200" />
          <Skeleton className="h-4 w-[88%] bg-gray-200" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-[94%] bg-gray-200" />
          <Skeleton className="h-4 w-[89%] bg-gray-200" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3 bg-gray-200" /> {/* Subheading */}
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-[91%] bg-gray-200" />
          <Skeleton className="h-4 w-[87%] bg-gray-200" />
        </div>

        {/* Add more sections to ensure viewport fill */}
        <div className="space-y-4 pb-20">
          <Skeleton className="h-4 w-full bg-gray-200" />
          <Skeleton className="h-4 w-[93%] bg-gray-200" />
          <Skeleton className="h-4 w-[88%] bg-gray-200" />
        </div>
      </div>
    </div>
  );
};