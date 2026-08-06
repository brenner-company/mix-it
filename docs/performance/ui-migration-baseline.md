# UI migration bundle baseline

Captured before issue #10 introduced Tailwind CSS and shadcn-svelte, from commit
`902a07c` on 2026-08-06.

The baseline was produced with:

```sh
npm run build
find build -type f -name '*.css' -print0 | xargs -0 wc -c
find build -type f -name '*.js' -print0 | xargs -0 wc -c
```

| Asset type | Emitted bytes |
| --- | ---: |
| CSS | 11,073 |
| JavaScript | 275,909 |

The totals include all emitted production CSS and JavaScript files in `build`,
including the service worker. Re-run the same commands after each migration slice
so dependency and generated-component growth remains visible.

For comparison, the issue #10 foundation build emitted 49,935 CSS bytes and
433,735 JavaScript bytes. The increase includes Tailwind's generated theme and
the source-owned Select/Bits UI runtime plus Inter; it is recorded for review
rather than treated as an arbitrary pass/fail budget.

## Final release comparison

Captured after issue #16's presentation cleanup with the same commands:

| Asset type | Initial baseline | Issue #10 foundation | Final issue #16 release |
| --- | ---: | ---: | ---: |
| CSS | 11,073 | 49,935 | 61,266 |
| JavaScript | 275,909 | 433,735 | 524,743 |
| Combined | 286,982 | 483,670 | 586,009 |

The final release adds 11,331 CSS bytes and 91,008 JavaScript bytes over the
foundation build. This is material growth, but it is accounted for by the
completed product-facing component composition, compiled catalog/application
routes, and the atomic service-worker release; no runtime backend or separate
presentation service was introduced. The final totals remain the recorded
comparison point for later UI changes.

The approved desktop and mobile reference states are captured as Playwright
attachments by the final Market Variant journey. Attachments are intentional
here: the supported CI matrix spans operating systems, so platform-specific
pixel baselines would make the cross-browser release gate brittle without
improving the reference review.
