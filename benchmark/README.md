# Benchmarks

Run benchmarks from the repository root:

| Command                     | Measures                                       | Comparison                          |
| --------------------------- | ---------------------------------------------- | ----------------------------------- |
| `pnpm bench:completion`     | Markdown completion only                       | Markmend, Remend, Comark auto-close |
| `pnpm bench:parser`         | Completion plus AST parsing                    | Markmend, Streamdown, pure Comark   |
| `pnpm bench:render`         | Initial and streaming DOM rendering            | Vue Stream Markdown, Streamdown     |
| `pnpm bench:code`           | Streaming code blocks with syntax highlighting | Vue Stream Markdown, Streamdown     |
| `pnpm bench:code-highlight` | Complete blocks and streaming appends (no DOM) | Vue Stream Markdown                 |

The benchmark package measures performance only. Behavioral contracts and regressions belong in the root `test/` suite.

For a before/after highlighting comparison in the same run, set `CODE_HIGHLIGHT_BASELINE` to a built `@stream-markdown/code` entry from the previous revision, then run `pnpm bench:code-highlight`. Both implementations receive the same workload with fresh source text on every iteration.
