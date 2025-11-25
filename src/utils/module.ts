export async function hasShiki() {
  try {
    await import('shiki')
    return true
  }
  catch {
    return false
  }
}

export async function hasMermaid() {
  try {
    await import('mermaid')
    return true
  }
  catch {
    return false
  }
}

export async function hasKatex() {
  try {
    await import('katex')
    return true
  }
  catch {
    return false
  }
}
