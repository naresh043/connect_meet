import { Skeleton } from "@/components/ui/skeleton";

const MeetingCardSkeleton = () => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        sm:p-5
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* LEFT */}

        <div className="flex items-start gap-4">
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>

            <Skeleton className="h-3 w-28 rounded" />
          </div>
        </div>

        {/* BUTTON */}

        <Skeleton className="h-10 w-full rounded-xl sm:w-32" />
      </div>
    </div>
  );
};

export default MeetingCardSkeleton;
