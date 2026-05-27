import type { ParsedNode, SyntaxTree } from '@markmend/ast'
import {
  applyMathRendererResult,
  applyMermaidRenderResult,
  createCodeBlockControlDescriptors,
  createCodeBlockModel,
  createCodeRendererModel,
  createErrorModel,
  createFloatingStyle,
  createHeadingModel,
  createHtmlPreviewModel,
  createImageModel,
  createImagePreviewModel,
  createLinkModel,
  createListItemModel,
  createListModel,
  createMathRendererModel,
  createMathRendererState,
  createMermaidPreviewControllerState,
  createNodeListModel,
  createParagraphModel,
  createRootStyle,
  createTableControlDescriptors,
  createTableModel,
  createTextModel,
  createYamlTableModel,
  createZoomContainerModel,
  flipImagePreviewHorizontal,
  getCodeFileExtension,
  getTableContent,
  handleCodeBlockControlAction,
  handleTableControlAction,
  resolveEnableAnimate,
  resolveEnableCaret,
  resolveFloatingDelay,
  resolveHtmlPreviewSandbox,
  resolvePreloadNodeRenderers,
  rotateImagePreviewRight,
  setMermaidMeasuredHeight,
  syncCodeBlockMode,
} from '@stream-markdown/core'
import { describe, expect, it } from 'vitest'

describe('core models', () => {
  it('resolves root state and style', () => {
    expect(resolveEnableAnimate('streaming')).toBe(true)
    expect(resolveEnableAnimate('static')).toBe(false)
    expect(resolveEnableAnimate('static', true)).toBe(true)
    expect(resolveEnableCaret('streaming', 'block')).toBe(true)
    expect(resolveEnableCaret('static', 'block')).toBe(false)
    expect(createRootStyle({ color: 'red' }, 300)).toEqual({
      'color': 'red',
      '--stream-markdown-animation-duration': '300ms',
    })
    expect(resolvePreloadNodeRenderers({ nodeRenderers: ['text'] })).toEqual(['text'])
  })

  it('creates node-list items with renderer, sibling, key, and transition decisions', () => {
    const paragraph = { type: 'paragraph' } as ParsedNode
    const text = { type: 'text', value: 'Hello' } as ParsedNode
    const next = { type: 'heading' } as ParsedNode
    const blocks = [
      { type: 'root', children: [] },
      { type: 'root', children: [paragraph, text] },
      { type: 'root', children: [next] },
    ] as SyntaxTree[]

    const model = createNodeListModel({
      nodes: [paragraph, text],
      blocks,
      blockIndex: 1,
      deep: 0,
      nodeKey: 'block-1',
      nodeRenderers: { paragraph: 'Paragraph', text: 'Text' },
      enableAnimate: true,
      animation: 'fade-in',
    })

    expect(model.transitionName).toBe('stream-markdown-fade-in')
    expect(model.items[0]).toMatchObject({
      key: 'block-1-paragraph-0',
      renderer: 'Paragraph',
      nextNode: text,
      shouldTransition: true,
    })
    expect(model.items[1]).toMatchObject({
      key: 'block-1-text-1',
      renderer: 'Text',
      prevNode: paragraph,
      nextNode: next,
      shouldTransition: false,
    })
  })

  it('creates text model for word animation and caret rendering', () => {
    const model = createTextModel({
      node: { type: 'text', value: 'Hello  world', loading: true },
      nodeKey: 'text-0',
      enableAnimate: true,
      animation: 'slide-up',
      animationSplit: 'word',
    })

    expect(model.showCaret).toBe(true)
    expect(model.shouldAnimate).toBe(true)
    expect(model.transitionName).toBe('stream-markdown-slide-up')
    expect(model.parts.map(part => part.value)).toEqual(['Hello', '  ', 'world'])
  })

  it('creates text model for character animation', () => {
    const model = createTextModel({
      node: { type: 'text', value: '你好 world' },
      nodeKey: 'text-0',
      enableAnimate: true,
      animation: 'fade-in',
      animationSplit: 'char',
    })

    expect(model.parts.map(part => part.value)).toEqual(['你', '好', ' ', 'w', 'o', 'r', 'l', 'd'])
  })

  it('creates text model with automatic character animation for CJK text', () => {
    const model = createTextModel({
      node: { type: 'text', value: '你好 world' },
      nodeKey: 'text-0',
      enableAnimate: true,
      animation: 'fade-in',
    })

    expect(model.parts.map(part => part.value)).toEqual(['你', '好', ' ', 'world'])
    expect(model.parts.map(part => part.animationSplit)).toEqual(['char', 'char', 'word', 'word'])
  })

  it('creates table model and serializes table data', () => {
    const text = { type: 'text', value: 'Name' } as ParsedNode
    const cell = { type: 'tableCell', children: [text] } as ParsedNode
    const row = { type: 'tableRow', children: [cell] } as never

    const model = createTableModel({
      node: {
        type: 'table',
        align: ['center'],
        children: [row],
      },
      hasLoadingNode: () => true,
    })

    expect(model.loading).toBe(true)
    expect(model.getAlign(0)).toBe('center')
    expect(model.getNodes(cell)).toEqual([text])
    expect(getTableContent('csv', { headers: ['A'], rows: [['B']] })).toMatchObject({
      content: 'A\nB',
      extension: 'csv',
    })
  })

  it('creates code block model for preview and download decisions', () => {
    const model = createCodeBlockModel({
      node: { type: 'code', lang: 'mermaid', value: 'graph TD' },
      codeOptions: { maxHeight: 240 },
      previewers: true,
      controls: true,
      hasMermaid: true,
      mode: 'source',
    })

    expect(model.language).toBe('mermaid')
    expect(model.previewable).toBe(true)
    expect(model.previewPlacement).toBe('center')
    expect(model.maxHeight).toBe('240px')
    expect(model.downloadOptions.map(option => option.value)).toEqual(['svg', 'png', 'code'])
    expect(getCodeFileExtension('typescript')).toBe('ts')
    expect(syncCodeBlockMode({ mode: 'source' }, true)).toEqual({ mode: 'preview' })
    expect(createCodeRendererModel({ type: 'code', lang: 'ts', value: ' const a = 1\n' })).toMatchObject({
      code: 'const a = 1',
      lang: 'ts',
      languageClass: 'language-ts',
      lines: ['const a = 1'],
    })
    expect(createCodeBlockControlDescriptors({
      collapsed: true,
      fullscreen: false,
      copied: true,
      language: 'typescript',
      showCollapse: true,
      showCopy: true,
      showDownload: true,
      showFullscreen: true,
    }).map(control => control.key)).toEqual(['collapse', 'copy', 'download', 'fullscreen'])
  })

  it('creates image model for fallback, caption, and error state', () => {
    const model = createImageModel({
      node: { type: 'image', url: 'broken.png', alt: 'Alt', title: 'Title' },
      imageOptions: { fallback: 'fallback.png' },
      fallbackAttempted: true,
      imageLoaded: false,
      isHardenUrl: true,
    })

    expect(model.imageSrc).toBe('fallback.png')
    expect(model.alt).toBe('Alt')
    expect(model.title).toBe('Title')
    expect(model.showCaption).toBe(true)
    expect(model.showError).toBe(true)
    expect(model.errorVariant).toBe('harden-image')
  })

  it('creates image preview state, controls, and filtered sources', () => {
    const nodes = [
      { type: 'image', url: 'a.png' },
      { type: 'paragraph', children: [{ type: 'image', url: 'b.png' }] },
      { type: 'image', url: 'a.png' },
      { type: 'image', url: 'blocked.png' },
    ] as ParsedNode[]

    const state = rotateImagePreviewRight(flipImagePreviewHorizontal({
      scaleX: 1,
      scaleY: 1,
      rotate: 0,
    }))
    const model = createImagePreviewModel({
      parsedNodes: nodes,
      src: 'a.png',
      controls: true,
      transformHardenUrl: url => url === 'blocked.png' ? null : url,
      hasDownload: true,
      preview: true,
      loaded: true,
      hasElement: true,
      state,
      icons: { arrowRight: false },
    })

    expect(model.sources).toEqual(['a.png', 'b.png'])
    expect(model.canOpen).toBe(true)
    expect(model.imageStyle.transform).toBe('scaleX(-1) scaleY(1) rotate(90deg)')
    expect(model.controls.find(control => control.key === 'next')).toMatchObject({
      icon: 'arrowLeft',
      buttonStyle: { transform: 'scaleX(-1)' },
    })
  })

  it('creates basic renderer models', () => {
    const text = { type: 'text', value: 'Hello' } as ParsedNode

    expect(createParagraphModel({
      node: { type: 'paragraph', children: [text] } as never,
      nextNode: { type: 'list' } as ParsedNode,
      deep: 0,
    })).toEqual({ marginBottom: '0.5rem', lineHeight: 1.75 })
    const headingModel = createHeadingModel({ type: 'heading', depth: 2, children: [] } as never)
    expect(headingModel).toMatchObject({
      tag: 'h2',
      id: 'heading-2',
    })
    expect(headingModel).not.toHaveProperty('class')

    const listModel = createListModel({
      type: 'list',
      ordered: true,
      children: [{ type: 'listItem', checked: true, children: [] }],
    } as never)
    expect(listModel).toMatchObject({
      isTaskList: true,
      tag: 'ol',
      id: 'task-list',
    })
    expect(listModel).not.toHaveProperty('class')

    expect(createListItemModel({ type: 'listItem', checked: false, children: [] } as never)).toEqual({
      isTaskListItem: true,
      checked: false,
    })
    expect(createYamlTableModel({ type: 'yaml', value: 'a: 1\nb: 2' } as never)).toMatchObject({
      headers: ['a', 'b'],
      rows: [{ children: ['1', '2'] }],
    })
  })

  it('creates link, math, table controls, error, and zoom models', () => {
    expect(createLinkModel({
      node: { type: 'link', url: 'https://example.com', children: [] },
      transformedUrl: 'https://example.com',
      linkOptions: {},
    })).toMatchObject({
      loading: false,
      safetyCheck: true,
      showLink: true,
    })
    expect(createMathRendererModel({
      node: { type: 'inlineMath', value: 'x', loading: false },
      installed: false,
    })).toMatchObject({
      code: 'x',
      isDisplayMode: false,
      error: true,
    })
    expect(createMathRendererModel({
      node: { type: 'math', value: '\\frac{1}{', loading: true },
      installed: true,
      renderFlag: true,
      renderingCode: '\\frac{1}{',
      errorMessage: 'Unexpected end of input',
    })).toMatchObject({
      code: '\\frac{1}{',
      loading: true,
      error: false,
    })
    expect(createMathRendererModel({
      node: { type: 'math', value: '\\frac{1}{', loading: false },
      installed: true,
      renderFlag: true,
      renderingCode: '\\frac{1}{',
      errorMessage: 'Unexpected end of input',
    })).toMatchObject({
      code: '\\frac{1}{',
      loading: false,
      error: true,
    })
    expect(createTableControlDescriptors({
      copied: true,
      fullscreen: true,
      showCopy: true,
      showDownload: true,
      showFullscreen: true,
    }).map(control => control.icon)).toEqual(['check', 'download', 'minimize'])
    expect(createErrorModel({
      variant: 'harden-link',
      hasIcon: name => name === 'link',
    })).toMatchObject({
      icon: 'link',
      messageKey: 'error.harden',
      isHarden: true,
    })
    expect(createZoomContainerModel({
      zoom: 1.5,
      position: 'bottom-center',
      controlSize: 'large',
    })).toMatchObject({
      zoomPercent: '150%',
      controlsPosition: {
        bottom: '0.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
      },
    })
    expect(createHtmlPreviewModel({ type: 'code', value: ' <div /> ' } as never)).toEqual({
      code: '<div />',
    })
    expect(resolveHtmlPreviewSandbox(undefined)).toBe('allow-scripts')
    expect(resolveHtmlPreviewSandbox(true)).toBe('allow-scripts')
    expect(resolveHtmlPreviewSandbox({
      html: {
        sandbox: 'allow-scripts allow-same-origin allow-forms',
      },
    })).toBe('allow-scripts allow-same-origin allow-forms')
    expect(resolveFloatingDelay([10, 20])).toEqual({ show: 10, hide: 20 })
    expect(createFloatingStyle({ x: 1, y: 2, strategy: 'fixed' })).toEqual({
      position: 'fixed',
      top: '2px',
      left: '1px',
    })
  })

  it('updates headless controller state for framework adapters', async () => {
    expect(applyMathRendererResult(
      createMathRendererState(),
      'x',
      { html: '<span>x</span>' },
    )).toMatchObject({
      html: '<span>x</span>',
      errorMessage: '',
      renderFlag: true,
      renderingCode: '',
    })
    expect(applyMathRendererResult(
      createMathRendererState(),
      '\\frac{1}{',
      { error: 'Unexpected end of input' },
    )).toMatchObject({
      errorMessage: 'Unexpected end of input',
      renderFlag: true,
      renderingCode: '\\frac{1}{',
    })

    const mermaidState = setMermaidMeasuredHeight(
      applyMermaidRenderResult(
        createMermaidPreviewControllerState({ renderAttempt: true }),
        { valid: true, svg: '<svg />' },
      ),
      120,
    )
    expect(mermaidState).toMatchObject({
      svg: '<svg />',
      error: undefined,
      measuredHeight: 120,
      renderAttempt: true,
      renderFlag: true,
    })

    const codeDownloads: string[] = []
    const codeState = await handleCodeBlockControlAction({
      key: 'download',
      state: { collapsed: false, fullscreen: false },
      node: { type: 'code', lang: 'ts', value: 'const a = 1' },
      language: 'typescript',
      saveFile: (filename) => {
        codeDownloads.push(filename)
      },
    })
    expect(codeState).toEqual({ collapsed: false, fullscreen: false })
    expect(codeDownloads).toEqual(['file.ts'])

    const copied: string[] = []
    const tableState = await handleTableControlAction({
      key: 'copy',
      state: { fullscreen: false },
      getContent: () => ({ content: 'A\nB', extension: 'csv', mimeType: 'text/csv' }),
      copyContent: (content) => {
        copied.push(content)
      },
    })
    expect(tableState).toEqual({ fullscreen: false })
    expect(copied).toEqual(['A\nB'])
  })
})
