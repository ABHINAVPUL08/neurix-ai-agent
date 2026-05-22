"use client";

import { memo } from "react";

function ChatShellSkeletonInner() {
  return (
    <div
      className="flex h-[100dvh] max-w-[100vw] flex-col overflow-hidden"
      aria-busy="true"
      aria-label="Loading Neurix"
    >
      <div className="shrink-0 border-b border-purple-500/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="skeleton-shimmer h-9 w-32 rounded-lg" />
          <div className="flex gap-2">
            <div className="skeleton-shimmer h-9 w-24 rounded-lg" />
            <div className="skeleton-shimmer h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-4xl flex-1 space-y-8 lg:max-w-5xl">
          <div className="flex justify-center">
            <div className="skeleton-shimmer h-24 w-24 rounded-full" />
          </div>
          <div className="mx-auto max-w-2xl space-y-3">
            <div className="skeleton-shimmer h-4 w-full rounded-md" />
            <div className="skeleton-shimmer h-4 w-5/6 rounded-md" />
            <div className="skeleton-shimmer h-4 w-2/3 rounded-md" />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="skeleton-shimmer h-9 w-28 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-6 sm:px-6 sm:pb-8">
        <div className="mx-auto max-w-4xl lg:max-w-5xl">
          <div className="skeleton-shimmer h-14 w-full rounded-xl sm:h-16 sm:rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export const ChatShellSkeleton = memo(ChatShellSkeletonInner);
