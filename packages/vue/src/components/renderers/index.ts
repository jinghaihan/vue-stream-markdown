import { defineAsyncComponent } from 'vue'

export const CodeRenderer = defineAsyncComponent(() => import('./code/index.vue'))
export const CodeBlockRenderer = defineAsyncComponent(() => import('./code-block.vue'))
export const ImageRenderer = defineAsyncComponent(() => import('./image-node.vue'))
export const LinkRenderer = defineAsyncComponent(() => import('./link-node.vue'))
export const MathRenderer = defineAsyncComponent(() => import('./math-node.vue'))
export const TableRenderer = defineAsyncComponent(() => import('./table-node.vue'))
