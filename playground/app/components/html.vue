<script setup lang="ts">
import type { HtmlNodeRendererProps } from 'vue-stream-markdown'
import DOMPurify from 'dompurify'
import { parseDocument } from 'htmlparser2'
import { treeFind } from 'treechop'
import { homepage } from '../../../package.json'
import { GitHub } from '../icons'

const props = withDefaults(defineProps<HtmlNodeRendererProps>(), {})
const PURIFY_CONFIG = {
  ADD_TAGS: ['github'],
  ADD_ATTR: ['name', 'description'],
}

const raw = computed(() => props.node.value)
const code = computed(() => DOMPurify.sanitize(raw.value, PURIFY_CONFIG))
const data = computed(() => parseDocument(code.value))
const github = computed(() => {
  const children = data.value.children
  if (!children || !children.length)
    return null
  return treeFind<any>(children, item => item.name?.toLowerCase() === 'github')
})
const attrs = computed(() => github.value?.attribs ?? {})

function onClick() {
  window.open(homepage, '_blank')
}
</script>

<template>
  <div
    v-if="github"
    class="px-4 py-2 border border-border rounded-md bg-card flex flex-col gap-1 cursor-pointer duration-150 self-start hover:bg-accent"
    @click="onClick"
  >
    <h3 class="flex gap-2 items-center">
      <GitHub />
      {{ attrs.name }}
    </h3>
    <p class="text-sm text-muted-foreground">
      {{ attrs.description }}
    </p>
  </div>
</template>
