import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Phone,
  Mail,
  FileText,
  Users,
  Pencil,
  Trash2,
  Plus,
  Building2,
  Clock,
} from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { apiRequest } from "~/lib/api.client";
import { AppShell } from "~/components/crm/app-shell";
import { Avatar, Button, FreshnessChip, Skeleton } from "~/components/crm/ui";
import { ContactForm } from "~/components/crm/contact-form";
import { LogInteraction } from "~/components/crm/log-interaction";
import { useThresholds, deleteContact, deleteInteraction } from "~/components/crm/use-crm";
import {
  freshnessOf,
  formatDateTime,
  INTERACTION_META,
  lastTouchLabel,
  type Contact,
  type Interaction,
  type InteractionType,
  type Stage,
} from "~/lib/crm";

const TYPE_ICON: Record<InteractionType, typeof Phone> = {
  call: Phone,
  email: Mail,
  note: FileText,
  meeting: Users,
};

export default function ContactDetailRoute() {
  const { id = "" } = useParams();
  const { config } = useConfigurables();
  const thresholds = useThresholds();

  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [logging, setLogging] = useState(false);

  const load = useCallback(async () => {
    const [detail, stageRes] = await Promise.all([
      apiRequest<{ contact: Contact; interactions: Interaction[] }>(`/api/crm/contacts/${id}`),
      apiRequest<Stage[]>("/api/crm/stages"),
    ]);
    if (detail.success && detail.data) {
      setContact(detail.data.contact);
      setInteractions(detail.data.interactions);
    }
    if (stageRes.success && stageRes.data) setStages(stageRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDeleteContact() {
    if (!contact) return;
    if (!confirm(`Delete ${contact.name}? This removes their interaction history too.`)) return;
    await deleteContact(contact._id);
    window.location.href = "/contacts";
  }

  async function handleDeleteInteraction(intId: string) {
    await deleteInteraction(intId);
    load();
  }

  if (loading) {
    return (
      <AppShell>
        <Skeleton className="mb-4 h-6 w-24" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </AppShell>
    );
  }

  if (!contact) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <p className="text-zinc-500">Contact not found.</p>
          <Link to="/contacts" className="mt-3 inline-block text-primary hover:underline">
            Back to contacts
          </Link>
        </div>
      </AppShell>
    );
  }

  const f = freshnessOf(contact.lastTouchAt, thresholds);
  const stage = stages.find((s) => s._id === contact.stageId);

  return (
    <AppShell>
      <Link
        to="/contacts"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" /> All contacts
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={contact.name} size={56} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{contact.name}</h1>
              {stage && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-[12px] font-medium text-white"
                  style={{ backgroundColor: stage.color }}
                >
                  {stage.name}
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-zinc-500">
              {contact.company && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> {contact.company}
                </span>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                  <Mail className="h-3.5 w-3.5" /> {contact.email}
                </a>
              )}
              {contact.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {contact.phone}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2.5">
              <FreshnessChip freshness={f} lastTouchAt={contact.lastTouchAt} />
              <span className="inline-flex items-center gap-1 text-[12.5px] text-zinc-400">
                <Clock className="h-3.5 w-3.5" /> last touch {lastTouchLabel(contact.lastTouchAt).toLowerCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeleteContact}>
              <Trash2 className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
        </div>

        {contact.notes && (
          <p className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-[13.5px] leading-relaxed text-zinc-600">
            {contact.notes}
          </p>
        )}

        <div className="mt-4 border-t border-zinc-100 pt-4">
          <Button onClick={() => setLogging(true)}>
            <Plus className="h-4 w-4" /> {config?.logInteractionLabel || "Log interaction"}
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-zinc-400">
          Interaction history
        </h2>
        {interactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-5 py-10 text-center text-[13.5px] text-zinc-500">
            No interactions logged yet. Log your first touch to start the timeline.
          </div>
        ) : (
          <ol className="relative space-y-0.5 pl-1">
            {interactions.map((it, i) => {
              const Icon = TYPE_ICON[it.type] ?? FileText;
              return (
                <li key={it._id} className="group relative flex gap-3 pb-1">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    {i < interactions.length - 1 && <div className="my-0.5 w-px flex-1 bg-zinc-200" />}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-semibold text-zinc-800">
                          {INTERACTION_META[it.type]?.label ?? "Note"}
                        </span>
                        <span className="text-[12px] tabular-nums text-zinc-400">
                          {formatDateTime(it.occurredAt)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteInteraction(it._id)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        title="Delete interaction"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-zinc-300 hover:text-red-500" />
                      </button>
                    </div>
                    {it.note && <p className="mt-0.5 text-[13.5px] leading-relaxed text-zinc-600">{it.note}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <ContactForm
        open={editing}
        onClose={() => setEditing(false)}
        onSaved={load}
        stages={stages}
        contact={contact}
      />
      <LogInteraction
        open={logging}
        onClose={() => setLogging(false)}
        onLogged={load}
        contactId={contact._id}
        contactName={contact.name}
      />
    </AppShell>
  );
}
