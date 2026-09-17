<script setup lang="ts">
import { useI18n } from '../composables/use-i18n'
import { ArrowDownToLine, ArrowUpToLine } from '../icons'

const props = withDefaults(defineProps<{
  variant?: 'up' | 'down'
  getContainer: () => Element | null | undefined
  getScrollHeight?: () => number | undefined
}>(), {
  variant: 'down',
})

const icon = computed(() => props.variant === 'up' ? ArrowUpToLine : ArrowDownToLine)
const { t } = useI18n()
const name = computed(() => props.variant === 'up' ? t('common.scrollUp') : t('common.scrollDown'))
const placement = computed(() => props.variant === 'up' ? 'bottom' : 'top')

function onClick() {
  const container = props.getContainer()
  if (!container)
    return

  container.scrollTo({
    top: props.variant === 'up' ? 0 : container.scrollHeight,
    behavior: 'smooth',
  })
}
</script>

<template>
  <IconButton
    :icon="icon"
    :name="name"
    :button-class="['rounded-full', 'bg-popover', 'border', 'border-border']"
    :placement="placement"
    @click="onClick"
  />
</template>
