// Import global routes
import { Router } from "express";
import moduleRoutes from "./routes";
import { initializeModels } from "./models";
import crmRoutes from "./crm/crm.routes";

// Register CRM models so Typegoose/Mongoose schemas are created.
import "./crm/stage.model";
import "./crm/contact.model";
import "./crm/interaction.model";

// Initialize module models (auto-discovered under app/modules/*)
await initializeModels();

const router = Router();
router.use(moduleRoutes);
router.use(crmRoutes);

export default router;
