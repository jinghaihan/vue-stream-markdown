const fileExtensionPattern = /\.[^/.]+$/

export function flow<T>(fns: Array<(arg: T) => T>): (arg: T) => T {
  return (input: T) => fns.reduce((acc, fn) => fn(acc), input)
}

export function save(filename: string, content: string | Blob, mimeType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function saveImage(url: string, alt?: string) {
  const response = await fetch(url)
  const blob = await response.blob()
  const urlPath = new URL(url, window.location.origin).pathname
  const originalFilename = urlPath.split('/').pop() || ''
  const extension = originalFilename.split('.').pop()
  const hasExtension
    = originalFilename.includes('.')
      && extension !== undefined
      && extension.length <= 4

  let filename = ''

  if (hasExtension) {
    filename = originalFilename
  }
  else {
    // Determine extension from blob type
    const mimeType = blob.type
    let fileExtension = 'png' // default

    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      fileExtension = 'jpg'
    }
    else if (mimeType.includes('png')) {
      fileExtension = 'png'
    }
    else if (mimeType.includes('svg')) {
      fileExtension = 'svg'
    }
    else if (mimeType.includes('gif')) {
      fileExtension = 'gif'
    }
    else if (mimeType.includes('webp')) {
      fileExtension = 'webp'
    }

    const baseName = alt || originalFilename || 'image'
    filename = `${baseName.replace(fileExtensionPattern, '')}.${fileExtension}`
  }

  save(filename, blob, blob.type)
}

export function svgToPngBlob(svgString: string, options?: { scale?: number }): Promise<Blob> | null {
  const scale = options?.scale ?? 5

  return new Promise((resolve, reject) => {
    const encoded
      = `data:image/svg+xml;base64,${
        btoa(unescape(encodeURIComponent(svgString)))}`

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const w = img.width * scale
      const h = img.height * scale

      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Failed to create 2D canvas context for PNG export'))
        return
      }

      // Do NOT draw a background → transparency preserved
      // ctx.clearRect(0, 0, w, h);

      ctx.drawImage(img, 0, 0, w, h)

      // Export PNG (lossless, keeps transparency)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'))
          return
        }
        resolve(blob)
      }, 'image/png')
    }

    img.onerror = () => reject(new Error('Failed to load SVG image'))
    img.src = encoded
  })
}
