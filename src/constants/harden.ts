import type { HardenOptions } from '../types'

export const DEFAULT_HARDEN_OPTIONS: HardenOptions = {
  allowedLinkPrefixes: ['*'],
  allowedImagePrefixes: ['*'],
  allowedProtocols: ['*'],
  allowDataImages: true,
}
