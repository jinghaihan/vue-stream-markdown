import type { UserConfig } from '../types'

export function useUserConfig() {
  const userConfig = useState<UserConfig>('user-config', () => ({
    locale: 'en-US',
    staticMode: false,
    autoScroll: false,
    typedStep: 1,
    typedDelay: 16,
    showInputEditor: true,
    showAstResult: false,
    shikiLightTheme: 'github-light',
    shikiDarkTheme: 'github-dark',
    mermaidLightTheme: 'neutral',
    mermaidDarkTheme: 'dark',
  }))

  watch(
    userConfig,
    (data) => {
      if (typeof window !== 'undefined')
        localStorage.setItem('user-config', JSON.stringify(data))
    },
    { deep: true },
  )

  onMounted(() => {
    const data = localStorage.getItem('user-config')
    if (data)
      userConfig.value = JSON.parse(data)
  })

  return userConfig
}
