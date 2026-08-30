<script setup lang="ts">
import { joinURL } from 'ufo'

definePageMeta({
  layout: 'docs',
})

const title = 'Brand assets'
const description = 'Logos and assets for Vue Stream Markdown. Download SVG or PNG, or copy the raw SVG source directly.'
const site = useSiteConfig()
const canonicalUrl = computed(() => joinURL(site.url, '/logos'))

useRobotsRule('index, follow')

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: canonicalUrl,
})

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
})

defineOgImage('DocsSatori', {
  title,
  description,
})
</script>

<template>
  <div>
    <UPageHeader
      :title="title"
      :description="description"
    />

    <UPageBody>
      <section>
        <h2 class="text-highlighted text-2xl font-bold">
          Vue Stream Markdown
        </h2>
        <p class="mb-6 mt-2">
          A Vue renderer for complete and streaming Markdown.
        </p>
        <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
          <BrandLogoCard
            name="Light"
            background="#ffffff"
            color="#41b883"
          />
          <BrandLogoCard
            name="Dark"
            background="#0a0a0a"
            color="#41b883"
          />
        </div>
      </section>
    </UPageBody>
  </div>
</template>
