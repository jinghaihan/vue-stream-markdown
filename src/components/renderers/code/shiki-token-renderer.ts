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
  },
  setup(props) {
    if (!props.tokens)
      return null

    const getTokenStyleObjectRef = shallowRef<typeof getTokenStyleObject | null>(null)
    ;(async () => {
      const { getTokenStyleObject } = await import('shiki')
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
