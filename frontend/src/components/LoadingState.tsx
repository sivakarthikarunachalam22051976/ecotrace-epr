import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading EcoTrace-EPR data...",
}: LoadingStateProps) {
  return (
    <div className="flex min-h-[260px] items-center justify-center">
      <div className="eco-card flex flex-col items-center gap-4 px-8 py-10 text-center">
        <div className="rounded-2xl bg-emerald-400/10 p-4">
          <Loader2
            className="animate-spin text-emerald-400"
            size={28}
          />
        </div>

        <div>
          <p className="font-semibold text-white">
            Synchronizing Platform
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}