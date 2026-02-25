import type { getTokenStyleObject, TokensResult } from 'shiki'
import type { PropType } from 'vue'
import { defineComponent, h, renderList, shallowRef } from 'vue'

export default defineComponent({
  name: 'ShikiTokensRenderer',
  props: {
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
    if (!props.tokens)
      return null

    const getTokenStyleObjectRef = shallowRef<typeof getTokenStyleObject | null>(null);
    (async () => {
      const { getTokenStyleObject } = await props.getShiki()
      getTokenStyleObjectRef.value = getTokenStyleObject
    })()

    return () => {
      if (!props.tokens?.tokens)
        return null

      return h(
        'pre',
        {
          'class': [
            'shiki',
            props.tokens.themeName,
            'p-4 font-mono text-sm',
          ],
          'data-language': props.tokens.grammarState?.lang,
          'data-bg': props.tokens.bg,
          'data-fg': props.tokens.fg,
          // background color most time looks not good, so we don't set it
          'style': `counter-reset: line; color: ${props.tokens.fg};`,
        },
        h(
          'code',
          renderList(
            props.tokens.tokens,
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
                  style: token.htmlStyle || (getTokenStyleObjectRef.value?.(token) ?? {}),
                },
                token.content,
              )),
            ),
          ),
        ),
      )
    }
  },
})
