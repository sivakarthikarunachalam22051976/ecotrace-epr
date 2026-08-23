import {
  Inbox,
} from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
}

export default function EmptyState({
  title,
  message,
}: EmptyStateProps) {
  return (
    <div className="eco-card flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
      <div className="rounded-2xl bg-emerald-400/10 p-4">
        <Inbox
          size={28}
          className="text-emerald-400"
        />
      </div>

      <h3 className="mt-4 font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-400">
        {message}
      </p>
    </div>
  );
}