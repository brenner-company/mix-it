# Mix-it

Mix-it helps people determine the powder and liquid quantities needed to prepare mixable construction products, using reviewed manufacturer information for the selected market.

## Catalog

**Product Family**:
A manufacturer product that may be sold under different identities in different markets.
_Avoid_: Product, global product

**Market Variant**:
The market-specific form of a Product Family, with its own name, product code, availability, packaging, instructions, source material, and calculation data.
_Avoid_: Product, translation, locale variant

**Market**:
The country or sales region that determines which Market Variants are available and how quantities are formatted.
_Avoid_: Language, locale

**Source Document**:
Manufacturer-issued technical documentation from which a Market Variant's instructions and calculation data are derived.
_Avoid_: Datasheet, PDF

**Catalog Review**:
Human verification that a Market Variant accurately represents its Source Document and is safe to publish in the catalog.
_Avoid_: Import, approval

## Calculation

**Mixing Ratio**:
The amount of liquid required for a given powder mass of a Market Variant.
_Avoid_: Ratio, water ratio

**Reference Consumption**:
The manufacturer-published powder mass needed per unit area at a specified Reference Thickness.
_Avoid_: Coverage, yield

**Reference Thickness**:
The layer thickness at which Reference Consumption is published.
_Avoid_: Default thickness

**Supported Thickness Range**:
The manufacturer-published minimum and maximum application thickness for a Market Variant.
_Avoid_: Valid thickness, allowed thickness

**Waste Margin**:
An allowance added proportionally to the calculated powder and liquid quantities to account for material loss during application.
_Avoid_: Buffer, contingency

## Presentation

**Language**:
The user's choice of interface and instruction translation, independent of Market.
_Avoid_: Market, locale
