import { useState } from "react";
import { Phone, Mail, FileText, Users } from "lucide-react";
import type { InteractionType } from "~/lib/crm";
import { INTERACTION_META } from "~/lib/crm";
import { cn } from "~/lib/utils";
import { Button, Field, inputCls, Modal } from "./ui";
import { logInteraction } from "./use-crm";

const TYPES: { value: InteractionType; icon: typeof Phone }[] = [
  { value: "call", icon: Phone },
  { value: "email", icon: Mail },
  { value: "meeting", icon: Users },
  { value: "note", icon: FileText },
];

export function LogInteraction({
  open,
  onClose,
  onLogged,
  contactId,
  contactName,
}: {
  open: boolean;
  onClose: () => void;
  onLogged: () => void;
  contactId: string;
  contactName: string;
}) {
  const [type, setType] = useState<InteractionType>("call");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await logInteraction({ contactId, type, note });
    setSaving(false);
    if (res.success) {
      setNote("");
      setType("call");
      onLogged();
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Log interaction · ${contactName}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Logging…" : "Log it"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Type">
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border py-2.5 text-[12px] font-medium transition-all",
                  type === value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50",
                )}
              >
                <Icon className="h-4 w-4" />
                {INTERACTION_META[value].label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Note (optional)">
          <textarea
            autoFocus
            className={inputCls}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you talk about? Any next steps?"
          />
        </Field>
        <p className="text-[12px] text-zinc-400">
          Logging this updates {contactName.split(" ")[0]}&apos;s last-touch date to today.
        </p>
      </div>
    </Modal>
  );
}
