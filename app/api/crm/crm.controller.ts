import type { Request, Response } from "express";
import { CrmService } from "./crm.service";

const ok = (res: Response, data: unknown) => res.json({ success: true, data });
const fail = (res: Response, message: string, code = 500) =>
  res.status(code).json({ success: false, message });
const param = (req: Request, key: string): string => String((req.params as Record<string, unknown>)[key] ?? "");

// ── Stages ────────────────────────────────────────────────────────────────────
export async function listStages(_req: Request, res: Response) {
  try {
    ok(res, await CrmService.listStages());
  } catch (e) {
    fail(res, "Failed to list stages");
  }
}

export async function createStage(req: Request, res: Response) {
  try {
    if (!req.body?.name) return fail(res, "Stage name is required", 400);
    ok(res, await CrmService.createStage(req.body));
  } catch (e) {
    fail(res, "Failed to create stage");
  }
}

export async function updateStage(req: Request, res: Response) {
  try {
    ok(res, await CrmService.updateStage(param(req, "id"), req.body));
  } catch (e) {
    fail(res, "Failed to update stage");
  }
}

export async function deleteStage(req: Request, res: Response) {
  try {
    ok(res, await CrmService.deleteStage(param(req, "id"), req.body?.reassignToStageId));
  } catch (e) {
    fail(res, "Failed to delete stage");
  }
}

export async function reorderStages(req: Request, res: Response) {
  try {
    ok(res, await CrmService.reorderStages(req.body?.orderedIds || []));
  } catch (e) {
    fail(res, "Failed to reorder stages");
  }
}

// ── Contacts ──────────────────────────────────────────────────────────────────
export async function listContacts(_req: Request, res: Response) {
  try {
    ok(res, await CrmService.listContacts());
  } catch (e) {
    fail(res, "Failed to list contacts");
  }
}

export async function getContact(req: Request, res: Response) {
  try {
    const contact = await CrmService.getContact(param(req, "id"));
    if (!contact) return fail(res, "Contact not found", 404);
    const interactions = await CrmService.listInteractions(param(req, "id"));
    ok(res, { contact, interactions });
  } catch (e) {
    fail(res, "Failed to load contact");
  }
}

export async function createContact(req: Request, res: Response) {
  try {
    if (!req.body?.name) return fail(res, "Contact name is required", 400);
    ok(res, await CrmService.createContact(req.body));
  } catch (e) {
    fail(res, "Failed to create contact");
  }
}

export async function updateContact(req: Request, res: Response) {
  try {
    ok(res, await CrmService.updateContact(param(req, "id"), req.body));
  } catch (e) {
    fail(res, "Failed to update contact");
  }
}

export async function moveContact(req: Request, res: Response) {
  try {
    ok(res, await CrmService.moveContact(param(req, "id"), req.body?.stageId, req.body?.stageOrder));
  } catch (e) {
    fail(res, "Failed to move contact");
  }
}

export async function deleteContact(req: Request, res: Response) {
  try {
    ok(res, await CrmService.deleteContact(param(req, "id")));
  } catch (e) {
    fail(res, "Failed to delete contact");
  }
}

// ── Interactions ────────────────────────────────────────────────────────────────
export async function logInteraction(req: Request, res: Response) {
  try {
    if (!req.body?.contactId) return fail(res, "contactId is required", 400);
    ok(res, await CrmService.logInteraction(req.body));
  } catch (e) {
    fail(res, "Failed to log interaction");
  }
}

export async function deleteInteraction(req: Request, res: Response) {
  try {
    ok(res, await CrmService.deleteInteraction(param(req, "id")));
  } catch (e) {
    fail(res, "Failed to delete interaction");
  }
}
