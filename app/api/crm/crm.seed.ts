import { createLogger } from "~/lib/logger";
import { StageModel } from "./stage.model";
import { ContactModel } from "./contact.model";
import { InteractionModel } from "./interaction.model";

const logger = createLogger("CrmSeed");

const DEFAULT_STAGES = [
  { name: "Lead", color: "#6B7280" },
  { name: "Active", color: "#3B82F6" },
  { name: "Past", color: "#10B981" },
];

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

/**
 * Idempotent seed: creates the default pipeline stages and a small set of
 * sample contacts (some deliberately "cold") so the dashboard demonstrates
 * the hero feature on first boot.
 */
/**
 * Maps any legacy stage name to one of the three current stages.
 * Lead → Lead; Contacted/Proposal → Active; Won/Lost → Past.
 */
const LEGACY_STAGE_REMAP: Record<string, string> = {
  Contacted: "Active",
  Proposal: "Active",
  Won: "Past",
  Lost: "Past",
};

/**
 * Idempotent migration for already-seeded databases: collapses the old
 * five-stage pipeline (Lead → Contacted → Proposal → Won → Lost) down to the
 * current three (Lead → Active → Past). Contacts on removed stages are remapped
 * so nothing is orphaned, then the obsolete stages are soft-deleted.
 */
async function migrateLegacyStages(): Promise<void> {
  const stages = await StageModel.find({ deletedAt: null }).lean().exec();
  const byName = new Map(stages.map((s) => [s.name, s]));

  // Only migrate if any legacy-only stage still exists.
  const hasLegacy = stages.some((s) => s.name in LEGACY_STAGE_REMAP);
  if (!hasLegacy) return;

  logger.info("Migrating legacy CRM stages → Lead → Active → Past...");

  // Ensure the three target stages exist (preserving Lead if already present).
  for (let i = 0; i < DEFAULT_STAGES.length; i++) {
    const def = DEFAULT_STAGES[i];
    const existing = byName.get(def.name);
    if (existing) {
      await StageModel.findByIdAndUpdate(existing._id, {
        $set: { color: def.color, order: i, deletedAt: null },
      }).exec();
    } else {
      const created = await StageModel.create({ ...def, order: i });
      byName.set(def.name, created.toObject());
    }
  }

  // Remap contacts off each legacy stage onto its target, then soft-delete it.
  for (const stage of stages) {
    const targetName = LEGACY_STAGE_REMAP[stage.name];
    if (!targetName) continue;
    const target = byName.get(targetName);
    if (!target) continue;
    await ContactModel.updateMany(
      { stageId: stage._id.toString(), deletedAt: null },
      { $set: { stageId: target._id.toString() } },
    ).exec();
    await StageModel.findByIdAndUpdate(stage._id, { $set: { deletedAt: new Date() } }).exec();
  }

  logger.info("✅ Legacy CRM stages migrated");
}

export async function seedCrm(): Promise<void> {
  try {
    const stageCount = await StageModel.countDocuments({ deletedAt: null }).exec();
    if (stageCount > 0) {
      await migrateLegacyStages(); // already seeded — reconcile old stage sets
      return;
    }

    logger.info("Seeding CRM pipeline stages + sample data...");

    const stages = await StageModel.insertMany(
      DEFAULT_STAGES.map((s, i) => ({ ...s, order: i })),
    );
    const byName = (n: string) => stages.find((s) => s.name === n)!._id.toString();

    const samples = [
      { name: "Maya Chen", company: "Northwind Studio", email: "maya@northwind.co", stage: "Active", touch: 41 },
      { name: "Daniel Okafor", company: "Bright Ledger", email: "dan@brightledger.io", stage: "Active", touch: 33 },
      { name: "Priya Nair", company: "Solo / Freelance", email: "priya.nair@gmail.com", stage: "Lead", touch: 9 },
      { name: "Tom Albright", company: "Cedar & Co", email: "tom@cedarco.com", stage: "Active", touch: 2 },
      { name: "Sofia Marin", company: "Marin Consulting", email: "sofia@marin.consulting", stage: "Past", touch: 18 },
      { name: "James Whitfield", company: "Whitfield Legal", email: "j.whitfield@wlegal.com", stage: "Lead", touch: null },
    ];

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const contact = await ContactModel.create({
        name: s.name,
        company: s.company,
        email: s.email,
        phone: "",
        notes: "",
        stageId: byName(s.stage),
        stageOrder: i,
        lastTouchAt: s.touch === null ? null : daysAgo(s.touch),
      });

      if (s.touch !== null) {
        await InteractionModel.create({
          contactId: contact._id.toString(),
          type: i % 2 === 0 ? "call" : "email",
          note:
            i % 2 === 0
              ? "Quick check-in call. Discussed next steps."
              : "Sent a follow-up email with details.",
          occurredAt: daysAgo(s.touch),
        });
      }
    }

    logger.info("✅ CRM seeded successfully");
  } catch (error) {
    logger.error("❌ Failed to seed CRM:", error);
  }
}
