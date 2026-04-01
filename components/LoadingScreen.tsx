"use client";

type LoadingScreenProps = {
  label?: string;
  fullPage?: boolean;
};

export function LoadingScreen({
  label = "Loading",
  fullPage = false,
}: LoadingScreenProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullPage ? "min-h-[calc(100vh-4rem)]" : "min-h-[280px]"
      }`}
    >
      <div className="flex flex-col items-center gap-4 text-[var(--muted)]">
        <div className="flex items-center gap-3">
          <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-[var(--muted)]" />
          <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:120ms]" />
          <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:240ms]" />
        </div>
        <p className="text-sm tracking-[0.08em] text-[var(--muted)]">{label}</p>
      </div>
    </div>
  );
}
