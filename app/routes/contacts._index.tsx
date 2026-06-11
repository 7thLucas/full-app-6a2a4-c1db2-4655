import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Users, ArrowUpDown } from "lucide-react";
import { AppShell } from "~/components/crm/app-shell";
import { Avatar, Button, EmptyState, FreshnessChip, inputCls, Skeleton } from "~/components/crm/ui";
import { ContactForm } from "~/components/crm/contact-form";
import { useCrmBoard, useThresholds } from "~/components/crm/use-crm";
import { freshnessOf, daysSince, lastTouchLabel, type Contact } from "~/lib/crm";

type SortKey = "cold" | "name" | "company";

export default function ContactsRoute() {
  const thresholds = useThresholds();
  const { stages, contacts, loading, refetch } = useCrmBoard();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("cold");
  const [adding, setAdding] = useState(false);

  const stageName = useMemo(() => {
    const m: Record<string, { name: string; color: string }> = {};
    stages.forEach((s) => (m[s._id] = { name: s.name, color: s.color }));
    return m;
  }, [stages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = contacts.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q),
    );
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "company") return (a.company || "").localeCompare(b.company || "");
      // cold first: higher days-since (or never) ranks first
      const da = daysSince(a.lastTouchAt);
      const db = daysSince(b.lastTouchAt);
      const va = da === null ? Number.MAX_SAFE_INTEGER : da;
      const vb = db === null ? Number.MAX_SAFE_INTEGER : db;
      return vb - va;
    });
    return list;
  }, [contacts, query, sort]);

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Contacts</h1>
          <p className="mt-1 text-[14px] text-zinc-500">
            {contacts.length} {contacts.length === 1 ? "relationship" : "relationships"}, sorted by who needs attention.
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> New contact
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className={inputCls + " pl-9"}
            placeholder="Search name or company…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-0.5">
          <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-zinc-400" />
          {(["cold", "name", "company"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={
                "rounded-md px-2.5 py-1.5 text-[12.5px] font-medium capitalize transition-colors " +
                (sort === k ? "bg-primary/10 text-primary" : "text-zinc-500 hover:text-zinc-800")
              }
            >
              {k === "cold" ? "Coldest" : k}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title={contacts.length === 0 ? "No contacts yet" : "No matches"}
          description={
            contacts.length === 0
              ? "Add the first person you want to keep warm."
              : "Try a different search."
          }
          action={
            contacts.length === 0 ? (
              <Button onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4" /> Add contact
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {filtered.map((c, i) => {
            const f = freshnessOf(c.lastTouchAt, thresholds);
            const st = stageName[c.stageId];
            return (
              <li key={c._id} className={i > 0 ? "border-t border-zinc-100" : ""}>
                <Link
                  to={`/contacts/${c._id}`}
                  className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-zinc-50"
                >
                  <Avatar name={c.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14.5px] font-semibold text-zinc-900">{c.name}</span>
                      {st && (
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                          style={{ backgroundColor: st.color }}
                        >
                          {st.name}
                        </span>
                      )}
                    </div>
                    <span className="block truncate text-[13px] text-zinc-500">
                      {c.company || "No company"}
                    </span>
                  </div>
                  <span className="hidden text-right text-[12.5px] tabular-nums text-zinc-400 sm:block">
                    {lastTouchLabel(c.lastTouchAt)}
                  </span>
                  <FreshnessChip freshness={f} lastTouchAt={c.lastTouchAt} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <ContactForm open={adding} onClose={() => setAdding(false)} onSaved={refetch} stages={stages} />
    </AppShell>
  );
}
