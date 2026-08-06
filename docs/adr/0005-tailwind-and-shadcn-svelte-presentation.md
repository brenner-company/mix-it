# ADR-0005: Use Tailwind and source-owned shadcn-svelte primitives for presentation

## Status

Accepted

## Context

Mix-it's product-facing interface was built from bespoke markup and scoped CSS.
That made shared controls and accessibility behavior expensive to keep aligned
across the catalog, Preferences, and Market Variant calculator. The application
also needs to remain a static, installable Progressive Web App, so a presentation
foundation must compile into the existing atomic release rather than depend on a
runtime service.

## Decision

Use Tailwind CSS v4 for normal layout and styling, and use shadcn-svelte as a
source-owned component system. Initialize the system with the Rhea style, neutral
base color, Inter typography, Lucide icons, default Rhea radius, and the restrained
primary accent defined by the approved preset.

Generic primitives live under `src/lib/components/ui` and are kept close to the
upstream registry implementation. Market, Language, catalog, and calculator
composition remains in domain-oriented components outside that directory.
Semantic tokens and supported component variants are preferred over route-specific
color and geometry rules.

The migration was incremental, but is now complete. All product-facing controls
and composition use the source-owned primitives and Tailwind utilities. Global
CSS is limited to semantic theme tokens, document defaults, accessibility
behavior, and rare structural behavior that utilities cannot express clearly.

## Custom-CSS boundary

Route-scoped CSS is not permitted for routine colors, typography, spacing,
responsive layout, borders, shadows, or control styling. A structural exception
must be easier to understand and maintain as CSS than as a long or misleading
utility composition, and it must remain in the global/base layer. Semantic HTML
such as sections, asides, lists, and description lists remains welcome when it
communicates domain meaning.

## Upstream-update policy

Generated primitives are kept close to the shadcn-svelte registry. An upstream
update is performed deliberately with the project CLI, reviewed as a source diff,
and followed by static checks, browser accessibility journeys, and the production
offline-release test. Product behavior belongs in the domain composition layer;
primitive changes are reserved for an explicit accessibility or platform need.

## Alternatives considered

- Keep bespoke scoped CSS: smallest immediate dependency change, but it preserves
  duplicated control behavior and the maintenance problem this migration addresses.
- Adopt a runtime component library: rejected because it adds abstraction and
  runtime coupling that are unnecessary for a static PWA.
- Use Tailwind without source-owned primitives: rejected because shared accessible
  behavior would remain spread through route markup and could not be reviewed as a
  stable project vocabulary.

## Consequences

- Tailwind, Bits UI, Lucide, and the shadcn-svelte utility dependencies become part
  of the build and must be included in every offline release.
- Components are easy to inspect and customize, but upstream updates require the
  deliberate policy above followed by review of the generated diff.
- The visual language is reset toward a compact, information-dense interface;
  existing workflows, domain semantics, persistence, routes, and calculation
  behavior remain unchanged.
- Bundle sizes are measured at the start of the migration and compared after
  subsequent slices rather than governed by an arbitrary threshold.
- This decision remains compatible with [ADR 0004](0004-build-the-mvp-as-a-static-progressive-web-app.md):
  generated CSS, JavaScript, primitives, translations, routes, and the reviewed
  catalog ship together in the same complete versioned service-worker cache.
