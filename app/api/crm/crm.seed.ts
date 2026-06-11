import { createLogger } from "~/lib/logger";
import { StageModel } from "./stage.model";
import { ContactModel } from "./contact.model";
import { InteractionModel } from "./interaction.model";

const logger = createLogger("CrmSeed");

const DEFAULT_STAGES = [
  { name: "Lead", color: "#6B7280" },
  { name: "Contacted", color: "#3B82F6" },
  { name: "Proposal", color: "#F59E0B" },
  { name: "Won", color: "#10B981" },
  { name: "Lost", color: "#EF4444" },
];

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

/**
 * Idempotent seed: creates the default pipeline stages and a small set of
 * sample contacts (some deliberately "cold") so the dashboard demonstrates
 * the hero feature on first boot.
 */
export async function seedCrm(): Promise<void> {
  try {
    const stageCount = await StageModel.countDocuments({ deletedAt: null }).exec();
    if (stageCount > 0) return; // already seeded

    logger.info("Seeding CRM pipeline stages + sample data...");

    const stages = await StageModel.insertMany(
      DEFAULT_STAGES.map((s, i) => ({ ...s, order: i })),
    );
    const byName = (n: string) => stages.find((s) => s.name === n)!._id.toString();

    const samples = [
      { name: "Maya Chen", company: "Northwind Studio", email: "maya@northwind.co", stage: "Proposal", touch: 41 },
      { name: "Daniel Okafor", company: "Bright Ledger", email: "dan@brightledger.io", stage: "Contacted", touch: 33 },
      { name: "Priya Nair", company: "Solo / Freelance", email: "priya.nair@gmail.com", stage: "Lead", touch: 9 },
      { name: "Tom Albright", company: "Cedar & Co", email: "tom@cedarco.com", stage: "Contacted", touch: 2 },
      { name: "Sofia Marin", company: "Marin Consulting", email: "sofia@marin.consulting", stage: "Won", touch: 18 },
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
