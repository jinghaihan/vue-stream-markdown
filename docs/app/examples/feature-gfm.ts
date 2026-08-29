const table = `
| Feature | Supported | Notes |
|---------|-----------|-------|
| Tables | ✅ | Full support |
| Task Lists | ✅ | Interactive |
| Strikethrough | ✅ | ~~Like this~~ |
`

const alignmentTable = `
| Left | Center | Right |
|:-----|:------:|------:|
| A | B | C |
| 1 | 2 | 3 |
`

const complexTable = `
| Name | Description | Status |
|------|-------------|--------|
| **Streamdown** | A \`react-markdown\` replacement | ✅ Active |
| *Feature X* | Under development | 🚧 WIP |
| ~~Old Package~~ | Deprecated | ❌ Removed |
`

const taskList = `
- [x] Setup project structure
- [x] Install dependencies
- [ ] Write documentation
- [ ] Deploy to production
`

const nestedTaskList = `
- [ ] Phase 1: Setup
  - [x] Initialize repository
  - [x] Configure build tools
  - [ ] Setup CI/CD
- [ ] Phase 2: Development
  - [ ] Implement features
  - [ ] Write tests
`

const complexTaskList = `
## Shopping List
- [ ] Milk
- [ ] Eggs
- [x] Bread

> **Note**: Here's a quote with tasks:
> - [x] Complete quote formatting
> - [ ] Add more examples
`

const strikethrough = `
**Before:** ~~500ms response time~~
**After:** 50ms response time ⚡
`

const autoLink = `
Visit https://streamdown.ai for more info.

Contact us at hello@streamdown.ai
`

const autoLink2 = `
Check out github.com/vercel/streamdown
`

export { alignmentTable, autoLink, autoLink2, complexTable, complexTaskList, nestedTaskList, strikethrough, table, taskList }
