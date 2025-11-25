<script setup lang="ts"></script>

<template>
  <section class="flex flex-col size-full">
    <header class="p-2 border-b border-border flex flex-col gap-2 shadow-sm items-center justify-between z-10 lg:flex-row">
      <slot name="title" />
      <slot name="actions" />
    </header>
    <main class="flex flex-1 flex-col gap-2 overflow-auto lg:flex-row">
      <slot />
    </main>
  </section>
</template>
