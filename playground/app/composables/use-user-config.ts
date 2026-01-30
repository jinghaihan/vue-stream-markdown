import type { UserConfig } from '../types'

const DEFAULT_USER_CONFIG: UserConfig = {
  locale: 'en-US',
  staticMode: false,
  autoScroll: false,
  typedStep: 1,
  typedDelay: 16,
  showInputEditor: true,
  showAstResult: false,
  shikiLightTheme: 'github-light',
  shikiDarkTheme: 'github-dark',
  mermaidRenderer: 'vanilla',
  mermaidLightTheme: 'neutral',
  mermaidDarkTheme: 'dark',
  mermaidBeautifulLightTheme: 'github-light',
  mermaidBeautifulDarkTheme: 'github-dark',
  caret: 'block',
}

export function useUserConfig() {
  const userConfig = useState<UserConfig>('user-config', () => (DEFAULT_USER_CONFIG))

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
    if (data) {
      userConfig.value = {
        ...DEFAULT_USER_CONFIG,
        ...JSON.parse(data),
      }
    }
  })

  return userConfig
}
