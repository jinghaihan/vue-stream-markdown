export function useDark() {
  const color = useColorMode()
  const isDark = ref<boolean>(false)

  function toggle() {
    color.preference = color.value === 'dark' ? 'light' : 'dark'
  }

  function toggleDark(event: MouseEvent) {
    // @ts-expect-error experimental API
    const isAppearanceTransition = document.startViewTransition
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAppearanceTransition) {
      toggle()
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )
    const transition = document.startViewTransition(async () => {
      toggle()
      await nextTick()
    })
    transition.ready
      .then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]
        document.documentElement.animate(
          {
            clipPath: isDark.value
              ? [...clipPath].reverse()
              : clipPath,
          },
          {
            duration: 400,
            easing: 'ease-out',
            fill: 'forwards',
            pseudoElement: isDark.value
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)',
          },
        )
      })
  }

  watch(
    () => color.value,
    (data) => {
      isDark.value = data === 'dark'
    },
  )

  onMounted(() => {
    isDark.value = color.value === 'dark'
  })

  return { isDark, toggle, toggleDark }
}
