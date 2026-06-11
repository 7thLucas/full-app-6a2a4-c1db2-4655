import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  type Freshness,
  FRESHNESS_META,
  initials,
  lastTouchLabel,
  daysSince,
} from "~/lib/crm";

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name) || "?"}
    </div>
  );
}

// ── Freshness dot + chip ────────────────────────────────────────────────────────
export function FreshnessDot({ freshness }: { freshness: Freshness }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", FRESHNESS_META[freshness].dot)} />;
}

export function FreshnessChip({
  freshness,
  lastTouchAt,
}: {
  freshness: Freshness;
  lastTouchAt: string | null | undefined;
}) {
  const meta = FRESHNESS_META[freshness];
  const d = daysSince(lastTouchAt);
  const detail = freshness === "never" ? "Never" : `${lastTouchLabel(lastTouchAt)}`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset tabular-nums",
        meta.chipBg,
        meta.chipText,
        meta.ring,
      )}
      title={d === null ? "No interaction logged yet" : `${d} days since last touch`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
      <span className="opacity-60">· {detail}</span>
    </span>
  );
}

// ── Button ──────────────────────────────────────────────────────────────────────
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-2.5 py-1.5 text-[13px]" : "px-3.5 py-2 text-[14px]",
        variant === "primary" && "bg-primary text-white shadow-sm hover:brightness-110 active:brightness-95",
        variant === "outline" && "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
        variant === "ghost" && "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
        variant === "danger" && "bg-red-500 text-white shadow-sm hover:bg-red-600",
        className,
      )}
      {...props}
    />
  );
}

// ── Input / textarea / select ──────────────────────────────────────────────────
export const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-zinc-600">{label}</span>
      {children}
    </label>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-zinc-900/30 backdrop-blur-[2px] animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl duration-150 animate-in slide-in-from-bottom-4 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
          <h2 className="text-[15px] font-semibold text-zinc-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50/60 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-zinc-800">{title}</h3>
      <p className="mt-1 max-w-sm text-[13.5px] text-zinc-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-zinc-100", className)} />;
}
