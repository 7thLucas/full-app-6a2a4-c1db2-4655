/**
 * Shared CRM types + freshness helpers used across the client UI.
 */

export type Stage = {
  _id: string;
  name: string;
  color: string;
  order: number;
};

export type Contact = {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  stageId: string;
  stageOrder: number;
  lastTouchAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InteractionType = "call" | "email" | "note" | "meeting";

export type Interaction = {
  _id: string;
  contactId: string;
  type: InteractionType;
  note: string;
  occurredAt: string;
  createdAt: string;
};

export type Freshness = "never" | "fresh" | "warm" | "cold";

export type Thresholds = { warm: number; cold: number };

export function daysSince(date: string | null | undefined): number | null {
  if (!date) return null;
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

export function freshnessOf(
  lastTouchAt: string | null | undefined,
  thresholds: Thresholds,
): Freshness {
  const d = daysSince(lastTouchAt);
  if (d === null) return "never";
  if (d >= thresholds.cold) return "cold";
  if (d >= thresholds.warm) return "warm";
  return "fresh";
}

/** Tailwind-friendly token bundle per freshness, used for dots, chips and rows. */
export const FRESHNESS_META: Record<
  Freshness,
  { label: string; dot: string; chipBg: string; chipText: string; ring: string }
> = {
  never: {
    label: "No contact yet",
    dot: "bg-zinc-400",
    chipBg: "bg-zinc-100",
    chipText: "text-zinc-600",
    ring: "ring-zinc-200",
  },
  fresh: {
    label: "Fresh",
    dot: "bg-emerald-500",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  warm: {
    label: "Cooling",
    dot: "bg-amber-500",
    chipBg: "bg-amber-50",
    chipText: "text-amber-700",
    ring: "ring-amber-200",
  },
  cold: {
    label: "Cold",
    dot: "bg-red-500",
    chipBg: "bg-red-50",
    chipText: "text-red-700",
    ring: "ring-red-200",
  },
};

export function lastTouchLabel(lastTouchAt: string | null | undefined): string {
  const d = daysSince(lastTouchAt);
  if (d === null) return "Never";
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  const months = Math.floor(d / 30);
  if (months < 12) return `${months} mo ago`;
  const years = Math.floor(d / 365);
  return `${years} yr ago`;
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const INTERACTION_META: Record<
  InteractionType,
  { label: string; verb: string }
> = {
  call: { label: "Call", verb: "Called" },
  email: { label: "Email", verb: "Emailed" },
  note: { label: "Note", verb: "Noted" },
  meeting: { label: "Meeting", verb: "Met with" },
};

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
