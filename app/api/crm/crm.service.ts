import { ContactModel } from "./contact.model";
import { InteractionModel, type InteractionType } from "./interaction.model";
import { StageModel } from "./stage.model";

/**
 * CRM Service — all business logic for contacts, interactions and pipeline stages.
 *
 * Core principle: an interaction always refreshes the contact's lastTouchAt, so the
 * pipeline + dashboard can surface who has gone cold.
 */
export class CrmService {
  // ── Stages ────────────────────────────────────────────────────────────────
  static async listStages() {
    return StageModel.find({ deletedAt: null }).sort({ order: 1, createdAt: 1 }).lean().exec();
  }

  static async createStage(data: { name: string; color?: string }) {
    const count = await StageModel.countDocuments({ deletedAt: null }).exec();
    return StageModel.create({
      name: data.name,
      color: data.color || "#6B7280",
      order: count,
    });
  }

  static async updateStage(id: string, data: { name?: string; color?: string; order?: number }) {
    return StageModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  static async deleteStage(id: string, reassignToStageId?: string) {
    // Move any contacts off this stage before removing it.
    if (reassignToStageId) {
      await ContactModel.updateMany(
        { stageId: id, deletedAt: null },
        { $set: { stageId: reassignToStageId } },
      ).exec();
    }
    return StageModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true }).exec();
  }

  static async reorderStages(orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        StageModel.findByIdAndUpdate(id, { $set: { order: index } }).exec(),
      ),
    );
    return this.listStages();
  }

  // ── Contacts ──────────────────────────────────────────────────────────────
  static async listContacts() {
    return ContactModel.find({ deletedAt: null })
      .sort({ lastTouchAt: 1, createdAt: -1 })
      .lean()
      .exec();
  }

  static async getContact(id: string) {
    return ContactModel.findOne({ _id: id, deletedAt: null }).lean().exec();
  }

  static async createContact(data: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    notes?: string;
    stageId?: string;
  }) {
    let stageId = data.stageId;
    if (!stageId) {
      const first = await StageModel.find({ deletedAt: null }).sort({ order: 1 }).limit(1).lean().exec();
      stageId = first[0]?._id?.toString();
    }
    const count = await ContactModel.countDocuments({ stageId, deletedAt: null }).exec();
    return ContactModel.create({
      name: data.name,
      company: data.company || "",
      email: data.email || "",
      phone: data.phone || "",
      notes: data.notes || "",
      stageId,
      stageOrder: count,
      lastTouchAt: null,
    });
  }

  static async updateContact(
    id: string,
    data: Partial<{
      name: string;
      company: string;
      email: string;
      phone: string;
      notes: string;
      stageId: string;
      stageOrder: number;
    }>,
  ) {
    return ContactModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  static async moveContact(id: string, stageId: string, stageOrder?: number) {
    return ContactModel.findByIdAndUpdate(
      id,
      { $set: { stageId, stageOrder: stageOrder ?? 0 } },
      { new: true },
    ).exec();
  }

  static async deleteContact(id: string) {
    await InteractionModel.updateMany(
      { contactId: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    ).exec();
    return ContactModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true }).exec();
  }

  // ── Interactions ────────────────────────────────────────────────────────────
  static async listInteractions(contactId: string) {
    return InteractionModel.find({ contactId, deletedAt: null })
      .sort({ occurredAt: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  static async logInteraction(data: {
    contactId: string;
    type: InteractionType;
    note?: string;
    occurredAt?: string | Date;
  }) {
    const occurredAt = data.occurredAt ? new Date(data.occurredAt) : new Date();
    const interaction = await InteractionModel.create({
      contactId: data.contactId,
      type: data.type,
      note: data.note || "",
      occurredAt,
    });

    // Refresh lastTouchAt to the most recent touch.
    const contact = await ContactModel.findById(data.contactId).exec();
    if (contact) {
      if (!contact.lastTouchAt || occurredAt > contact.lastTouchAt) {
        contact.lastTouchAt = occurredAt;
        await contact.save();
      }
    }
    return interaction;
  }

  static async deleteInteraction(id: string) {
    const interaction = await InteractionModel.findById(id).exec();
    const removed = await InteractionModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date() } },
      { new: true },
    ).exec();

    // Recompute lastTouchAt from the remaining interactions.
    if (interaction) {
      const latest = await InteractionModel.find({ contactId: interaction.contactId, deletedAt: null })
        .sort({ occurredAt: -1 })
        .limit(1)
        .lean()
        .exec();
      await ContactModel.findByIdAndUpdate(interaction.contactId, {
        $set: { lastTouchAt: latest[0]?.occurredAt ?? null },
      }).exec();
    }
    return removed;
  }
}
