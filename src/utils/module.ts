export async function hasShikiModule() {
  try {
    await import('shiki')
    return true
  }
  catch {
    return false
  }
}

export async function hasMermaidModule() {
  try {
    await import('mermaid')
    return true
  }
  catch {
    return false
  }
}

export async function hasKatexModule() {
  try {
    await import('katex')
    return true
  }
  catch {
    return false
  }
}
