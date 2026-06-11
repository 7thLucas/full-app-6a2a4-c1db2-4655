import { Router } from "express";
import {
  listStages,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
  listContacts,
  getContact,
  createContact,
  updateContact,
  moveContact,
  deleteContact,
  logInteraction,
  deleteInteraction,
} from "./crm.controller";

const router = Router();

// Stages
router.get("/crm/stages", listStages);
router.post("/crm/stages", createStage);
router.post("/crm/stages/reorder", reorderStages);
router.patch("/crm/stages/:id", updateStage);
router.delete("/crm/stages/:id", deleteStage);

// Contacts
router.get("/crm/contacts", listContacts);
router.post("/crm/contacts", createContact);
router.get("/crm/contacts/:id", getContact);
router.patch("/crm/contacts/:id", updateContact);
router.post("/crm/contacts/:id/move", moveContact);
router.delete("/crm/contacts/:id", deleteContact);

// Interactions
router.post("/crm/interactions", logInteraction);
router.delete("/crm/interactions/:id", deleteInteraction);

export default router;
