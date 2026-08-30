<script setup lang="ts">
const { header, footer, assistant } = useAppConfig()
const content = useDocsContent()
const assistantOpen = useAssistant()
const navigation = useMainNavigation()
</script>

<template>
  <UHeader :to="prefixLink(header?.to || '/', content.base)">
    <template #left>
      <AppHeaderBrand />
    </template>

    <AppHeaderCenter class="hidden lg:flex" />

    <template #right>
      <UContentSearchButton
        v-if="header?.search"
        :collapsed="false"
        :icon="false"
        class="text-muted font-normal min-w-[150px] hidden lg:inline-flex"
      />

      <UButton
        v-if="assistant?.enabled"
        label="Ask AI"
        color="neutral"
        variant="outline"
        @click="assistantOpen = true"
      />

      <UColorModeButton
        color="neutral"
        variant="outline"
        :ui="{ leadingIcon: 'size-4' }"
        class="p-2"
      />

      <template v-if="header?.links">
        <UButton
          v-for="(link, index) of header.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
          class="hidden lg:inline-flex"
        />
      </template>
    </template>

    <template #toggle="{ open, toggle }">
      <IconMenuToggle
        :open="open"
        @click="toggle"
      />
    </template>

    <template #body>
      <div class="flex flex-col h-full justify-between">
        <div class="flex flex-col gap-4">
          <UContentSearchButton
            v-if="header?.search"
            :collapsed="false"
            size="xl"
            class="font-normal w-full"
            :icon="false"
          />
          <UNavigationMenu
            :items="navigation"
            color="neutral"
            variant="link"
            orientation="vertical"
            :ui="{ root: 'pl-0 -ml-2', link: 'py-2 my-2 text-md' }"
          />
        </div>
        <div class="flex gap-4 items-center">
          <template v-if="footer?.links">
            <UButton
              v-for="(link, index) of footer.links"
              :key="index"
              v-bind="{ color: 'neutral', variant: 'ghost', size: 'md', ...link }"
              class="text-highlighted"
            />
          </template>
          <UColorModeButton
            size="md"
            class="text-highlighted"
          />
        </div>
      </div>
    </template>
  </UHeader>
</template>
