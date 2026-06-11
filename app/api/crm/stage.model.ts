import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

/**
 * Stage — a single column in the pipeline board.
 * Stages are renamable and reorderable; the seed creates the defaults
 * (Lead → Active → Past).
 */
@modelOptions({
  schemaOptions: {
    collection: "tbl_crm_stages",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
  options: { allowMixed: Severity.ALLOW },
})
export class Stage extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  name!: string;

  @prop({ type: String, default: "#6B7280" })
  color!: string;

  @prop({ type: Number, default: 0 })
  order!: number;
}

export const StageModel = getModelForClass(Stage);
