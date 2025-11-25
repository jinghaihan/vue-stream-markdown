<script setup lang="ts">
const props = withDefaults(defineProps<{
  getAlign?: (index: number) => 'left' | 'center' | 'right'
  headers?: unknown[]
  rows?: Array<{ children: unknown[] }>
}>(), {})

function getAlign(index: number) {
  return props.getAlign?.(index) || 'left'
}
</script>

<template>
  <table data-stream-markdown="table">
    <thead data-stream-markdown="table-header">
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
    <tbody data-stream-markdown="table-body">
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

<style>
.stream-markdown [data-stream-markdown='table'] {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.stream-markdown [data-stream-markdown='table-header'] {
  position: relative;
  background-color: color-mix(in oklab, var(--muted) 80%, transparent);
}

.stream-markdown [data-stream-markdown='table-body'] {
  position: relative;
  border-color: var(--border);
  border-block-width: 1px;
  font-weight: 600;
  background-color: color-mix(in oklab, var(--muted) 40%, transparent);
}

.stream-markdown [data-stream-markdown='table'] tr {
  border-bottom: 1px solid var(--border);
}

.stream-markdown [data-stream-markdown='table'] p {
  margin: 0;
}

.stream-markdown [data-stream-markdown='table-header'] th {
  white-space: nowrap;
}

.stream-markdown [data-stream-markdown='table-header'] th,
.stream-markdown [data-stream-markdown='table-body'] td {
  padding-inline: 1rem;
  padding-block: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
