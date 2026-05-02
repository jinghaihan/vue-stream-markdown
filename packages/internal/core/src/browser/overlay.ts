import { getOverlayContainer, OVERLAY_CONTAINER_ID } from '../utils'

export function ensureOverlayContainer(options: {
  isDark: boolean
  cssVariables?: Record<string, string>
}): HTMLElement | null {
  const overlayContainer = getOverlayContainer() ?? createOverlayContainer(options.isDark)
  syncOverlayContainerTheme(overlayContainer, options)
  return overlayContainer
}

export function createOverlayContainer(isDark: boolean): HTMLElement {
  const div = document.createElement('div')
  div.id = OVERLAY_CONTAINER_ID
  div.classList.add('stream-markdown')
  div.classList.add(isDark ? 'dark' : 'light')
  document.body.appendChild(div)
  return div
}

export function syncOverlayContainerTheme(
  overlayContainer: HTMLElement | null,
  options: {
    isDark: boolean
    cssVariables?: Record<string, string>
  },
) {
  if (!overlayContainer)
    return

  overlayContainer.classList.toggle('dark', options.isDark)
  overlayContainer.classList.toggle('light', !options.isDark)
  Object.entries(options.cssVariables ?? {}).forEach(([key, value]) => {
    overlayContainer.style.setProperty(key, value)
  })
}
