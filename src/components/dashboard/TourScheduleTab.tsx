import React from "react";

export function TourScheduleTab() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Tour schedule
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your upcoming property visits and booking details will appear here.
          </p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          Coming soon
        </div>
      </div>
    </div>
  );
}

export default TourScheduleTab;
