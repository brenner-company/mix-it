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

For comparison, the issue #10 foundation build emitted 49,818 CSS bytes and
433,668 JavaScript bytes. The increase includes Tailwind's generated theme and
the source-owned Select/Bits UI runtime plus Inter; it is recorded for review
rather than treated as an arbitrary pass/fail budget.
