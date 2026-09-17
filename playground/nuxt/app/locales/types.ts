export type PlaygroundLanguage = 'en-US' | 'zh-CN'

export interface PlaygroundLocale {
  actions: {
    generateShareLinks: string
    clearContent: string
    previousStep: string
    startTyping: string
    stopTyping: string
    nextStep: string
    toggleInputEditor: string
    toggleDocumentResult: string
    changeLanguages: string
    toggleDarkMode: string
    documentation: string
    viewOnGitHub: string
  }
  common: {
    copy: string
    scrollUp: string
    scrollDown: string
    examples: string
  }
  documentResult: {
    hideKeys: string
    hideKeysPlaceholder: string
  }
  settings: {
    title: string
    sections: {
      general: string
      codeBlock: string
      shiki: string
      mermaid: string
      caret: string
    }
    labels: {
      staticMode: string
      autoScroll: string
      typingIndex: string
      stepMin: string
      stepMax: string
      typedDelay: string
      variant: string
      lightTheme: string
      darkTheme: string
      renderer: string
      mermaidLightTheme: string
      mermaidDarkTheme: string
      beautifulMermaidLightTheme: string
      beautifulMermaidDarkTheme: string
      caret: string
      animation: string
      split: string
      duration: string
      stagger: string
    }
    placeholders: {
      typingIndex: string
      minimumStep: string
      maximumStep: string
      typedDelay: string
      duration: string
      stagger: string
    }
    options: {
      mermaid: string
      beautifulMermaid: string
      default: string
      dark: string
      forest: string
      neutral: string
      base: string
      none: string
      auto: string
      word: string
      character: string
      modern: string
      classic: string
      minimal: string
    }
  }
}
