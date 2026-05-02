import { isClient } from './env'

export const OVERLAY_CONTAINER_ID = 'stream-markdown-overlay'

export function getOverlayContainer(): HTMLElement | null {
  if (!isClient())
    return null

  return document.getElementById(OVERLAY_CONTAINER_ID)
}
