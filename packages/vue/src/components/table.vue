<script setup lang="ts">
import type { UITableProps } from '../types'

const props = withDefaults(defineProps<UITableProps>(), {})

function getAlign(index: number) {
  return props.getAlign?.(index) || 'left'
}
</script>

<template>
  <table
    data-stream-markdown="table"
    class="border border-border rounded-lg w-full overflow-hidden border-collapse [&_p]:m-0 [&_tr]:border-b [&_tr]:border-border"
  >
    <thead
      data-stream-markdown="table-header"
      class="bg-muted/80 relative [&_th]:text-sm [&_th]:px-4 [&_th]:py-2 [&_th]:whitespace-nowrap"
    >
      <tr>
        <th
          v-for="(cell, index) in headers"
          :key="`header-${index}`"
          :style="{
            textAlign: getAlign(index),
          }"
        >
          <slot name="header-cell" v-bind="{ cell, cellIndex: index }" />
        </th>
      </tr>
    </thead>
    <tbody
      data-stream-markdown="table-body"
      class="font-semibold border-y border-border bg-muted/40 relative [&_td]:text-sm [&_td]:px-4 [&_td]:py-2"
    >
      <tr v-for="(row, rowIndex) in rows" :key="`${row}-${rowIndex}`">
        <td
          v-for="(cell, cellIndex) in row.children"
          :key="cellIndex"
          :style="{
            textAlign: getAlign(cellIndex),
          }"
        >
          <slot name="body-cell" v-bind="{ cell, rowIndex, cellIndex }" />
        </td>
      </tr>
    </tbody>
  </table>
</template>
