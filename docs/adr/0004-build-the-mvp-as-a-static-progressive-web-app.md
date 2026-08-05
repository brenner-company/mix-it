# Build the MVP as a static Progressive Web App

Mix-it must remain useful offline, while its catalog changes only through reviewed,
versioned application releases. Build the MVP as a statically generated SvelteKit
Progressive Web App whose service worker caches the application and published
catalog together; do not introduce a runtime backend or database until a future
requirement needs server-owned state. This keeps deployment and offline updates
simple, at the cost of requiring an application release for every catalog update.
