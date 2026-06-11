import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Plus, MoreVertical, Pencil, Trash2, Check, X, GripVertical } from "lucide-react";
import { AppShell } from "~/components/crm/app-shell";
import { Avatar, Button, FreshnessChip, inputCls, Skeleton } from "~/components/crm/ui";
import { ContactForm } from "~/components/crm/contact-form";
import {
  useCrmBoard,
  useThresholds,
  moveContact,
  createStage,
  updateStage,
  deleteStage,
} from "~/components/crm/use-crm";
import { freshnessOf, type Contact, type Stage } from "~/lib/crm";
import { cn } from "~/lib/utils";

export default function PipelineRoute() {
  const thresholds = useThresholds();
  const { stages, contacts, loading, refetch, setContacts } = useCrmBoard();
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const byStage = useMemo(() => {
    const m: Record<string, Contact[]> = {};
    stages.forEach((s) => (m[s._id] = []));
    contacts.forEach((c) => {
      if (!m[c.stageId]) m[c.stageId] = [];
      m[c.stageId].push(c);
    });
    Object.values(m).forEach((list) => list.sort((a, b) => a.stageOrder - b.stageOrder));
    return m;
  }, [stages, contacts]);

  async function handleDrop(stageId: string) {
    setOverStage(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const contact = contacts.find((c) => c._id === id);
    if (!contact || contact.stageId === stageId) return;
    // optimistic
    setContacts((prev) =>
      prev.map((c) => (c._id === id ? { ...c, stageId, stageOrder: byStage[stageId]?.length ?? 0 } : c)),
    );
    await moveContact(id, stageId, byStage[stageId]?.length ?? 0);
    refetch();
  }

  async function handleAddStage() {
    const name = prompt("New stage name?");
    if (!name?.trim()) return;
    await createStage(name.trim(), "#6B7280");
    refetch();
  }

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Pipeline</h1>
          <p className="mt-1 text-[14px] text-zinc-500">
            Drag a card between stages. Click a stage name to rename it.
          </p>
        </div>
        <Button variant="outline" onClick={handleAddStage}>
          <Plus className="h-4 w-4" /> Add stage
        </Button>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <StageColumn
              key={stage._id}
              stage={stage}
              contacts={byStage[stage._id] || []}
              thresholds={thresholds}
              canDelete={stages.length > 1}
              otherStages={stages.filter((s) => s._id !== stage._id)}
              isOver={overStage === stage._id}
              onDragOver={() => setOverStage(stage._id)}
              onDragLeave={() => setOverStage((s) => (s === stage._id ? null : s))}
              onDrop={() => handleDrop(stage._id)}
              onCardDragStart={(id) => setDragId(id)}
              onCardDragEnd={() => setDragId(null)}
              onAddContact={() => setAddingTo(stage._id)}
              onChanged={refetch}
            />
          ))}
        </div>
      )}

      <ContactForm
        open={!!addingTo}
        onClose={() => setAddingTo(null)}
        onSaved={refetch}
        stages={stages}
        defaultStageId={addingTo ?? undefined}
      />
    </AppShell>
  );
}

function StageColumn({
  stage,
  contacts,
  thresholds,
  canDelete,
  otherStages,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
  onAddContact,
  onChanged,
}: {
  stage: Stage;
  contacts: Contact[];
  thresholds: { warm: number; cold: number };
  canDelete: boolean;
  otherStages: Stage[];
  isOver: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onCardDragStart: (id: string) => void;
  onCardDragEnd: () => void;
  onAddContact: () => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(stage.name);
  const [menuOpen, setMenuOpen] = useState(false);

  async function saveName() {
    setEditing(false);
    if (name.trim() && name.trim() !== stage.name) {
      await updateStage(stage._id, { name: name.trim() });
      onChanged();
    } else {
      setName(stage.name);
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    if (contacts.length > 0) {
      const target = otherStages[0];
      if (!confirm(`Delete "${stage.name}"? Its ${contacts.length} contact(s) move to "${target.name}".`)) return;
      await deleteStage(stage._id, target._id);
    } else {
      if (!confirm(`Delete empty stage "${stage.name}"?`)) return;
      await deleteStage(stage._id);
    }
    onChanged();
  }

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-zinc-50/70 transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-zinc-200",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
        {editing ? (
          <div className="flex flex-1 items-center gap-1">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") {
                  setName(stage.name);
                  setEditing(false);
                }
              }}
              className={inputCls + " px-2 py-1 text-[13px]"}
            />
            <button onClick={saveName} className="rounded p-1 text-emerald-600 hover:bg-emerald-50">
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setName(stage.name);
                setEditing(false);
              }}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="flex-1 truncate text-left text-[13.5px] font-semibold text-zinc-700 hover:text-zinc-900"
              title="Click to rename"
            >
              {stage.name}
            </button>
            <span className="rounded-full bg-zinc-200/70 px-1.5 text-[11px] font-medium tabular-nums text-zinc-500">
              {contacts.length}
            </span>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={() => {
                        setEditing(true);
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-zinc-700 hover:bg-zinc-50"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Rename
                    </button>
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2" style={{ minHeight: 120 }}>
        {contacts.map((c) => (
          <PipelineCard
            key={c._id}
            contact={c}
            freshness={freshnessOf(c.lastTouchAt, thresholds)}
            onDragStart={() => onCardDragStart(c._id)}
            onDragEnd={onCardDragEnd}
          />
        ))}
        <button
          onClick={onAddContact}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-200 py-2 text-[12.5px] font-medium text-zinc-400 transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

function PipelineCard({
  contact,
  freshness,
  onDragStart,
  onDragEnd,
}: {
  contact: Contact;
  freshness: ReturnType<typeof freshnessOf>;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group cursor-grab rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <Avatar name={contact.name} size={30} />
        <Link to={`/contacts/${contact._id}`} className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
          <div className="truncate text-[13.5px] font-semibold text-zinc-900">{contact.name}</div>
          <div className="truncate text-[12px] text-zinc-500">{contact.company || "No company"}</div>
        </Link>
        <GripVertical className="h-4 w-4 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-2">
        <FreshnessChip freshness={freshness} lastTouchAt={contact.lastTouchAt} />
      </div>
    </div>
  );
}
