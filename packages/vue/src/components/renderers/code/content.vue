<script lang="ts">
import type { getTokenStyleObject, TokensResult } from 'shiki'
import type { PropType } from 'vue'
import { computed, defineComponent, h, renderList, shallowRef, watch } from 'vue'

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
      type: Object as PropType<TokensResult>,
      required: false,
    },
    getShiki: {
      type: Function as PropType<() => Promise<typeof import('shiki')>>,
      required: true,
    },
    showLineNumbers: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const getTokenStyleObjectRef = shallowRef<typeof getTokenStyleObject | null>(null)
    let loadingTokenStyleObject = false
    watch(
      () => props.tokens,
      (tokens) => {
        const needsTokenStyleObject = tokens?.tokens.some(
          line => line.some(token => !token.htmlStyle),
        )
        if (!needsTokenStyleObject || loadingTokenStyleObject || getTokenStyleObjectRef.value)
          return

        loadingTokenStyleObject = true
        void (async () => {
          try {
            const { getTokenStyleObject } = await props.getShiki()
            getTokenStyleObjectRef.value = getTokenStyleObject
          }
          finally {
            loadingTokenStyleObject = false
          }
        })()
      },
      { immediate: true },
    )

    const lines = computed(() => props.tokens?.tokens ?? props.code.split('\n'))

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
          'data-language': props.tokens?.grammarState?.lang ?? props.lang,
          'data-bg': props.tokens?.bg,
          'data-fg': props.tokens?.fg,
          'class': [
            props.tokens ? ['shiki', props.tokens.themeName] : undefined,
            props.languageClass,
            'p-4 font-mono text-sm',
          ],
          'style': `counter-reset: line; color: ${props.tokens?.fg ?? 'inherit'};`,
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
              typeof line === 'string'
                ? line
                : renderList(line, (token, tokenIndex) => h(
                    'span',
                    {
                      key: tokenIndex,
                      style: token.htmlStyle || (getTokenStyleObjectRef.value?.(token) ?? {}),
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
