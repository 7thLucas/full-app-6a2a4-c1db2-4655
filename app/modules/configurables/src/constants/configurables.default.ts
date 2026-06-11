/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TStageConfig = {
  name: string;
  color: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  tagline?: string;
  coldThresholdDays?: number;
  warmThresholdDays?: number;
  dashboardHeading?: string;
  dashboardSubheading?: string;
  emptyStateMessage?: string;
  logInteractionLabel?: string;
  defaultStages?: TStageConfig[];
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Pipeline",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#4F46E5",
    secondary: "#F4F4F5",
    accent: "#EEF2FF",
  },
  tagline: "Never let a relationship go cold.", // fill it here
  coldThresholdDays: 30, // fill it here
  warmThresholdDays: 14, // fill it here
  dashboardHeading: "Today", // fill it here
  dashboardSubheading: "The people who need a follow-up before they slip away.", // fill it here
  emptyStateMessage: "Nothing's cold right now. Every relationship is warm — nice work.", // fill it here
  logInteractionLabel: "Log interaction", // fill it here
  defaultStages: [
    { name: "Lead", color: "#6B7280" },
    { name: "Contacted", color: "#3B82F6" },
    { name: "Proposal", color: "#F59E0B" },
    { name: "Won", color: "#10B981" },
    { name: "Lost", color: "#EF4444" },
  ], // fill it here
  // ─────────────────────────────────────────────────────────────────────
  // Add new field defaults here. See RULES.md §5 for per-type shape.
  // Required branding fields → use the FILL_X_HERE placeholder pattern.
  // Optional/typed defaults → real value with a "// fill it here" comment:
  //
  //   maxItemsPerPage: 12,                     // fill it here
  //   enableNotifications: true,               // fill it here
  //   featuredCategories: [],                  // fill it here
  //   defaultLanguage: "en",                   // must match enum options
  //   launchDate: "2025-01-01T00:00:00.000Z",  // ISO-8601
  //   heroImage: "",                           // resolved URL after upload
  //   galleryImages: [],                       // array of resolved URLs
  // ─────────────────────────────────────────────────────────────────────
};
