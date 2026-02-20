import { OVERLAY_CONTAINER_ID } from '../constants/theme'
import { isClient } from './inference'

export function getOverlayContainer(): HTMLElement | null {
  if (!isClient())
    return null
  return document.querySelector(`#${OVERLAY_CONTAINER_ID}`)
}
