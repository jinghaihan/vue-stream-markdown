import type { TokensResult } from 'shiki'
import type { PropType } from 'vue'
import { getTokenStyleObject } from 'shiki'
import { defineComponent, h, renderList } from 'vue'

export default defineComponent({
  name: 'ShikiTokensRenderer',
  props: {
    tokens: {
      type: Object as PropType<TokensResult>,
      required: true,
    },
    showLineNumbers: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    return () => h(
      'pre',
      {
        'class': [
          'shiki',
          props.tokens.themeName,
        ],
        'data-language': props.tokens.grammarState?.lang,
        'style': {
          padding: '1rem',
          counterReset: 'line',
        },
      },
      h(
        'code',
        renderList(
          props.tokens.tokens,
          (line, index) => h(
            'div',
            {
              class: 'line',
              key: index,
              style: {
                fontSize: '0.875rem',
                minHeight: '1rem',
              },
            },
            renderList(line, (token, tokenIndex) => h(
              'span',
              {
                key: tokenIndex,
                style: token.htmlStyle || getTokenStyleObject(token),
              },
              token.content,
            )),
          ),
        ),
      ),
    )
  },
})
