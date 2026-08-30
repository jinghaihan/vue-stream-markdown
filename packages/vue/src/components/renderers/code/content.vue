<script lang="ts">
import type { CodeHighlightResult, CodeToken } from '@stream-markdown/core'
import type { PropType } from 'vue'
import { computed, defineComponent, h, renderList } from 'vue'

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
  },
  setup(props) {
    const lines = computed<CodeToken[][]>(() => props.tokens?.tokens ?? props.code
      .split('\n')
      .map(content => [{ content, htmlStyle: {} }]))

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
          'data-stream-markdown': 'code',
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
          'style': `counter-reset: line ${props.startLine - 1}; color: ${props.tokens?.fg ?? 'inherit'};`,
        },
        h(
          'code',
          {
            translate: 'no',
            class: 'text-sm font-mono',
          },
          renderList(
            lines.value,
            (line, index) => h(
              'div',
              {
                'data-stream-markdown': 'code-line',
                'class': props.showLineNumbers
                  ? 'relative block min-h-4 text-sm before:inline-block before:mr-4 before:w-4 before:select-none before:text-right before:font-mono before:text-[13px] before:text-muted-foreground/50 before:content-[counter(line)] before:[counter-increment:line]'
                  : 'relative block min-h-4 text-sm',
                'key': index,
              },
              renderList(line, (token, tokenIndex) => h(
                'span',
                {
                  key: tokenIndex,
                  style: token.htmlStyle,
                },
                token.content,
              )),
            ),
          ),
        ),
      ),
    )
  },
})
</script>
