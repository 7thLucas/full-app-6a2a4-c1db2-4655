import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "~/lib/api.client";
import { useConfigurables } from "~/modules/configurables";
import type { Contact, Interaction, InteractionType, Stage, Thresholds } from "~/lib/crm";

/** Reads cold/warm thresholds from configurables with sane fallbacks. */
export function useThresholds(): Thresholds {
  const { config } = useConfigurables();
  const warm = typeof config?.warmThresholdDays === "number" ? config.warmThresholdDays : 14;
  const cold = typeof config?.coldThresholdDays === "number" ? config.coldThresholdDays : 30;
  return { warm, cold };
}

/** Loads stages + contacts together; exposes mutations that refetch. */
export function useCrmBoard() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const [s, c] = await Promise.all([
      apiRequest<Stage[]>("/api/crm/stages"),
      apiRequest<Contact[]>("/api/crm/contacts"),
    ]);
    if (s.success && s.data) setStages(s.data);
    if (c.success && c.data) setContacts(c.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stages, contacts, loading, refetch, setContacts, setStages };
}

export async function createContact(body: Partial<Contact>) {
  return apiRequest<Contact>("/api/crm/contacts", { method: "POST", data: body });
}

export async function updateContact(id: string, body: Partial<Contact>) {
  return apiRequest<Contact>(`/api/crm/contacts/${id}`, { method: "PATCH", data: body });
}

export async function moveContact(id: string, stageId: string, stageOrder?: number) {
  return apiRequest<Contact>(`/api/crm/contacts/${id}/move`, {
    method: "POST",
    data: { stageId, stageOrder },
  });
}

export async function deleteContact(id: string) {
  return apiRequest(`/api/crm/contacts/${id}`, { method: "DELETE" });
}

export async function logInteraction(body: {
  contactId: string;
  type: InteractionType;
  note?: string;
  occurredAt?: string;
}) {
  return apiRequest<Interaction>("/api/crm/interactions", { method: "POST", data: body });
}

export async function deleteInteraction(id: string) {
  return apiRequest(`/api/crm/interactions/${id}`, { method: "DELETE" });
}

export async function createStage(name: string, color?: string) {
  return apiRequest<Stage>("/api/crm/stages", { method: "POST", data: { name, color } });
}

export async function updateStage(id: string, body: Partial<Stage>) {
  return apiRequest<Stage>(`/api/crm/stages/${id}`, { method: "PATCH", data: body });
}

export async function deleteStage(id: string, reassignToStageId?: string) {
  return apiRequest(`/api/crm/stages/${id}`, { method: "DELETE", data: { reassignToStageId } });
}

export async function reorderStages(orderedIds: string[]) {
  return apiRequest<Stage[]>("/api/crm/stages/reorder", {
    method: "POST",
    data: { orderedIds },
  });
}
