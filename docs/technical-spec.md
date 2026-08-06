# Mix-it technical design

## Design goals

The MVP is a small, installable application that must keep its reviewed catalog
and calculators available after the network disappears. Its technical design
therefore favours a static application, explicit data validation, and a pure
calculation core over server infrastructure or general-purpose application
frameworks.

The implementation should remain:

- fast and usable on mobile devices;
- fully functional offline after its initial load;
- safe to update without mixing application and catalog versions;
- explicit about the separation between Market and Language; and
- straightforward to verify against the calculation rules and Source Documents.

## Application architecture

Mix-it is a statically generated Progressive Web App. SvelteKit prerenders the
application, and a service worker caches the application shell, routes, interface
translations, and published catalog as one versioned release. There is no runtime
backend in the MVP.

The application has four main boundaries:

1. **Catalog** loads and searches published Market Variants.
2. **Calculation** accepts normalized metric quantities and returns unformatted
   results, assumptions, and guidance warnings.
3. **Presentation** parses user input and formats results for the selected Market.
4. **Preferences** retains the selected Market, Language, and useful calculator
   state on the device.

Dependencies point inward toward the catalog types and pure calculation
functions. Calculation code must not depend on Svelte, browser storage, or
localization.

## Technology stack

| Concern | Choice | Reason |
| --- | --- | --- |
| Application | SvelteKit, Svelte, strict TypeScript | A compact component model with routing, static generation, and first-class service-worker support |
| Build | Vite and `@sveltejs/adapter-static` | Produces deployable static assets without a production server |
| Offline installation | SvelteKit service worker and a web app manifest | Keeps offline behaviour and cache versioning explicit |
| Styling | Tailwind CSS v4 with source-owned shadcn-svelte primitives and semantic tokens | Provides the compact, accessible presentation vocabulary for all product-facing controls and composition |
| Catalog validation | Versioned JSON validated with Zod during development and CI | Makes catalog errors fail before publication and shares types with the application |
| Localization | Paraglide JS | Keeps Dutch and English messages compile-time checked and shipped with the application |
| Number presentation | `Intl.NumberFormat` | Uses the selected Market's conventions without coupling Market to Language |
| Device persistence | `localStorage` | Sufficient for small preferences and calculator state; no queryable offline database is needed |
| Unit and integration tests | Vitest | Fast tests for calculation rules, parsing, formatting, and catalog validation |
| Browser tests | Playwright | Covers mobile viewports, touch interaction, locales, supported browsers, and offline behaviour |
| Automation | GitHub Actions | Runs validation, tests, and the production build for every proposed release |
| Hosting | Static HTTPS hosting | The generated application can be served from any CDN-backed static host |

Exact dependency and runtime versions belong in `package.json` and the lockfile,
not in this document.

## Calculation design

Calculation functions operate on normalized metric values and preserve the full
precision of JavaScript numbers through every intermediate step. Rounding occurs
only when a result is presented. The supported input ranges do not require an
arbitrary-precision arithmetic dependency.

Input parsing and output formatting are separate operations. Numeric inputs
normalize either a comma or point decimal separator. Output uses
`Intl.NumberFormat` configured for the selected Market, including the liquid
display thresholds defined in the product specification.

Area calculations return the assumptions used and whether the requested
thickness falls outside the Supported Thickness Range. This lets the presentation
show the required warning without embedding interface text in the calculation
module.

## Catalog workflow

Source Documents remain in the local developer workflow and are not shipped to
the MVP application. Extraction may help prepare a candidate Market Variant, but
it never makes that variant publishable automatically.

The catalog workflow is:

1. extract or transcribe candidate facts from a Source Document;
2. validate the candidate against the catalog schema;
3. perform Catalog Review against the Source Document;
4. mark the Market Variant with its review status and last-reviewed date; and
5. generate the published catalog from successfully reviewed variants only.

Development and CI fail on schema violations, duplicate identifiers, invalid
quantity ranges, missing translations required for publication, and other
cross-record inconsistencies. The generated catalog includes a data version and
is cached with the matching application release.

Search runs locally over the published catalog. The initial catalog is small
enough for normalized substring and token matching without a search service or
search-index dependency. A dedicated client-side search library should be added
only if measured catalog growth makes it necessary.

## Local state and updates

The selected Market and Language are independent stored preferences. Calculator
values may also be retained for convenience, but catalog facts are never written
to browser storage as user-editable data.

Each deployment uses a new service-worker cache version. Installation should
populate the complete application and catalog cache before activating it, and
activation should remove obsolete caches. An interrupted update therefore leaves
the previous complete release usable rather than combining files from two
catalog versions. Source-owned shadcn-svelte primitives and generated Tailwind
CSS are application assets in that same atomic release; presentation dependencies
must not introduce a runtime service or a separately versioned cache.

## Presentation boundary

Tailwind utilities and composition from `src/lib/components/ui` are the default
for product-facing controls and layout. Generic primitives stay close to their
upstream shadcn-svelte registry implementation, while Market Variant, catalog,
calculator, and preference concepts remain in domain-oriented components outside
the generic UI layer.

Custom CSS in `src/app.css` is limited to semantic theme tokens, document/base
behavior, focus and reduced-motion accessibility behavior, and structural rules
that Tailwind cannot express clearly. Route-scoped styling is not used for
colors, typography, routine spacing, responsive layout, borders, shadows, or
control appearance. This boundary keeps the static PWA presentation explicit and
ensures new UI work uses the same inspectable source-owned vocabulary.

## Verification strategy

Vitest covers:

- the formulas and liquid presentation thresholds;
- unit conversion and comma-or-point input parsing;
- Waste Margin and thickness-range behaviour;
- Market-specific formatting;
- catalog schema and publication rules; and
- search filtering by Market, manufacturer, product code, and category.

Playwright covers the two calculator journeys, switching calculator modes,
Market and Language independence, mobile accessibility, installation-critical
metadata, and a reload with the network disabled. Browser tests should include
Chromium, Firefox, and WebKit, with at least one touch-sized mobile project.

## Deliberately deferred infrastructure

The MVP does not need a server runtime, API, database, authentication, cloud
synchronization, native application wrapper, analytics SDK, or catalog-management
interface. Adding any of these should follow a concrete product requirement rather
than being provisioned speculatively.

## Related decisions

- [ADR 0001: Model products as market-specific variants](adr/0001-model-products-as-market-variants.md)
- [ADR 0002: Require catalog review before publication](adr/0002-require-catalog-review-before-publication.md)
- [ADR 0003: Scale reference consumption linearly by thickness](adr/0003-scale-consumption-linearly-by-thickness.md)
- [ADR 0004: Build the MVP as a static Progressive Web App](adr/0004-build-the-mvp-as-a-static-progressive-web-app.md)
