// Skeleton loader placeholders for loading states

export const CardSkeleton = () => (
  <div className="card card-body space-y-3 animate-pulse">
    <div className="flex justify-between">
      <div className="skeleton h-5 w-24 rounded-full" />
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
    <div className="skeleton h-4 w-full" />
    <div className="skeleton h-4 w-3/4" />
    <div className="skeleton h-3 w-1/2" />
    <div className="flex gap-2">
      <div className="skeleton h-5 w-14 rounded-full" />
      <div className="skeleton h-5 w-14 rounded-full" />
    </div>
    <div className="border-t border-dark-700 pt-3 flex justify-between">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-3 w-16" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="card card-body animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="skeleton h-4 w-28" />
      <div className="skeleton w-9 h-9 rounded-lg" />
    </div>
    <div className="skeleton h-8 w-16" />
    <div className="skeleton h-3 w-24 mt-1" />
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="skeleton h-4 w-full animate-pulse" />
      </td>
    ))}
  </tr>
);

export const DetailSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="skeleton h-8 w-3/4" />
    <div className="skeleton h-52 w-full rounded-xl" />
    <div className="space-y-2">
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-2/3" />
    </div>
  </div>
);
