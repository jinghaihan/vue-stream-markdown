import { OVERLAY_CONTAINER_ID } from '../constants/theme'

export function getOverlayContainer(): Element | null {
  return document.querySelector(`#${OVERLAY_CONTAINER_ID}`)
}
