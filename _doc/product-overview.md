# Product Overview

> Single source of truth for this product. Name is confirmed (**Pipeline**); logo and
> color palette are not yet finalized. Status: **built and shipped** (initial MVP).
> Update when product facts change.

## What it is

**Pipeline** — a simple, personal **CRM** for tracking contacts, logging every
interaction, and seeing an at-a-glance sales pipeline. Built for an individual operator
(solo founder, freelancer, consultant, or salesperson) who manages relationships and
deals themselves and does not want the weight of an enterprise CRM.

## Who it's for

The hands-on relationship-owner — one person who is both the salesperson and the
account manager. They currently track contacts in their head, a spreadsheet, or scattered
notes, and lose deals to forgotten follow-ups rather than to lost pitches.

## The problem

Deals slip silently. Follow-ups get forgotten, "last touch" is invisible, and there is
no single place that shows which relationships are going cold. The cost is not messiness
— it is lost revenue from contacts who were never followed up.

## The solution — what shipped

1. **Today dashboard** (the hero view) — opens on what matters: contacts that have gone
   cold or were never touched, with **cold / cooling / fresh** counts so the next
   follow-up is obvious at a glance.
2. **Contacts** — a searchable list, sorted **coldest-first**, with name, company, and an
   automatically maintained "last touch" date; each contact has a detail page with a
   quick "log interaction" and a chronological timeline.
3. **Interaction log** — timestamped **calls, emails, notes, and meetings** recorded
   against each contact; logging an interaction updates that contact's "last touch."
4. **Pipeline** — a drag-and-drop stage board where each contact/deal moves through:
   **Lead → Contacted → Proposal → Won / Lost**. Stages are the default and are
   renamable, addable, and deletable.

The pieces are linked: an interaction updates last-touch, which feeds the cold/cooling/
fresh states on the Today view, and the pipeline always reflects current reality. The
cold/warm thresholds and default stages are owner-configurable without code.

## Core principle

Make the cold ones impossible to miss. The product's job is to surface who has gone
quiet and needs a follow-up, so revenue stops leaking through forgotten contacts.

## Scope (current)

- In (shipped): Today dashboard with cold/cooling/fresh states, contacts (coldest-first,
  searchable, detail + timeline), interaction logging (call/email/note/meeting),
  drag-and-drop pipeline with renamable/addable/deletable stages, configurable
  cold/warm thresholds and default stages.
- Out (for now): team/multi-user collaboration, email integration/sync, automation,
  reminder nudges, win/loss reporting beyond the pipeline view.

## Open questions

- What the user sells and to whom — this shapes the pipeline stages and the value of a
  "deal." (Asked; awaiting answer. App ships with sensible defaults until then.)
- Branding: logo and color palette (name confirmed as **Pipeline**; visual identity not
  yet set).
