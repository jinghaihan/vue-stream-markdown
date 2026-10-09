<script lang="ts">
import type { CodeHighlightResult, CodeToken } from '@stream-markdown/core'
import type { PropType } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { computed, defineComponent, h, nextTick, onMounted, ref, renderList, watch } from 'vue'
import { useVirtualCodeLines } from './use-virtual-lines'

export default defineComponent({
  name: 'CodeContent',
  props: {
    code: {
      type: String,
      required: true,
    },
    lang: {
      type: String,
      required: true,
    },
    languageClass: {
      type: String,
      required: true,
    },
    tokens: {
      type: Object as PropType<CodeHighlightResult>,
      required: false,
    },
    showLineNumbers: {
      type: Boolean,
      default: true,
    },
    startLine: {
      type: Number,
      default: 1,
    },
    virtualScroll: Boolean,
  },
  setup(props) {
    const lines = computed<CodeToken[][]>(() => props.tokens?.tokens ?? props.code
      .split('\n')
      .map(content => [{ content, htmlStyle: {} }]))
    const pre = ref<HTMLElement>()
    const widthMeasure = ref<HTMLElement>()
    const width = ref(0)
    const { enabled, firstIndex, rowHeight, visibleLines, wrapperStyle } = useVirtualCodeLines(lines, pre, () => props.virtualScroll)
    const widestLine = computed(() => {
      if (!enabled.value)
        return ''
      let widest = ''
      let maxColumns = 0
      for (const line of props.code.split('\n')) {
        let columns = 0
        for (const char of line) {
          columns += char === '\t'
            ? 8 - columns % 8
            : /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(char) ? 2 : 1
        }
        if (columns > maxColumns) {
          widest = line
          maxColumns = columns
        }
      }
      return widest
    })
    async function measureWidth() {
      await nextTick()
      const element = widthMeasure.value
      if (element)
        width.value = element.getBoundingClientRect().width
    }
    watch([widestLine, enabled], measureWidth, { flush: 'post' })
    useResizeObserver(widthMeasure, measureWidth)
    onMounted(measureWidth)

    function renderLines() {
      return renderList(visibleLines.value, ({ data: line, index }) => h(
        'div',
        {
          'data-stream-markdown': 'code-line',
          'data-line-number': props.startLine + index,
          'class': props.showLineNumbers
            ? 'relative block min-h-4 text-sm before:inline-block before:mr-4 before:w-4 before:select-none before:text-right before:font-mono before:text-[13px] before:text-muted-foreground/50 before:content-[counter(line)] before:[counter-increment:line]'
            : 'relative block min-h-4 text-sm',
          'style': enabled.value ? { height: `${rowHeight.value}px` } : undefined,
          'key': index,
        },
        renderList(line, (token, tokenIndex) => h(
          'span',
          { key: tokenIndex, style: token.htmlStyle },
          token.content,
        )),
      ))
    }

    return () => h(
      'div',
      {
        'class': props.languageClass,
        'data-stream-markdown': props.tokens ? 'shiki' : undefined,
        'dir': 'ltr',
      },
      h(
        'pre',
        {
          'ref': pre,
          'data-stream-markdown': 'code',
          'data-virtual': enabled.value || undefined,
          'data-show-line-numbers': props.showLineNumbers,
          'data-start-line': props.startLine,
          'data-language': props.tokens?.grammarState?.lang ?? props.lang,
          'data-bg': props.tokens?.bg,
          'data-fg': props.tokens?.fg,
          'class': [
            props.tokens ? ['shiki', props.tokens.themeName] : undefined,
            props.languageClass,
            'p-4 font-mono text-sm',
          ],
          'style': {
            counterReset: `line ${props.startLine + (enabled.value ? firstIndex.value : 0) - 1}`,
            color: props.tokens?.fg ?? 'inherit',
            minWidth: enabled.value && width.value ? `calc(${width.value}px + ${props.showLineNumbers ? '4rem' : '2rem'})` : undefined,
          },
        },
        h(
          'code',
          {
            translate: 'no',
            class: 'text-sm font-mono',
            style: enabled.value ? { display: 'block', position: 'relative' } : undefined,
          },
          enabled.value
            ? [
                h('span', {
                  'ref': widthMeasure,
                  'aria-hidden': 'true',
                  'style': { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre', userSelect: 'none', pointerEvents: 'none' },
                }, widestLine.value),
                h('div', { style: wrapperStyle.value }, renderLines()),
              ]
            : renderLines(),
        ),
      ),
    )
  },
})
</script>
