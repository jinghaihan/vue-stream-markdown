# Benchmarks

Run benchmarks from the repository root:

| Command                 | Measures                                       | Comparison                          |
| ----------------------- | ---------------------------------------------- | ----------------------------------- |
| `pnpm bench:completion` | Markdown completion only                       | Markmend, Remend, Comark auto-close |
| `pnpm bench:parser`     | Completion plus AST parsing                    | Markmend, Streamdown, pure Comark   |
| `pnpm bench:render`     | Initial and streaming DOM rendering            | Vue Stream Markdown, Streamdown     |
| `pnpm bench:code`       | Streaming code blocks with syntax highlighting | Vue Stream Markdown, Streamdown     |

The benchmark package measures performance only. Behavioral contracts and regressions belong in the root `test/` suite.
