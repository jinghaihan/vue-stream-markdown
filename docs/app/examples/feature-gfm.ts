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
| Feature | Description | Status |
|---------|-------------|--------|
| **Code blocks** | Optional \`Shiki\` highlighting | ✅ Ready |
| *Custom tags* | Map tags to Vue components | ✅ Ready |
| ~~Legacy parser~~ | Replaced by incremental parsing | ❌ Removed |
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
Visit https://vue-stream-markdown.netlify.app for the documentation.

Browse https://github.com/jinghaihan/vue-stream-markdown for source and examples.

Contact jhh19980114@gmail.com
`

const autoLink2 = `
Check out github.com/jinghaihan/vue-stream-markdown
`

export { alignmentTable, autoLink, autoLink2, complexTable, complexTaskList, nestedTaskList, strikethrough, table, taskList }
