import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export type InteractionType = "call" | "email" | "note" | "meeting";

/**
 * Interaction — a timestamped touch against a contact (call/email/note/meeting).
 * Creating one updates the parent contact's lastTouchAt.
 */
@modelOptions({
  schemaOptions: {
    collection: "tbl_crm_interactions",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Interaction extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  contactId!: string;

  @prop({ type: String, required: true, default: "note" })
  type!: InteractionType;

  @prop({ type: String, default: "" })
  note!: string;

  @prop({ type: Date, required: true, default: () => new Date() })
  occurredAt!: Date;
}

export const InteractionModel = getModelForClass(Interaction);
