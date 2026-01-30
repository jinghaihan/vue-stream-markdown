<script setup lang="ts">
import { useContext } from '../composables'

const { enableAnimate, caret } = useContext()
</script>

<template>
  <span v-if="enableAnimate" data-stream-markdown="caret">{{ caret }}</span>
</template>
