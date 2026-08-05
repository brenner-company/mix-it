# Mix-it MVP product specification

## Product summary

Mix-it is an installable, mobile-first Progressive Web App for DIY renovators and
professional contractors. It helps users find a curated mixable construction
product and determine the powder and liquid quantities needed for a job without
repeatedly consulting the manufacturer's technical documentation.

The MVP targets European markets. Dutch is the first interface language and
English is also available. All measurements are metric.

## Goals

- Calculate the required liquid for a known powder mass.
- Calculate the required powder and liquid for an area and layer thickness.
- Make reviewed manufacturer mixing information searchable and available offline.
- Keep Market and Language independent so one Product Family can have different
  names and facts in different markets.
- Clearly distinguish calculated estimates from manufacturer guidance.

## Users

The primary users are DIY renovators. Professional contractors are a secondary
audience and should be able to use the same focused workflows without consumer-only
language or unnecessary explanation.

## Application shape

The MVP is a responsive PWA rather than a native application. After its initial
load, the catalog and calculators must work offline. Catalog changes ship as
versioned data with an application update; the MVP has no live catalog backend.

## Market and language

Market and Language are separate user settings:

- Market determines available Market Variants and result number formatting.
- Language determines interface text and translated mixing instructions.
- The browser or device region provides the initial Market default.
- The user can override both settings.
- Numeric inputs accept both comma and point decimal separators regardless of
  Market. Results use the selected Market's convention.
- Decimal inputs include a brief example of the displayed notation.

A Product Family can have independent Market Variants. For example, the same
underlying product may have different names, product codes, packaging,
instructions, Source Documents, or calculation values in Belgium and the UK.

## Catalog discovery

Users can search the reviewed catalog by:

- Market Variant name
- manufacturer
- product code
- category

Users can filter results by manufacturer. Only Market Variants available in the
selected Market and successfully subjected to Catalog Review are visible.

## Product calculator

Each Market Variant has a single product screen with a compact segmented control:

- **Powder amount**
- **Area to cover**

Only the selected calculator is displayed. Values are preserved when switching
between calculator modes.

### Powder amount

The user enters an available or intended powder mass. The result shows:

- the exact powder mass entered;
- the required liquid;
- concise mixing instructions;
- mixing time; and
- working time.

The liquid quantity is derived from the Market Variant's Mixing Ratio.

### Area to cover

The user supplies:

- width and height, with metres or centimetres selectable, or a direct area in m²;
- layer thickness in millimetres; and
- a Waste Margin, defaulting to 10%.

The result shows:

- required powder mass;
- required liquid;
- the assumptions used, such as area, thickness, and Waste Margin;
- concise mixing instructions;
- mixing time; and
- working time.

The manufacturer-published Reference Thickness is the initial thickness value. A
user can replace it with a value outside the Supported Thickness Range. In that
case, the app clearly identifies the published range, warns that the value is
outside manufacturer guidance, and still allows the calculation.

If a Market Variant has a Mixing Ratio but lacks Reference Consumption data, the
powder calculator remains available while the area calculator is disabled.

## Calculation rules

All calculations retain full precision internally.

For an area calculation:

```text
base powder = area × reference consumption
               × (requested thickness / reference thickness)

required powder = base powder × (1 + waste margin)

required liquid = required powder × liquid per unit of powder
```

Reference Consumption is scaled linearly with layer thickness. The Waste Margin
therefore increases powder and liquid proportionally.

The MVP reports the exact required total powder mass. It does not recommend bag
counts, package combinations, purchase quantities, or prices.

## Liquid presentation

Only displayed values are rounded; calculations retain full precision:

- Below 1 litre: display millilitres rounded to 1 ml, for example `847 ml`.
- From 1 litre to below 5 litres: display millilitres rounded to 10 ml, for
  example `3,240 ml` or `3.240 ml`, depending on Market.
- From 5 litres: display litres rounded to 0.1 L, for example `7.3 L` or `7,3 L`,
  depending on Market.

## Catalog data and review

Manufacturer Source Documents are transformed through a local developer workflow
into lightweight, versioned catalog data. A Market Variant remains hidden until a
human Catalog Review confirms the extracted data against its Source Document.
Ambiguous, inconsistent, or suspected copied text blocks publication until they
are resolved.

Each Market Variant should record:

- stable identifier and Product Family identifier;
- manufacturer, Market, name, product code, category, and search aliases;
- packaging information for reference;
- Mixing Ratio;
- Reference Consumption and Reference Thickness, when available;
- Supported Thickness Range;
- mixing instructions, mixing time, and working time;
- available Language translations;
- Source Document identity, version or publication date;
- review status and last-reviewed date; and
- catalog data version.

Manufacturer-provided English Source Documents may be used to author or verify
English instructions. Translations remain attached to the relevant Market Variant
and do not turn distinct Market Variants into one global product record.

## Disclaimer and traceability

Results include a short disclaimer and a visible last-reviewed date. An override
of the Supported Thickness Range receives an additional warning. The MVP does not
link users to the original Source Document, but its identity and version remain in
the catalog data for traceability.

## Deferred scope

The following are explicitly outside the MVP:

- accounts and cloud synchronization;
- favourites;
- user submissions;
- a live database or catalog-management interface;
- bag and package optimization;
- pricing;
- subtracting windows, doors, or other excluded areas;
- repeated-surface inputs;
- analytics;
- original Source Document viewing; and
- native mobile applications.

## Related decisions

- [ADR 0001: Model products as market-specific variants](adr/0001-model-products-as-market-variants.md)
- [ADR 0002: Require catalog review before publication](adr/0002-require-catalog-review-before-publication.md)
- [ADR 0003: Scale reference consumption linearly by thickness](adr/0003-scale-consumption-linearly-by-thickness.md)
