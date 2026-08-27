// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import LanguageTitle from '../../packages/vue/src/components/code-block/language-title.vue'
import Icon from '../../packages/vue/src/components/icon.vue'
import { useContext } from '../../packages/vue/src/composables'

const TestIcon = defineComponent({
  setup(_, { attrs }) {
    return () => h('svg', attrs)
  },
})

describe('decorative icons', () => {
  it('hides icons rendered by the shared icon component from assistive technology', () => {
    const WrappedIcon = defineComponent({
      setup() {
        const { provideContext } = useContext()
        provideContext({
          icons: {
            test: TestIcon,
          } as never,
        })

        return () => h(Icon, { icon: 'test' })
      },
    })

    const wrapper = mount(WrappedIcon)

    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('hides directly rendered language icons from assistive technology', () => {
    const wrapper = mount(LanguageTitle, {
      props: {
        icon: TestIcon,
        language: 'typescript',
      },
    })

    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })
})
