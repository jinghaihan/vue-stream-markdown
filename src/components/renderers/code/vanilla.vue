<script lang="ts">
import type { PropType } from 'vue'
import type { CodeNodeRendererProps, CodeOptions } from '../../../types'
import { computed, defineComponent, h, renderList, toRefs } from 'vue'
import { useCodeOptions } from '../../../composables'

export default defineComponent({
  name: 'VanillaRenderer',
  props: {
    node: {
      type: Object as PropType<CodeNodeRendererProps['node']>,
      required: true,
    },
    codeOptions: {
      type: Object as PropType<CodeOptions>,
      default: undefined,
    },
  },
  setup(props) {
    const { codeOptions } = toRefs(props)

    const code = computed(() => props.node.value.trim())
    const lang = computed(() => props.node.lang || '')

    const { showLineNumbers } = useCodeOptions({
      codeOptions,
      language: lang,
    })

    const lines = computed(() => code.value.split('\n'))

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
