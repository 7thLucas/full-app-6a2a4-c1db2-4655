## Design language
Clean, calm, focused. A personal tool for a single busy operator — clarity over density. Generous whitespace, restrained color, fast scanning. Inspired by Linear / Notion / Apple HIG: quiet by default, expressive only where it carries meaning (cold-contact alerts, pipeline stage colors).

## Color
- Neutral base: near-white background (#FAFAFA), white surfaces (#FFFFFF), slate text (#1A1A1A primary, #6B7280 secondary).
- Primary accent: a confident indigo/blue (#4F46E5) for primary actions and active states.
- Semantic / status:
  - Cold (needs follow-up): warm amber → red escalation (#F59E0B warm, #EF4444 urgent). Cold contacts must be visually impossible to miss.
  - Fresh / recently touched: calm green (#10B981).
  - Pipeline stages: distinct but muted hues per stage (Lead, Contacted, Proposal, Won = green-leaning, Lost = neutral/red-leaning).

## Typography
- System UI sans-serif stack (Inter or system default). 
- Clear hierarchy: large semibold page titles, medium section headers, regular body. Tabular numerals for dates/counts.

## Layout & components
- Left nav or top tabs for the three pillars: Contacts, Pipeline, (and a Dashboard/Today view surfacing cold contacts).
- Contacts: scannable list/table with name, company, last-touch date, and a color-coded "freshness" indicator.
- Contact detail: header with last-touch + quick "log interaction" action; chronological interaction timeline below.
- Pipeline: kanban-style board, columns = stages, draggable cards; renamable column headers.
- Cards & rows: rounded corners (8–12px), subtle borders/shadows, hover affordances.

## Elevation & motion
- Subtle shadows for surfaces and dragged cards. Smooth, quick transitions (150–200ms). No gratuitous animation.

## Accessibility
- WCAG AA contrast. Status never conveyed by color alone — pair with icon/label (e.g. "Cold · 47 days").