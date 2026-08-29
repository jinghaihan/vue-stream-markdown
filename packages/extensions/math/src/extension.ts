import type { MathExtension } from '@stream-markdown/core'
import type { ComarkPlugin } from 'comark'
import type { KatexOptions } from 'katex'
import type { MathRuntimeOptions } from './types'
import mathPlugin from 'comark/plugins/math'
import { createKatexRuntime } from './runtime'

export interface MathExtensionOptions<TErrorComponent = never> extends MathRuntimeOptions {
  config?: KatexOptions
  errorComponent?: TErrorComponent
}

export function math<TErrorComponent = never>(
  options: MathExtensionOptions<TErrorComponent> = {},
): MathExtension<ComarkPlugin<any, any>, TErrorComponent> {
  const runtime = createKatexRuntime({
    cdnOptions: options.cdnOptions,
  })
  const { throwOnError, ...katexOptions } = options.config ?? {}

  return {
    parserPlugin: mathPlugin({
      throwOnError,
      options: katexOptions,
    }),
    errorComponent: options.errorComponent,
    preload: runtime.preload,
    dispose: runtime.dispose,
    ensureCss: runtime.ensureCss,
    render: ({ code, displayMode }) => runtime.renderToHtml(code, {
      config: options.config,
      displayMode,
    }),
  }
}
