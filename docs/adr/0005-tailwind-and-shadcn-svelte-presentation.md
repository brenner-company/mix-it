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

The migration is incremental. The shared shell and Preferences use the new
foundation first; legacy styling for unmigrated catalog and calculator surfaces
may coexist temporarily. New slices remove the legacy rules they replace. Global
CSS is limited to theme tokens, document defaults, accessibility behavior, and
the explicit compatibility rules required by those legacy surfaces.

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
- Components are easy to inspect and customize, but upstream updates require a
  deliberate CLI update followed by a review of the generated diff.
- The visual language is reset toward a compact, information-dense interface;
  existing workflows, domain semantics, persistence, routes, and calculation
  behavior remain unchanged.
- Bundle sizes are measured at the start of the migration and compared after
  subsequent slices rather than governed by an arbitrary threshold.
