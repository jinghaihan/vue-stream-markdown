# vue-stream-markdown Internal Package Split Plan

> Internal planning document for repository refactoring. This file is for development use and is not part of the public docs site.

## 1. Background and Goals

The repository already uses a `pnpm workspace`, but the `vue-stream-markdown` package still mixes several layers of responsibility:

- Public API for end users
- Vue rendering and component layer
- External runtime loading logic
- Shiki / Mermaid / KaTeX runtime details
- A set of framework-agnostic utility functions

The goal of this refactor is not to publish more npm packages. The real goal is to establish stable internal boundaries so the project is easier to maintain and extend.

Goals of this split:

- Split low-level technical capabilities into internal packages
- Keep `vue-stream-markdown` as the only public Vue package
- Keep `renderer`, `previewer`, context, and public props in the main package
- Limit internal packages to loading, runtime logic, and pure helper logic
- Create room for future multi-implementation architecture

Non-goals for this round:

- Introducing new public npm packages
- Changing public import paths for users
- Rewriting the full rendering layer
- Making every type perfectly shared and pure in one pass

## 2. Core Decisions

### 2.1 Renderers and previewers stay in the main package

`renderer` and `previewer` belong to the Vue rendering layer. They describe how Markdown nodes become concrete UI, so they should not move into the internal technical packages.

The following should stay in the main package:

- `src/components/renderers/*`
- `src/components/previewers/*`
- `src/components/code-block/*`
- UI components under `src/components/*`
- `src/index.vue`
- `src/composables/use-context.ts`
- Logic tied to context, controls, previewers, and UI composition

### 2.2 Internal packages only handle runtime / adapter responsibilities

Internal packages should be responsible for:

- Local module detection
- CDN URL resolution
- Dynamic imports
- Runtime initialization for each technology
- Parsing / rendering / conversion logic specific to that technology
- Returning results that the main package can consume

Internal packages should not be responsible for:

- Vue SFCs
- `Component` types
- Default UI components
- `useContext`
- Controls / previewers / i18n composition
- Public prop structures

### 2.3 Mermaid must not directly depend on the code package

`beautiful-mermaid` can derive colors from a Shiki theme, but that should not force `@stream-markdown/mermaid` to depend directly on `@stream-markdown/code`.

Use an optional injected method instead:

```
getThemeColors?: () => Promise<Record<string, string> | null>
```

That allows the Mermaid runtime to request colors when needed without hard-coding a dependency on the Shiki runtime.

Benefits:

- Clearer Mermaid package responsibility
- Better decoupling between Mermaid and code
- The method is unused in plain Mermaid mode
- Future color providers can be swapped in the main package

### 2.4 Use `packages/internal/*` for internal package directories

Recommended directory structure:

```txt
packages/
  markmend/
  vue-stream-markdown/
  internal/
    shared/
    code/
    mermaid/
    math/
```

Corresponding package names:

- `@stream-markdown/shared`
- `@stream-markdown/code`
- `@stream-markdown/mermaid`
- `@stream-markdown/math`

Why this structure:

- The nested directory clearly communicates "internal domain"
- Package names stay short and readable
- The pattern scales well if more internal packages are added later

## 3. Target Package Structure

### 3.1 `packages/vue-stream-markdown`

Role:

- The only public package
- The main Vue package
- Owns the public API, main entry, rendering layer, default UI, styles, and documentation compatibility

Responsibilities:

- `Markdown` component
- Node renderers / previewers / code block components
- Vue-facing logic such as `useContext`, `useControls`, `useI18n`, `useFloating`
- Public props and public option types
- Default icons, default UI, locales, and CSS
- Thin wrappers around internal runtime packages

### 3.2 `packages/internal/shared`

Role:

- Internal shared runtime utility package

Responsibilities:

- Environment detection
- Generic dynamic import helpers
- Common CDN utilities
- Browser file download / export utilities
- URL hardening
- Table export utilities
- Shared runtime result types

Must not depend on:

- `vue`
- `shiki`
- `mermaid`
- `beautiful-mermaid`
- `katex`
- Renderer or component registries from the main package

### 3.3 `packages/internal/code`

Role:

- Shiki runtime package

Responsibilities:

- Shiki module detection
- Shiki CDN loader
- Shared highlighter lifecycle
- Language normalization
- Theme normalization
- `codeToTokens`
- Runtime-level preload / dispose behavior

Must not handle:

- Vue components
- SFC rendering of tokens
- Language icon components
- Controls

### 3.4 `packages/internal/mermaid`

Role:

- Mermaid runtime package

Responsibilities:

- Mermaid / beautiful-mermaid module detection
- Mermaid / beautiful-mermaid CDN loaders
- Renderer type resolution
- Mermaid parse / render
- Runtime logic needed for SVG export
- `getThemeColors` integration point

Must not handle:

- Vue previewers
- Fullscreen / preview / control UI logic in the main package
- Code block UI concerns

### 3.5 `packages/internal/math`

Role:

- KaTeX runtime package

Responsibilities:

- KaTeX module detection
- KaTeX CDN loader
- KaTeX CSS loader
- `renderToString`
- Runtime-level preload / dispose behavior

Must not handle:

- `math.vue` / `inline-math.vue`
- Vue watch / throttle wrappers
- Error component selection

## 4. Dependency Rules

Target dependency direction:

```txt
@stream-markdown/shared
  ^
  |
@stream-markdown/code
@stream-markdown/mermaid
@stream-markdown/math
  ^
  |
vue-stream-markdown
```

Rules:

- `@stream-markdown/shared` depends on no other internal package
- `@stream-markdown/code` depends only on `@stream-markdown/shared`
- `@stream-markdown/math` depends only on `@stream-markdown/shared`
- `@stream-markdown/mermaid` depends only on `@stream-markdown/shared`
- `@stream-markdown/mermaid` must not directly depend on `@stream-markdown/code`
- `vue-stream-markdown` depends on all internal packages plus `markmend`
- `markmend` stays independent and should not depend on these internal packages

## 5. Public API Strategy

### 5.1 Public import paths remain unchanged

External users should continue importing only from:

- `vue-stream-markdown`
- `markmend`

These internal packages should not be exposed as public API:

- `@stream-markdown/shared`
- `@stream-markdown/code`
- `@stream-markdown/mermaid`
- `@stream-markdown/math`

### 5.2 Public types remain owned by the main package

These types should continue to be defined and exported by the main package:

- `ShikiOptions`
- `MermaidOptions`
- `KatexOptions`
- `CdnOptions`
- `StreamMarkdownProps`
- `StreamMarkdownContext`
- Renderer prop types

Why:

- Avoid leaking internal package names into the generated `.d.ts`
- Avoid forcing npm users to resolve private internal packages
- Keep the public contract stable

### 5.3 Internal packages should use runtime-oriented types

Internal packages should define their own runtime types, for example:

- `CodeRuntimeOptions`
- `MermaidRuntimeOptions`
- `MathRuntimeOptions`
- `SharedCdnOptions`

The main package is responsible for mapping public types to runtime types.

## 6. Recommended Runtime API Shape

These are suggested API shapes. The boundary matters more than exact names.

### 6.1 `@stream-markdown/code`

```ts
export interface CodeRuntimeOptions {
  lang?: string
  isDark?: boolean
  cdnOptions?: SharedCdnOptions
  theme?: [string, string]
  langs?: string[]
  langAlias?: Record<string, string>
  codeToTokenOptions?: Record<string, unknown>
}

export function createShikiRuntime(options?: CodeRuntimeOptions): {
  installed: Promise<boolean> | boolean
  preload: () => Promise<void>
  dispose: () => void
  getHighlighter: () => Promise<Highlighter>
  codeToTokens: (code: string) => Promise<TokensResult>
  getLanguage: () => Promise<string>
}

export function disposeSharedShikiHighlighter(): void
```

### 6.2 `@stream-markdown/mermaid`

```ts
export interface MermaidRuntimeOptions {
  renderer?: 'vanilla' | 'beautiful'
  theme?: [string, string]
  beautifulTheme?: [string, string]
  config?: MermaidConfig
  beautifulConfig?: RenderOptions
  cdnOptions?: SharedCdnOptions
  isDark?: boolean
  getThemeColors?: () => Promise<Record<string, string> | null>
}

export function createMermaidRuntime(options?: MermaidRuntimeOptions): {
  installed: Promise<boolean> | boolean
  preload: () => Promise<void>
  dispose: () => void
  parse: (code: string) => Promise<MermaidParseResult>
  render: (code: string) => Promise<MermaidRenderResult>
  save: (format: 'svg' | 'png', code: string) => Promise<void>
}

export function resolveMermaidRendererType(...args): Promise<'beautiful' | 'vanilla'>
```

### 6.3 `@stream-markdown/math`

```ts
export interface MathRuntimeOptions {
  cdnOptions?: SharedCdnOptions
}

export interface RenderMathOptions {
  displayMode?: boolean
  config?: KatexOptions
}

export function createKatexRuntime(options?: MathRuntimeOptions): {
  installed: Promise<boolean> | boolean
  preload: () => Promise<void>
  dispose: () => void
  ensureCss: () => void
  renderToHtml: (code: string, options?: RenderMathOptions) => Promise<{
    html?: string
    error?: string
  }>
}
```

## 7. File Migration Plan

The table below describes the recommended target location for current files. This does not have to happen all at once, but the refactor should converge toward this boundary.

| Current file                                                                        | Target location                                              | Notes                                                           |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `packages/vue-stream-markdown/src/utils/inference.ts`                               | `packages/internal/shared/src/env.ts`                        | Environment detection                                           |
| `packages/vue-stream-markdown/src/utils/module.ts`                                  | `packages/internal/shared/src/modules/detect.ts`             | Module availability detection                                   |
| `packages/vue-stream-markdown/src/composables/modules/_utils.ts`                    | `packages/internal/shared/src/cdn/utils.ts`                  | Common CDN / dynamic import helpers                             |
| `packages/vue-stream-markdown/src/utils/harden.ts`                                  | `packages/internal/shared/src/security/harden.ts`            | Pure utility logic                                              |
| `packages/vue-stream-markdown/src/utils/table.ts`                                   | `packages/internal/shared/src/table.ts`                      | Pure utility logic                                              |
| `packages/vue-stream-markdown/src/utils/helper.ts`                                  | `packages/internal/shared/src/browser/file.ts`               | `removeTrailingSlash`, `save`, `svgToPngBlob`, etc.             |
| `packages/vue-stream-markdown/src/composables/modules/use-shiki-cdn.ts`             | `packages/internal/code/src/cdn.ts`                          | Shiki CDN loader                                                |
| `packages/vue-stream-markdown/src/composables/use-shiki.ts`                         | Split into `internal/code` runtime + main package wrapper    | Main package keeps Vue-friendly wrapper                         |
| `packages/vue-stream-markdown/src/constants/code.ts`                                | Split between `internal/code` and main package               | Runtime constants move down; icon mapping stays in main package |
| `packages/vue-stream-markdown/src/composables/modules/use-mermaid-cdn.ts`           | `packages/internal/mermaid/src/mermaid-cdn.ts`               | Mermaid CDN loader                                              |
| `packages/vue-stream-markdown/src/composables/modules/use-beautiful-mermaid-cdn.ts` | `packages/internal/mermaid/src/beautiful-cdn.ts`             | beautiful-mermaid CDN loader                                    |
| `packages/vue-stream-markdown/src/composables/mermaid-renderers/*`                  | `packages/internal/mermaid/src/runtime/*`                    | Core Mermaid runtime logic                                      |
| `packages/vue-stream-markdown/src/constants/mermaid.ts`                             | `packages/internal/mermaid/src/constants.ts`                 | Mermaid runtime constants                                       |
| `packages/vue-stream-markdown/src/composables/use-mermaid.ts`                       | Split into `internal/mermaid` runtime + main package wrapper | Main package keeps context and UI integration                   |
| `packages/vue-stream-markdown/src/composables/modules/use-katex-cdn.ts`             | `packages/internal/math/src/cdn.ts`                          | KaTeX CDN loader                                                |
| `packages/vue-stream-markdown/src/composables/use-katex.ts`                         | Split into `internal/math` runtime + main package wrapper    | Main package keeps Vue-facing composition                       |
| `packages/vue-stream-markdown/src/composables/use-math-renderer.ts`                 | Stay in the main package for now                             | This is still Vue reactive composition                          |
| `packages/vue-stream-markdown/src/components/renderers/code/*`                      | Stay in the main package                                     | Rendering layer                                                 |
| `packages/vue-stream-markdown/src/components/previewers/mermaid.vue`                | Stay in the main package                                     | Previewer layer                                                 |
| `packages/vue-stream-markdown/src/components/renderers/math.vue`                    | Stay in the main package                                     | Rendering layer                                                 |
| `packages/vue-stream-markdown/src/components/renderers/inline-math.vue`             | Stay in the main package                                     | Rendering layer                                                 |

## 8. Wrappers That Should Remain in the Main Package

After the split, the main package should still keep these composables as thin Vue-facing wrappers:

- `useShiki`
- `useMermaid`
- `useKatex`
- `useMathRenderer`

These wrappers should handle:

- Mapping public options to internal runtime options
- Integrating with `useContext`
- Integrating with `computed`, `watch`, and `ref`
- Handling `Component`-related concerns
- Choosing error components
- Preserving current public API behavior

In short:

- Internal packages return runtime capabilities
- Main-package composables return Vue-friendly capabilities

## 9. Special Handling for Mermaid

Mermaid is the easiest area to over-couple, so it should be split last.

### 9.1 Target boundary

`@stream-markdown/mermaid` should be responsible for:

- Choosing between `beautiful` and `vanilla`
- Parse / render behavior
- Loading Mermaid and beautiful-mermaid
- Accepting `getThemeColors`

The main package should be responsible for:

- Deciding when preview UI is shown
- Integrating preview with the code block UI
- Fullscreen / controls / download menus
- Context integration through `useContext`

### 9.2 How `getThemeColors` should be used

Recommended pattern in the main-package wrapper:

```ts
const runtime = createMermaidRuntime({
  ...mappedOptions,
  getThemeColors: async () => {
    if (!needsBeautifulThemeBridge)
      return null
    return await resolveThemeColorsFromShiki()
  },
})
```

Principles:

- Plain Mermaid mode does not rely on this method
- Beautiful Mermaid mode can use it when needed
- The method is optional
- The Mermaid runtime only knows it is receiving colors, not where they came from

## 10. Workspace and Build Configuration Changes

### 10.1 `pnpm-workspace.yaml`

Current form:

```yaml
packages:
  - packages/*
  - playground
  - docs
```

Recommended update:

```yaml
packages:
  - packages/*
  - packages/internal/*
  - playground
  - docs
```

### 10.2 Root `tsconfig.json`

Recommended path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@stream-markdown/shared": ["./packages/internal/shared/src/index.ts"],
      "@stream-markdown/code": ["./packages/internal/code/src/index.ts"],
      "@stream-markdown/mermaid": ["./packages/internal/mermaid/src/index.ts"],
      "@stream-markdown/math": ["./packages/internal/math/src/index.ts"]
    }
  }
}
```

### 10.3 Internal package `package.json`

Each internal package should:

- Set `private: true`
- Define its own `name`
- Explicitly declare the dependencies it imports in source
- Include minimal `build` and `typecheck` scripts

Important note:

- Because this is a `pnpm` workspace, imported dependencies must be declared in the corresponding internal package
- Even if the package is never published, it should not rely on root-level phantom dependencies

### 10.4 Main package build rules

The published `vue-stream-markdown` package must not retain runtime dependencies on these internal packages.

Requirements:

- The main package build must bundle `@stream-markdown/*`
- The main package `.d.ts` output must not mention `@stream-markdown/*`
- End users installing `vue-stream-markdown` must not need to install internal packages

These remain peer dependencies of the public package:

- `shiki`
- `mermaid`
- `beautiful-mermaid`
- `katex`
- `vue`

## 11. Phased Implementation Plan

### Phase 0: Scaffolding and boundary setup

Goal:

- Create directories
- Register workspace packages
- Add tsconfig aliases
- Lock in dependency rules

Tasks:

- Create `packages/internal/shared`
- Create `packages/internal/code`
- Create `packages/internal/mermaid`
- Create `packages/internal/math`
- Update `pnpm-workspace.yaml`
- Update root `tsconfig.json`
- Add `package.json` for each internal package
- Start with minimal `src/index.ts` exports only

Done when:

- Workspace recognizes all 4 internal packages
- Typecheck still works without behavior changes

### Phase 1: Extract `shared` first

Goal:

- Move the most stable and least controversial low-level helpers first

Tasks:

- Move `inference.ts`
- Move `module.ts`
- Move `composables/modules/_utils.ts`
- Move `harden.ts`
- Move `table.ts`
- Move pure browser helpers from `helper.ts`
- Keep local forwarding layers in the main package at first to reduce churn

Done when:

- Main-package behavior is unchanged
- `shared` has no `vue` dependency
- Existing harden / table / module logic still passes tests

### Phase 2: Extract `code`

Goal:

- Move Shiki runtime logic into its internal package

Tasks:

- Create `createShikiRuntime`
- Move the Shiki CDN loader
- Move shared highlighter state management
- Move language / theme normalization
- Convert main-package `useShiki` into a wrapper
- Split `constants/code.ts` into runtime constants and main-package UI constants

Done when:

- `use-shiki.test.ts` can move toward `@stream-markdown/code`
- Public API is unchanged
- Code highlighting behavior is unchanged

### Phase 3: Extract `math`

Goal:

- Move KaTeX runtime logic into its internal package

Tasks:

- Create `createKatexRuntime`
- Move KaTeX CDN loader
- Move CSS loading logic
- Move `renderToString`
- Convert main-package `useKatex` into a wrapper
- Keep `useMathRenderer` in the main package

Done when:

- `math.vue` / `inline-math.vue` do not need to know about the internal package
- KaTeX CSS auto-loading behavior is preserved

### Phase 4: Extract `mermaid`

Goal:

- Handle the highest-coupling runtime last

Tasks:

- Create `createMermaidRuntime`
- Move Mermaid / beautiful-mermaid loaders
- Move renderer type resolution
- Move parse / render / save logic
- Add `getThemeColors`
- Convert main-package `useMermaid` into a wrapper
- Keep code block and previewer UI logic in the main package

Done when:

- `resolveMermaidRendererType` tests still pass
- Both `beautiful` and `vanilla` paths retain their behavior
- Mermaid runtime has no direct dependency on code runtime

### Phase 5: Cleanup and convergence

Goal:

- Remove temporary layers
- Finalize the boundaries

Tasks:

- Remove no-longer-needed forwarding paths
- Audit `src/types/*`
- Audit `src/constants/*`
- Audit main-package build output
- Audit main-package `.d.ts`
- Add a short internal architecture note if needed

Done when:

- Public API remains compatible
- Build output does not reference internal package names
- Internal dependency directions match the intended rules

## 12. Test Migration Strategy

Split tests into two categories.

### 12.1 Internal package unit tests

These are good candidates to move into internal-package test ownership:

- `test/use-shiki.test.ts`
- `test/mermaid-renderers.test.ts`
- Future KaTeX runtime unit tests
- Shared tests for table / harden / module detection

### 12.2 Main package integration tests

These should remain in the main package or root integration test layer:

- Code block rendering behavior
- Mermaid previewer and code block integration
- Vue-layer behavior for math rendering
- Integration of context / controls / previewers

## 13. Risks and Guardrails

### 13.1 Biggest risk: leaking internal package names into the published package

If published output contains imports like:

- `import '@stream-markdown/code'`
- `import type { ... } from '@stream-markdown/mermaid'`

then npm users will break.

So one of the most important acceptance checks is:

- Runtime output must not leak internal package names
- `.d.ts` output must not leak internal package names

### 13.2 Do not move Vue types into internal packages

These should remain in the main package:

- `Component`
- UI component registries
- Renderer prop types
- `ControlTransformer`
- `UIComponents`
- `Icons`

### 13.3 Do not pollute `shared` with fake shared concepts

These do not belong in `shared`:

- `BuiltinNodeRenderers`
- `BuiltinPreviewers`
- `UIComponents`
- Node renderer registry-derived types

They may look shared, but they are actually main-package rendering concepts.

## 14. Desired End State

The intended structure after the split:

- `markmend` owns parsing and completion
- `@stream-markdown/shared` owns low-level runtime helpers
- `@stream-markdown/code` owns Shiki runtime logic
- `@stream-markdown/mermaid` owns Mermaid runtime logic
- `@stream-markdown/math` owns KaTeX runtime logic
- `vue-stream-markdown` owns the Vue rendering layer and public API

This structure should make it much easier to:

- Add a different code-highlighting backend
- Add another diagram or math implementation
- Experiment with alternative runtime implementations

without collapsing the main package boundaries again.

## 15. Recommended Execution Order

Safest practical order:

1. Create the internal package scaffolding
2. Extract `@stream-markdown/shared`
3. Extract `@stream-markdown/code`
4. Extract `@stream-markdown/math`
5. Extract `@stream-markdown/mermaid`
6. Audit build output and generated types

Why:

- `shared` is the most stable starting point
- `code` already has focused unit tests and strong payoff
- `math` has a simpler boundary than `mermaid`
- `mermaid` has the widest coupling surface and is safest last

## 16. Final Recommendation

The recommended plan for this refactor is:

- Do not split the renderer layer
- Split only the runtime / adapter layer
- Use the `packages/internal/*` directory structure
- Use `@stream-markdown/*` internal package names
- Decouple Mermaid from code through `getThemeColors`
- Keep `vue-stream-markdown` as the only public package, with unified wrappers and exports

This is the most maintainable and lowest-risk direction for the current codebase while still leaving room for future architectural growth.
