import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Unable to connect to the EcoTrace-EPR backend.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[260px] items-center justify-center">
      <div className="eco-card max-w-md p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertTriangle
            size={28}
            className="text-red-400"
          />
        </div>

        <h3 className="mt-5 text-lg font-bold text-white">
          Connection Issue
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {message}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="eco-button-secondary mt-6 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}