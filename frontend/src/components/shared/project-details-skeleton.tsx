// Skeleton Loader Component (no changes needed here)
const ProjectDetailsSkeleton = () => (
  <div className="min-h-screen p-4 sm:p-6 lg:p-8">
    <div className="mx-auto w-full max-w-4xl animate-pulse">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-8 w-3/4 rounded-md bg-slate-200"></div>
          <div className="h-6 w-16 rounded-full bg-slate-200"></div>
        </div>
        <div className="mt-2 h-4 w-1/3 rounded-md bg-slate-200"></div>
        <div className="my-6 border-t border-slate-200"></div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="h-6 w-1/4 rounded-md bg-slate-200"></div>
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full rounded-md bg-slate-200"></div>
              <div className="h-4 w-full rounded-md bg-slate-200"></div>
              <div className="h-4 w-5/6 rounded-md bg-slate-200"></div>
            </div>
            <div className="mt-8 h-10 w-48 rounded-lg bg-slate-200"></div>
          </div>
          <div className="space-y-4 md:col-span-1">
            <div className="h-20 w-full rounded-lg bg-slate-200"></div>
            <div className="h-20 w-full rounded-lg bg-slate-200"></div>
            <div className="h-20 w-full rounded-lg bg-slate-200"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProjectDetailsSkeleton;
