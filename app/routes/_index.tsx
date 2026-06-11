import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Snowflake, Sparkles, Flame, ArrowRight, Plus } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { AppShell } from "~/components/crm/app-shell";
import { Avatar, Button, EmptyState, FreshnessChip, Skeleton } from "~/components/crm/ui";
import { ContactForm } from "~/components/crm/contact-form";
import { LogInteraction } from "~/components/crm/log-interaction";
import { useCrmBoard, useThresholds } from "~/components/crm/use-crm";
import { freshnessOf, lastTouchLabel, type Contact } from "~/lib/crm";
import { cn } from "~/lib/utils";

export default function DashboardRoute() {
  const { config } = useConfigurables();
  const thresholds = useThresholds();
  const { stages, contacts, loading, refetch } = useCrmBoard();
  const [adding, setAdding] = useState(false);
  const [logFor, setLogFor] = useState<Contact | null>(null);

  const stageName = useMemo(() => {
    const m: Record<string, { name: string; color: string }> = {};
    stages.forEach((s) => (m[s._id] = { name: s.name, color: s.color }));
    return m;
  }, [stages]);

  const { cold, warm, fresh } = useMemo(() => {
    const buckets = { cold: [] as Contact[], warm: [] as Contact[], fresh: [] as Contact[] };
    for (const c of contacts) {
      const f = freshnessOf(c.lastTouchAt, thresholds);
      if (f === "cold" || f === "never") buckets.cold.push(c);
      else if (f === "warm") buckets.warm.push(c);
      else buckets.fresh.push(c);
    }
    return buckets;
  }, [contacts, thresholds]);

  const heading = config?.dashboardHeading || "Today";
  const subheading =
    config?.dashboardSubheading || "The people who need a follow-up before they slip away.";
  const emptyMsg =
    config?.emptyStateMessage ||
    "Nothing's cold right now. Every relationship is warm — nice work.";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{heading}</h1>
          <p className="mt-1 text-[14px] text-zinc-500">{subheading}</p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> New contact
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Need follow-up" value={cold.length} tone="cold" icon={<Snowflake className="h-4 w-4" />} />
        <StatCard label="Cooling off" value={warm.length} tone="warm" icon={<Flame className="h-4 w-4" />} />
        <StatCard label="Fresh" value={fresh.length} tone="fresh" icon={<Sparkles className="h-4 w-4" />} />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : cold.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-5 w-5" />}
          title="All caught up"
          description={emptyMsg}
          action={
            <Link to="/contacts">
              <Button variant="outline">View all contacts</Button>
            </Link>
          }
        />
      ) : (
        <section>
          <div className="mb-2.5 flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-wide text-red-600">
            <Snowflake className="h-3.5 w-3.5" />
            Going cold
          </div>
          <ul className="space-y-2">
            {cold.map((c) => {
              const f = freshnessOf(c.lastTouchAt, thresholds);
              const st = stageName[c.stageId];
              return (
                <li
                  key={c._id}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border bg-white px-3.5 py-3 shadow-sm transition-all hover:shadow-md",
                    f === "never" ? "border-zinc-200" : "border-red-100",
                  )}
                >
                  <Avatar name={c.name} />
                  <Link to={`/contacts/${c._id}`} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14.5px] font-semibold text-zinc-900">{c.name}</span>
                      {st && (
                        <span
                          className="hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-white sm:inline"
                          style={{ backgroundColor: st.color }}
                        >
                          {st.name}
                        </span>
                      )}
                    </div>
                    <span className="block truncate text-[13px] text-zinc-500">
                      {c.company || "No company"} · last touch {lastTouchLabel(c.lastTouchAt).toLowerCase()}
                    </span>
                  </Link>
                  <FreshnessChip freshness={f} lastTouchAt={c.lastTouchAt} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => setLogFor(c)}
                  >
                    {config?.logInteractionLabel || "Log interaction"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ContactForm
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={refetch}
        stages={stages}
      />
      {logFor && (
        <LogInteraction
          open={!!logFor}
          onClose={() => setLogFor(null)}
          onLogged={refetch}
          contactId={logFor._id}
          contactName={logFor.name}
        />
      )}
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "cold" | "warm" | "fresh";
  icon: React.ReactNode;
}) {
  const tones = {
    cold: "text-red-600 bg-red-50",
    warm: "text-amber-600 bg-amber-50",
    fresh: "text-emerald-600 bg-emerald-50",
  };
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className={cn("mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg", tones[tone])}>
        {icon}
      </div>
      <div className="text-2xl font-semibold tabular-nums text-zinc-900">{value}</div>
      <div className="text-[12.5px] text-zinc-500">{label}</div>
    </div>
  );
}
