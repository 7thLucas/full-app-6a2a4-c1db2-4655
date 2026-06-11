import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

/**
 * Contact — a person/deal tracked by the operator.
 * `lastTouchAt` is auto-maintained whenever an interaction is logged.
 * `stageId` references the pipeline Stage the contact currently sits in.
 */
@modelOptions({
  schemaOptions: {
    collection: "tbl_crm_contacts",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Contact extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "" })
  company!: string;

  @prop({ type: String, default: "" })
  email!: string;

  @prop({ type: String, default: "" })
  phone!: string;

  @prop({ type: String, default: "" })
  notes!: string;

  @prop({ type: String, required: true })
  stageId!: string;

  @prop({ type: Number, default: 0 })
  stageOrder!: number;

  @prop({ type: Date, default: null })
  lastTouchAt!: Date | null;
}

export const ContactModel = getModelForClass(Contact);
