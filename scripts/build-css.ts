import { Buffer } from 'node:buffer'
import * as fs from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { argv, exit } from 'node:process'
import { fileURLToPath } from 'node:url'
import { styleText } from 'node:util'
import { transform } from 'lightningcss'
import { glob } from 'tinyglobby'
import { createGenerator, presetWind4 } from 'unocss'
import unoConfig from '../unocss.config.ts'

const CSS_NAME = 'index.css'
const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url))
const SRC_DIR = join(ROOT_DIR, 'src')
const STYLE_FILE = join(SRC_DIR, 'style.css')
const OUTPUT_FILE = join(ROOT_DIR, 'dist', CSS_NAME)
const SOURCE_GLOBS = ['**/*.vue']
const NAMESPACE = ':where(.stream-markdown,.stream-markdown-overlay)'
const VARIABLE_PREFIX = 'stream-markdown-'
const UNO_VARIABLE_PREFIX = 'un-'
const IGNORE_PRESETS = ['@unocss/preset-wind4', '@unocss/preset-web-fonts']

async function buildCSS() {
  const generator = await createGenerator(createScopedUnoConfig())
  const userStyle = await fs.readFile(STYLE_FILE, 'utf8').catch(() => '')

  const files = await glob(SOURCE_GLOBS, {
    cwd: SRC_DIR,
    absolute: true,
  })

  const tokens = new Set<string>()
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')
    await generator.applyExtractors(content, file, tokens)
  }

  const generated = await generator.generate(tokens, { preflights: true })
  const generatedCss = scopeThemeVariable(normalizeVariablePrefix(generated.css))
  const css = [userStyle.trim(), generatedCss]
    .filter(Boolean)
    .join('\n\n')
    .trimEnd()

  const outputCss = minifyCSS(css)
  await fs.mkdir(dirname(OUTPUT_FILE), { recursive: true })
  await fs.writeFile(OUTPUT_FILE, `${outputCss}\n`, 'utf8')

  return {
    fileCount: files.length,
    tokenCount: tokens.size,
  }
}

function minifyCSS(css: string): string {
  const { code } = transform({
    code: Buffer.from(css, 'utf8'),
    filename: CSS_NAME,
    minify: false,
    targets: {
      chrome: 89,
    },
  })
  return Buffer.from(code).toString('utf8')
}

function normalizeVariablePrefix(css: string): string {
  const from = `--${UNO_VARIABLE_PREFIX}`
  const to = `--${VARIABLE_PREFIX}`
  return css.replaceAll(from, to)
}

function scopeThemeVariable(css: string): string {
  let output = css
  const blocks: string[] = []

  output = output.replace(/:root\s*,\s*:host\s*\{([\s\S]*?)\}/g, (_, block) => {
    blocks.push(String(block).trim())
    return ''
  })

  output = output.replace(/:root\s*\{([\s\S]*?)\}/g, (_, block) => {
    blocks.push(String(block).trim())
    return ''
  })

  output = output.replace(/:host\s*\{([\s\S]*?)\}/g, (_, block) => {
    blocks.push(String(block).trim())
    return ''
  })

  const unique = [...new Set(blocks.filter(Boolean))]
  if (!unique.length)
    return output

  const scoped = unique
    .map(block => `${NAMESPACE} {\n${block}\n}`)
    .join('\n\n')

  return `${scoped}\n\n${output}`.trim()
}

function createScopedUnoConfig() {
  // @ts-expect-error filter unocss preset by name
  const presets = (unoConfig.presets || []).filter(preset => !IGNORE_PRESETS.includes(preset.name))

  return {
    ...unoConfig,
    presets: [
      presetWind4({
        important: NAMESPACE,
        variablePrefix: VARIABLE_PREFIX,
        preflights: {
          reset: false,
          theme: 'on-demand',
        },
      }),
      ...presets,
    ],
  }
}

async function run() {
  const result = await buildCSS()
  const tokenCount = styleText('yellow', String(result.tokenCount))
  const fileCount = styleText('yellow', String(result.fileCount))
  console.log(
    `[build-css] generated ${tokenCount} tokens from ${fileCount} files -> ${OUTPUT_FILE}`,
  )
}

if (argv[1] && fileURLToPath(import.meta.url) === argv[1]) {
  run().catch((error) => {
    console.error('[build-css] failed', String(error))
    exit(1)
  })
}
