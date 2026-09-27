import { cn } from "@/lib/utils";
import { CheckCircle2, FileEdit, Lock, ShieldAlert, Sparkles } from "lucide-react";

interface StatusBadgeProps {
  status: "draft" | "submitted" | "locked" | "open" | "closed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "submitted":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-sm",
            className
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Submitted</span>
        </span>
      );
    case "draft":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-sm",
            className
          )}
        >
          <FileEdit className="w-3.5 h-3.5 text-amber-400" />
          <span>Draft</span>
        </span>
      );
    case "locked":
    case "closed":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-sm",
            className
          )}
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span>Locked</span>
        </span>
      );
    case "open":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm",
            className
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Submissions Open</span>
        </span>
      );
  }
}

export function TrackBadge({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-500/30",
        className
      )}
    >
      {name}
    </span>
  );
}
