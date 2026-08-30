<script setup lang="ts">
const props = defineProps<{
  background: string
  color: string
  name: string
}>()

const logoRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const filePrefix = computed(() => `vue-stream-markdown-${props.name.toLowerCase()}`)

function extractSvg(width?: number, height?: number): string | null {
  const svgElement = logoRef.value?.querySelector('svg')
  if (!svgElement)
    return null

  const clone = svgElement.cloneNode(true) as SVGElement
  clone.removeAttribute('class')
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('color', props.color)
  if (width !== undefined)
    clone.setAttribute('width', String(width))
  if (height !== undefined)
    clone.setAttribute('height', String(height))

  return `<?xml version="1.0" encoding="UTF-8"?>\n${clone.outerHTML}`
}

async function copySvg() {
  const svg = extractSvg()
  if (!svg)
    return

  await navigator.clipboard.writeText(svg)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1500)
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function downloadSvg() {
  const svg = extractSvg()
  if (!svg)
    return

  triggerDownload(
    URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })),
    `${filePrefix.value}.svg`,
  )
}

async function downloadPng() {
  const size = 512
  const padding = 112
  const svg = extractSvg(size - padding * 2, size - padding * 2)
  if (!svg)
    return

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context)
    return

  context.fillStyle = props.background
  context.fillRect(0, 0, size, size)

  const image = new Image()
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  await image.decode()
  context.drawImage(image, padding, padding)

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
  if (blob)
    triggerDownload(URL.createObjectURL(blob), `${filePrefix.value}.png`)
}
</script>

<template>
  <div class="border-default border rounded-xl overflow-hidden">
    <div
      ref="logoRef"
      class="px-10 py-14 flex items-center justify-center"
      :style="{ backgroundColor: background }"
    >
      <BrandLogo
        class="size-20"
        :style="{ color }"
      />
    </div>

    <div class="px-4 py-3 bg-muted flex items-center justify-between">
      <span class="text-sm text-muted font-medium">{{ name }}</span>
      <div class="flex gap-1.5 items-center">
        <UTooltip text="Copy SVG">
          <UButton
            :icon="copied ? 'i-lucide-check' : 'i-lucide-clipboard'"
            color="neutral"
            variant="ghost"
            size="xs"
            square
            class="cursor-pointer"
            @click="copySvg"
          />
        </UTooltip>
        <UButton
          label="SVG"
          color="neutral"
          variant="outline"
          size="xs"
          class="cursor-pointer"
          @click="downloadSvg"
        />
        <UButton
          label="PNG"
          color="neutral"
          variant="outline"
          size="xs"
          class="cursor-pointer"
          @click="downloadPng"
        />
      </div>
    </div>
  </div>
</template>
