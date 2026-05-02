<script lang="ts">
import type { PropType } from 'vue'
import type { CodeNodeRendererProps } from '../../../types'
import { createCodeRendererModel } from '@stream-markdown/core'
import { computed, defineComponent, h, renderList } from 'vue'
import { useCodeOptions, useContext } from '../../../composables'

export default defineComponent({
  name: 'VanillaRenderer',
  props: {
    node: {
      type: Object as PropType<CodeNodeRendererProps['node']>,
      required: true,
    },
  },
  setup(props) {
    const { codeOptions } = useContext()

    const model = computed(() => createCodeRendererModel(props.node))
    const lang = computed(() => model.value.lang)

    const { showLineNumbers } = useCodeOptions({
      codeOptions,
      language: lang,
    })

    const lines = computed(() => model.value.lines)

    return () =>
      h(
        'pre',
        {
          'data-stream-markdown': 'code',
          'data-show-line-numbers': showLineNumbers.value,
          'data-lang': lang.value,
          'class': 'text-sm font-mono p-4 [counter-reset:line]',
        },
        h(
          'code',
          {
            translate: 'no',
            class: 'text-sm font-mono',
          },
          renderList(
            lines.value,
            (line, index) =>
              h(
                'div',
                {
                  'data-stream-markdown': 'code-line',
                  'class': showLineNumbers.value
                    ? 'relative block min-h-4 text-sm before:inline-block before:mr-4 before:w-4 before:select-none before:text-right before:font-mono before:text-[13px] before:text-muted-foreground/50 before:content-[counter(line)] before:[counter-increment:line]'
                    : 'relative block min-h-4 text-sm',
                  'key': index,
                },
                line,
              ),
          ),
        ),
      )
  },
})
</script>
