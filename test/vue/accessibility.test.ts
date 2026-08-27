// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import Button from '../../packages/vue/src/components/button.vue'
import Modal from '../../packages/vue/src/components/modal.vue'
import { useContext } from '../../packages/vue/src/composables'

const TestIcon = defineComponent({
  setup(_, { attrs }) {
    return () => h('svg', attrs)
  },
})

const PassthroughOverlay = defineComponent({
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  },
})

function mountButton(props: { name: string, announcement?: string }) {
  const WrappedButton = defineComponent({
    setup() {
      const { provideContext } = useContext()
      provideContext({
        icons: {
          copy: TestIcon,
        } as never,
        uiComponents: {
          Dropdown: PassthroughOverlay,
          Icon: TestIcon,
          Tooltip: PassthroughOverlay,
        } as never,
      })

      return () => h(Button, {
        ...props,
        icon: 'copy',
      })
    },
  })

  return mount(WrappedButton)
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('button accessibility', () => {
  it('uses the control name as the accessible label for icon-only buttons', () => {
    const wrapper = mountButton({ name: 'Copy' })

    expect(wrapper.find('button').attributes('aria-label')).toBe('Copy')
  })

  it('announces transient control status updates', () => {
    const wrapper = mountButton({ name: 'Copied', announcement: 'Copied' })
    const status = wrapper.find('[role="status"]')

    expect(status.text()).toBe('Copied')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.attributes('aria-atomic')).toBe('true')
  })
})

describe('modal accessibility', () => {
  it('exposes modal semantics and uses its title as the accessible name', async () => {
    mount(Modal, {
      attachTo: document.body,
      props: {
        open: true,
        title: 'Image preview',
        transition: '',
      },
    })
    await nextTick()

    const dialog = document.body.querySelector('[role="dialog"]')

    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-label')).toBe('Image preview')
  })

  it('associates slotted titles through aria-labelledby', async () => {
    mount(Modal, {
      attachTo: document.body,
      props: {
        open: true,
        titleId: 'code-modal-title',
        transition: '',
      },
      slots: {
        title: 'TypeScript',
      },
    })
    await nextTick()

    const dialog = document.body.querySelector('[role="dialog"]')
    const title = document.getElementById('code-modal-title')

    expect(dialog?.getAttribute('aria-labelledby')).toBe('code-modal-title')
    expect(title?.textContent).toBe('TypeScript')
  })
})
