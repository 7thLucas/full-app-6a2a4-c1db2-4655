/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 160,
    },
    {
      fieldName: "coldThresholdDays",
      type: "number",
      required: false,
      label: "Cold Threshold (days)",
      min: 1,
      max: 365,
    },
    {
      fieldName: "warmThresholdDays",
      type: "number",
      required: false,
      label: "Warm Threshold (days)",
      min: 1,
      max: 365,
    },
    {
      fieldName: "dashboardHeading",
      type: "string",
      required: false,
      label: "Dashboard Heading",
      maxLength: 120,
    },
    {
      fieldName: "dashboardSubheading",
      type: "string",
      required: false,
      label: "Dashboard Subheading",
      maxLength: 200,
    },
    {
      fieldName: "emptyStateMessage",
      type: "string",
      required: false,
      label: "Empty State Message",
      maxLength: 200,
    },
    {
      fieldName: "logInteractionLabel",
      type: "string",
      required: false,
      label: "Log Interaction Button Label",
      maxLength: 60,
    },
    {
      fieldName: "defaultStages",
      type: "array",
      required: false,
      label: "Default Pipeline Stages",
      item: {
        type: "object",
        fields: [
          { fieldName: "name", type: "string", required: true, label: "Stage Name" },
          { fieldName: "color", type: "color", required: true, label: "Stage Color" },
        ],
      },
    },
  ],
};