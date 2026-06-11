import { useState } from "react";
import type { Contact, Stage } from "~/lib/crm";
import { Button, Field, inputCls, Modal } from "./ui";
import { createContact, updateContact } from "./use-crm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  stages: Stage[];
  contact?: Contact | null;
  defaultStageId?: string;
};

export function ContactForm({ open, onClose, onSaved, stages, contact, defaultStageId }: Props) {
  const editing = !!contact;
  const [name, setName] = useState(contact?.name ?? "");
  const [company, setCompany] = useState(contact?.company ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [stageId, setStageId] = useState(contact?.stageId ?? defaultStageId ?? stages[0]?._id ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const body = { name: name.trim(), company, email, phone, stageId, notes };
    const res = editing ? await updateContact(contact!._id, body) : await createContact(body);
    setSaving(false);
    if (res.success) {
      onSaved();
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit contact" : "New contact"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add contact"}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Field label="Name">
          <input
            autoFocus
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Company">
          <input
            className={inputCls}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <input
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@acme.com"
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputCls}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
            />
          </Field>
        </div>
        <Field label="Stage">
          <select className={inputCls} value={stageId} onChange={(e) => setStageId(e.target.value)}>
            {stages.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes">
          <textarea
            className={inputCls}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context, how you met, what they need…"
          />
        </Field>
      </div>
    </Modal>
  );
}
