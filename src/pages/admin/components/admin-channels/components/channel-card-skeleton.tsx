import { Skeleton } from '@/components/ui/skeleton';

export function ChannelCardSkeleton() {
  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <Skeleton className="size-9 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-3 w-16" />
    </li>
  );
}
