import {
  applyMathRendererResult,
  applyMermaidRenderResult,
  clampHtmlPreviewHeight,
  createCodeBlockControlDescriptors,
  createCodeBlockModel,
  createCodeRendererModel,
  createErrorModel,
  createFloatingStyle,
  createHtmlPreviewModel,
  createHtmlPreviewSrcdoc,
  createImageModel,
  createImagePreviewModel,
  createMathRendererModel,
  createMathRendererState,
  createMermaidPreviewControllerState,
  createRootStyle,
  createTableControlDescriptors,
  createZoomContainerModel,
  flipImagePreviewHorizontal,
  getCodeFileExtension,
  getHtmlPreviewMessageHeight,
  getTableContent,
  handleCodeBlockControlAction,
  handleTableControlAction,
  resolveEnableAnimate,
  resolveEnableCaret,
  resolveFloatingDelay,
  resolveHtmlPreviewAutoHeight,
  resolveHtmlPreviewHeight,
  resolveHtmlPreviewMaxHeight,
  resolveHtmlPreviewMaxHeightValue,
  resolveHtmlPreviewMeasurementMode,
  resolveHtmlPreviewSandbox,
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
  })

  it('creates code block models and control descriptors', () => {
    const model = createCodeBlockModel({
      node: { lang: 'mermaid', value: 'graph TD' },
      codeOptions: { maxHeight: 240 },
      previewers: true,
      controls: true,
      hasMermaid: true,
      mode: 'source',
    })

    expect(model).toMatchObject({
      language: 'mermaid',
      previewable: true,
      previewPlacement: 'center',
      maxHeight: '240px',
    })
    expect(model.downloadOptions.map(option => option.value)).toEqual(['svg', 'png', 'code'])
    expect(getCodeFileExtension('typescript')).toBe('ts')
    expect(syncCodeBlockMode({ mode: 'source' }, true)).toEqual({ mode: 'preview' })
    expect(createCodeRendererModel({ lang: 'ts', value: ' const a = 1\n' })).toMatchObject({
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

  it('creates image models from renderer data and source lists', () => {
    const image = createImageModel({
      node: { url: 'broken.png', alt: 'Alt', title: 'Title' },
      imageOptions: { fallback: 'fallback.png' },
      fallbackAttempted: true,
      imageLoaded: false,
      isHardenUrl: true,
    })
    expect(image).toMatchObject({
      imageSrc: 'fallback.png',
      alt: 'Alt',
      title: 'Title',
      showCaption: true,
      showError: true,
      errorVariant: 'harden-image',
    })

    const state = rotateImagePreviewRight(flipImagePreviewHorizontal({
      scaleX: 1,
      scaleY: 1,
      rotate: 0,
    }))
    const preview = createImagePreviewModel({
      sources: ['a.png', 'b.png', 'a.png', 'blocked.png'],
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
    expect(preview.sources).toEqual(['a.png', 'b.png'])
    expect(preview.canOpen).toBe(true)
    expect(preview.imageStyle.transform).toBe('scaleX(-1) scaleY(1) rotate(90deg)')
  })

  it('creates math, table, HTML, error, and zoom models', () => {
    expect(createMathRendererModel({
      node: { value: 'x', display: false, loading: false },
      installed: false,
    })).toMatchObject({ code: 'x', isDisplayMode: false, error: true })
    expect(createMathRendererModel({
      node: { value: '\\frac{1}{', display: true, loading: true },
      installed: true,
      renderFlag: true,
      renderingCode: '\\frac{1}{',
      errorMessage: 'Unexpected end of input',
    })).toMatchObject({ loading: true, error: false })
    expect(getTableContent('csv', { headers: ['A', 'B'], rows: [['1', '2']] }, ';')).toMatchObject({
      content: 'A;B\n1;2',
      extension: 'csv',
    })
    expect(createTableControlDescriptors({
      copied: true,
      fullscreen: true,
      showCopy: true,
      showDownload: true,
      showFullscreen: true,
    }).map(control => control.icon)).toEqual(['check', 'download', 'minimize'])
    expect(createErrorModel({ variant: 'harden-link', hasIcon: name => name === 'link' })).toMatchObject({
      icon: 'link',
      messageKey: 'error.harden',
      isHarden: true,
    })
    expect(createZoomContainerModel({
      zoom: 1.5,
      position: 'bottom-center',
      controlSize: 'large',
    }).zoomPercent).toBe('150%')

    expect(createHtmlPreviewModel({ value: ' <div /> ' })).toEqual({ code: '<div />' })
    expect(resolveHtmlPreviewSandbox(undefined)).toBe('allow-scripts')
    expect(resolveHtmlPreviewAutoHeight({ html: { autoHeight: false } })).toBe(false)
    expect(resolveHtmlPreviewHeight({ html: { height: 480 } })).toBe('480px')
    expect(resolveHtmlPreviewMaxHeight({ html: { maxHeight: '80vh' } })).toBe('80vh')
    expect(resolveHtmlPreviewMaxHeightValue({ html: { maxHeight: '800px' } })).toBe(800)
    expect(resolveHtmlPreviewMeasurementMode('allow-scripts allow-same-origin', true)).toBe('dom')
    expect(resolveHtmlPreviewMeasurementMode('allow-scripts', true)).toBe('message')
    expect(createHtmlPreviewSrcdoc('<body><div>Hello</div></body>')).toContain('<script>')
    expect(getHtmlPreviewMessageHeight({
      type: 'stream-markdown:html-preview-height',
      height: 120.2,
    })).toBe(137)
    expect(clampHtmlPreviewHeight(8000)).toBe(1000)
    expect(resolveFloatingDelay([10, 20])).toEqual({ show: 10, hide: 20 })
    expect(createFloatingStyle({ x: 1, y: 2, strategy: 'fixed' })).toEqual({
      position: 'fixed',
      top: '2px',
      left: '1px',
    })
  })

  it('updates headless controller state', async () => {
    expect(applyMathRendererResult(
      createMathRendererState(),
      'x',
      { html: '<span>x</span>' },
    )).toMatchObject({ html: '<span>x</span>', renderFlag: true })

    const mermaidState = setMermaidMeasuredHeight(
      applyMermaidRenderResult(
        createMermaidPreviewControllerState({ renderAttempt: true }),
        { valid: true, svg: '<svg />' },
      ),
      120,
    )
    expect(mermaidState).toMatchObject({ svg: '<svg />', measuredHeight: 120, renderFlag: true })

    const codeDownloads: string[] = []
    await handleCodeBlockControlAction({
      key: 'download',
      filename: 'myScript',
      state: { collapsed: false, fullscreen: false },
      node: { lang: 'ts', value: 'const a = 1' },
      language: 'typescript',
      saveFile: (filename) => {
        codeDownloads.push(filename)
      },
    })
    expect(codeDownloads).toEqual(['myScript.ts'])

    const copied: string[] = []
    await handleTableControlAction({
      key: 'copy',
      state: { fullscreen: false },
      getContent: () => ({ content: 'A\nB', extension: 'csv', mimeType: 'text/csv' }),
      copyContent: (content) => {
        copied.push(content)
      },
    })
    expect(copied).toEqual(['A\nB'])
  })
})
