// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useTailwindV3Theme } from '../../packages/vue/src/composables'

function mountThemeReader(element: HTMLElement) {
  return mount(defineComponent({
    setup() {
      useTailwindV3Theme({ element: () => element })
      return () => h('div')
    },
  }))
}

describe('tailwind v3 theme', () => {
  it('reuses variables while the theme attributes stay unchanged', () => {
    const element = document.createElement('div')
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle')

    mountThemeReader(element).unmount()
    mountThemeReader(element).unmount()

    expect(getComputedStyle).toHaveBeenCalledTimes(1)

    element.className = 'dark'
    mountThemeReader(element).unmount()

    expect(getComputedStyle).toHaveBeenCalledTimes(2)
  })
})
