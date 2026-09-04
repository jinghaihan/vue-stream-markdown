import type { UserConfig } from '../types'
import { version } from 'vue-stream-markdown/package.json'

const STORAGE_KEY = `user-config-${version}`

const DEFAULT_USER_CONFIG: UserConfig = {
  locale: 'en-US',
  staticMode: false,
  autoScroll: false,
  typedStepMin: 1,
  typedStepMax: 8,
  typedDelay: 16,
  showInputEditor: true,
  showDocumentResult: false,
  shikiLightTheme: 'github-light',
  shikiDarkTheme: 'github-dark',
  mermaidRenderer: 'beautiful',
  mermaidLightTheme: 'neutral',
  mermaidDarkTheme: 'dark',
  mermaidBeautifulLightTheme: 'github-light',
  mermaidBeautifulDarkTheme: 'github-dark',
  caret: 'block',
  animation: '',
  animationSplit: 'auto',
  animationDuration: 500,
  animationStagger: 40,
}

export function useUserConfig() {
  const userConfig = useState<UserConfig>('user-config', () => (DEFAULT_USER_CONFIG))

  watch(
    userConfig,
    (data) => {
      if (typeof window !== 'undefined')
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },
    { deep: true },
  )

  onMounted(() => {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      userConfig.value = {
        ...DEFAULT_USER_CONFIG,
        ...JSON.parse(data),
      }
    }
  })

  return userConfig
}
