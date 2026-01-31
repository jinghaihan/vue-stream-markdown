<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { useRouter } from 'vitepress'
import { Markdown } from 'vue-stream-markdown'
import Check from '~icons/lucide/check'
import Copy from '~icons/lucide/copy'

const router = useRouter()
const { copy, copied } = useClipboard({ legacy: true })

const installCommand = 'npm install vue-stream-markdown'

const usage = `
\`\`\`vue
<script setup lang="ts">
import { Markdown } from 'vue-stream-markdown'
import 'katex/dist/katex.min.css'
import 'vue-stream-markdown/index.css'

const content = ref('# Hello World, This is a markdown content.')
<\/script>

<template>
  <Markdown :content="content" />
</template>
\`\`\`
`

function goToDocs() {
  router.go('/guide/')
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-64px)] w-full items-center justify-center">
    <div class="flex flex-col gap-4 max-w-3xl w-full items-center items-center">
      <div class="flex flex-col gap-4 max-w-xl items-center">
        <h1 class="text-3xl tracking-tight font-bold whitespace-nowrap lg:text-6xl md:text-5xl sm:text-4xl">
          Vue Stream Markdown
        </h1>
        <p class="text-xl text-muted-foreground text-center md:text-2xl">
          Streaming markdown output, Useful for text streams like LLM outputs.
        </p>

        <div class="px-4 flex flex-col gap-4 w-full items-center justify-center sm:flex-row">
          <div class="px-4 border border-border rounded-md bg-muted flex gap-2 h-10 w-full items-center sm:max-w-xl">
            <span class="text-muted-foreground font-mono">$</span>
            <input
              type="text"
              :value="installCommand"
              readonly
              class="text-sm font-mono p-2 bg-transparent flex-1"
            >
            <button
              class="text-muted-foreground transition-colors hover:text-accent-foreground hover:bg-accent"
              @click="() => copy(installCommand)"
            >
              <component :is="copied ? Check : Copy" class="h-4 w-4" />
            </button>
          </div>

          <button
            class="text-foreground font-semibold px-4 border border-border rounded-md border-solid bg-muted h-10 whitespace-nowrap transition-opacity hover:opacity-90"
            @click="goToDocs"
          >
            Read the docs
          </button>
        </div>
      </div>

      <div class="px-4 w-full">
        <Markdown class="w-full" :content="usage" />
      </div>
    </div>
  </div>
</template>
