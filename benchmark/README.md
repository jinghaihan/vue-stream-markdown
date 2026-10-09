# Benchmarks

Run benchmarks from the repository root:

```sh
pnpm build
pnpm bench:parser
pnpm bench:render
pnpm bench:code
```

The benchmark configuration resolves workspace packages to their built output. Rebuild after changing library code. Both sides use built artifacts to avoid measuring Vite's source-module getter overhead.

| Command                     | Measures                                       | Comparison                          |
| --------------------------- | ---------------------------------------------- | ----------------------------------- |
| `pnpm bench:completion`     | Markdown completion only                       | Markmend, Remend, Comark auto-close |
| `pnpm bench:parser`         | Completion plus AST parsing                    | Markmend, Streamdown, pure Comark   |
| `pnpm bench:render`         | Initial and streaming DOM rendering            | Vue Stream Markdown, Streamdown     |
| `pnpm bench:code`           | Streaming code blocks with syntax highlighting | Vue Stream Markdown, Streamdown     |
| `pnpm bench:code-highlight` | Complete blocks and streaming appends (no DOM) | Vue Stream Markdown                 |

The benchmark package measures performance only. Behavioral contracts and regressions belong in the root `test/` suite.

## Repeated comparison

```sh
pnpm bench:compare
# Or choose the number of runs (default: 5):
pnpm bench:compare 7
```

This builds the packages once, then runs parsing, DOM rendering, and growing code-block comparisons serially. Each scenario uses Vitest's interleaved `bench.compare` sampling. The summary in `benchmark/results/latest.json` records exact package versions, environment, per-run throughput and error estimates, and median throughput across runs. Raw Vitest reports are saved alongside it and ignored by Git.

DOM measurements use jsdom, with controls and animation disabled and highlighters warmed up. Waiting for completed DOM output includes polling timers; these figures do not measure browser layout, paint, or animation smoothness. Stable-code scenarios reuse a completed code block while prose grows after it. Growing-code scenarios append 20 lines inside an unfinished fence, with fresh source per session to avoid complete-result cache hits.

Record results on an otherwise idle machine. Compare versions in the same environment; historical documentation snapshots are not controlled before/after baselines.

For a before/after highlighting comparison in the same run, set `CODE_HIGHLIGHT_BASELINE` to a built `@stream-markdown/code` entry from the previous revision, then run `pnpm bench:code-highlight`. Both implementations receive the same workload with fresh source text on every iteration.
