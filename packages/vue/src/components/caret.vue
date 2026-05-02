<script setup lang="ts">
import { useContext } from '../composables'

const { enableCaret, caret } = useContext()
</script>

<template>
  <span v-if="enableCaret" data-stream-markdown="caret">{{ caret }}</span>
</template>
