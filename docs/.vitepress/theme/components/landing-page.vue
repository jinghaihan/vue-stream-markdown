<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { useData } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Markdown } from 'vue-stream-markdown'
import ArrowRight from '~icons/lucide/arrow-right'
import Check from '~icons/lucide/check'
import Copy from '~icons/lucide/copy'
import ExternalLink from '~icons/lucide/external-link'
import Radio from '~icons/lucide/radio'
import RotateCcw from '~icons/lucide/rotate-ccw'
import liveDemo from '../content/landing-page.md?raw'

const { isDark } = useData()
const { copy, copied } = useClipboard({ legacy: true })

const installCommand = 'npm install vue-stream-markdown'
const typingDelay = 20

const capabilities = [
  {
    title: 'Stream-first parser',
    body: 'Preserves useful structure while markdown is still incomplete.',
  },
  {
    title: 'Renderer control',
    body: 'Override nodes, previewers, code blocks and optional HTML behavior.',
  },
  {
    title: 'Production edges',
    body: 'GFM, math, Mermaid, CJK animation and link safety live in one renderer.',
  },
]

const typingIndex = ref(0)
const liveContent = computed(() => liveDemo.slice(0, typingIndex.value))
const completed = computed(() => typingIndex.value >= liveDemo.length)
const progress = computed(() => `${Math.min(100, Math.round((typingIndex.value / liveDemo.length) * 100))}%`)
const streamViewport = ref<HTMLDivElement>()

let interval: ReturnType<typeof setInterval> | undefined
let scrollFrame: number | undefined

onMounted(() => {
  interval = setInterval(() => {
    if (document.hidden)
      return

    if (completed.value)
      return

    typingIndex.value += 1
  }, typingDelay)
})

onBeforeUnmount(() => {
  interval && clearInterval(interval)

  if (scrollFrame)
    cancelAnimationFrame(scrollFrame)
})

watch(liveContent, async () => {
  await nextTick()

  if (scrollFrame)
    cancelAnimationFrame(scrollFrame)

  scrollFrame = requestAnimationFrame(() => {
    if (!streamViewport.value)
      return

    streamViewport.value.scrollTop = streamViewport.value.scrollHeight
  })
})

function copyInstallCommand() {
  copy(installCommand)
}

async function replayStream() {
  typingIndex.value = 0
  await nextTick()

  if (streamViewport.value)
    streamViewport.value.scrollTop = 0
}
</script>

<template>
  <main class="landing-page">
    <section class="landing-hero">
      <div class="hero-copy">
        <span class="hero-kicker">
          <Radio class="h-4 w-4" />
          Vue renderer for live markdown
        </span>
        <h1>Markdown that keeps up with streaming output.</h1>
        <p>
          A Vue component for rendering partial, changing markdown without waiting for the final token.
        </p>

        <div class="hero-actions">
          <a class="primary-action" href="/guide/">
            Read the docs
            <ArrowRight class="h-4 w-4" />
          </a>

          <a class="secondary-action" href="https://play-vue-stream-markdown.netlify.app/" target="_blank" rel="noreferrer">
            Playground
            <ExternalLink class="h-4 w-4" />
          </a>
        </div>

        <div class="install-command">
          <span aria-hidden="true">$</span>
          <input
            type="text"
            :value="installCommand"
            readonly
            aria-label="Install command"
          >
          <button
            type="button"
            :aria-label="copied ? 'Install command copied' : 'Copy install command'"
            @click="copyInstallCommand"
          >
            <component :is="copied ? Check : Copy" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="stream-stage" aria-label="Streaming markdown preview">
        <div class="stage-header">
          <div class="stage-title">
            <span class="pulse-dot" />
            answer.md
          </div>
          <div class="stage-meter">
            <span>{{ completed ? 'complete' : 'streaming' }}</span>
            <strong>{{ progress }}</strong>
            <button
              v-if="completed"
              type="button"
              class="replay-button"
              aria-label="Replay stream"
              @click="replayStream"
            >
              <RotateCcw class="h-3.5 w-3.5" />
              Replay
            </button>
          </div>
        </div>

        <div class="stage-body">
          <div class="stage-rail" aria-hidden="true">
            <span>parse</span>
            <span>diff</span>
            <span>render</span>
          </div>

          <div ref="streamViewport" class="stream-viewport">
            <Markdown
              class="landing-markdown"
              mode="streaming"
              locale="en-US"
              :content="liveContent"
              :is-dark="isDark"
              :shiki-options="{
                theme: ['github-light', 'github-dark'],
              }"
            />
          </div>
        </div>
      </div>

      <div class="hero-cue" aria-hidden="true" />
    </section>

    <section class="capability-band" aria-label="Core capabilities">
      <article v-for="item in capabilities" :key="item.title">
        <h2>{{ item.title }}</h2>
        <p>{{ item.body }}</p>
      </article>
    </section>
  </main>
</template>

<style scoped>
.landing-page {
  --landing-accent: #41b883;
  --landing-accent-strong: #22a06b;
  --landing-ink: var(--vp-c-text-1);
  --landing-muted: var(--vp-c-text-2);
  --landing-line: color-mix(in srgb, var(--vp-c-divider) 82%, transparent);
  --landing-panel: color-mix(in srgb, var(--vp-c-bg) 88%, var(--landing-accent) 12%);
  box-sizing: border-box;
  width: 100%;
  min-height: calc(100vh - 64px);
  margin: 0;
  overflow-x: clip;
  color: var(--landing-ink);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--landing-line) 48%, transparent) 1px, transparent 1px),
    linear-gradient(color-mix(in srgb, var(--landing-line) 44%, transparent) 1px, transparent 1px),
    radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--landing-accent) 18%, transparent), transparent 36rem),
    var(--vp-c-bg);
  background-size:
    72px 72px,
    72px 72px,
    auto,
    auto;
}

.landing-hero {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(320px, 1fr) auto;
  gap: 1.5rem;
  width: min(1120px, calc(100% - 2rem));
  min-height: calc(100vh - 104px);
  margin: 0 auto;
  padding: clamp(2.75rem, 5vw, 4.75rem) 0 1.25rem;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}

.hero-kicker {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  width: max-content;
  max-width: 100%;
  padding: 0.45rem 0.7rem;
  margin-bottom: 1rem;
  font-size: 0.86rem;
  font-weight: 650;
  color: var(--landing-accent-strong);
  background: color-mix(in srgb, var(--landing-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--landing-accent) 28%, transparent);
  border-radius: 999px;
}

.hero-kicker svg {
  transform-origin: center;
  animation: landing-radio-wiggle 2.6s ease-in-out infinite;
}

.hero-copy h1 {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(3rem, 7vw, 5.8rem);
  line-height: 0.91;
  letter-spacing: 0;
}

.hero-copy p {
  max-width: 620px;
  margin: 1.15rem 0 0;
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  line-height: 1.55;
  color: var(--landing-muted);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.45rem;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  min-height: 2.8rem;
  padding: 0 1rem;
  font-weight: 700;
  color: var(--landing-ink);
  text-decoration: none;
  border: 1px solid var(--landing-line);
  border-radius: 0.5rem;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.primary-action {
  color: #07130f;
  background: var(--landing-accent);
  border-color: var(--landing-accent);
}

.secondary-action {
  background: color-mix(in srgb, var(--vp-c-bg) 84%, transparent);
}

.primary-action:hover,
.secondary-action:hover {
  color: var(--landing-ink);
  text-decoration: none;
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--landing-accent) 52%, var(--landing-line));
}

.install-command {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.5rem;
  align-items: center;
  width: min(100%, 440px);
  min-height: 2.7rem;
  padding: 0 0.55rem 0 0.85rem;
  margin-top: 0.85rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  color: var(--landing-muted);
  background: color-mix(in srgb, var(--vp-c-bg) 78%, transparent);
  border: 1px solid var(--landing-line);
  border-radius: 0.5rem;
  backdrop-filter: blur(18px);
}

.install-command input {
  min-width: 0;
  color: var(--landing-ink);
  background: transparent;
  border: 0;
  outline: 0;
}

.install-command button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: var(--landing-muted);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 0.4rem;
  transition:
    color 160ms ease,
    background 160ms ease;
}

.install-command button:hover {
  color: var(--landing-ink);
  background: color-mix(in srgb, var(--landing-accent) 14%, transparent);
}

.stream-stage {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-height: min(45vh, 460px);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--landing-panel) 94%, transparent), var(--vp-c-bg)), var(--vp-c-bg);
  border: 1px solid var(--landing-line);
  border-radius: 0.75rem;
  box-shadow: 0 26px 80px color-mix(in srgb, #000 14%, transparent);
}

.stage-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  min-height: 3rem;
  padding: 0 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
  color: var(--landing-muted);
  border-bottom: 1px solid var(--landing-line);
}

.stage-title,
.stage-meter {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  min-width: 0;
}

.stage-meter strong {
  color: var(--landing-accent-strong);
}

.replay-button {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  justify-content: center;
  height: 1.65rem;
  padding: 0 0.55rem;
  font-family: var(--vp-font-family-base);
  font-size: 0.72rem;
  font-weight: 650;
  color: var(--landing-accent-strong);
  cursor: pointer;
  background: color-mix(in srgb, var(--landing-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--landing-accent) 28%, transparent);
  border-radius: 0.45rem;
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}

.replay-button:hover {
  color: var(--landing-ink);
  background: color-mix(in srgb, var(--landing-accent) 22%, transparent);
  border-color: color-mix(in srgb, var(--landing-accent) 44%, transparent);
}

.pulse-dot {
  width: 0.52rem;
  height: 0.52rem;
  background: var(--landing-accent);
  border-radius: 999px;
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--landing-accent) 34%, transparent);
  animation: landing-pulse 1.5s ease-out infinite;
}

.stage-body {
  display: grid;
  grid-template-columns: 6.8rem minmax(0, 1fr);
  min-height: 0;
}

.stage-rail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
  color: var(--landing-muted);
  text-transform: uppercase;
  border-right: 1px solid var(--landing-line);
}

.stage-rail span {
  width: 100%;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, var(--landing-line) 58%, transparent);
}

.stream-viewport {
  min-width: 0;
  max-height: min(44vh, 440px);
  padding: clamp(1rem, 2vw, 1.5rem);
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-color: color-mix(in srgb, var(--landing-muted) 34%, transparent) transparent;
  scrollbar-width: thin;
}

.stream-viewport::-webkit-scrollbar {
  width: 0.65rem;
}

.stream-viewport::-webkit-scrollbar-track {
  background: linear-gradient(
    90deg,
    transparent 0,
    transparent 0.25rem,
    color-mix(in srgb, var(--landing-line) 28%, transparent) 0.25rem,
    color-mix(in srgb, var(--landing-line) 28%, transparent) 0.35rem,
    transparent 0.35rem
  );
}

.stream-viewport::-webkit-scrollbar-thumb {
  min-height: 3rem;
  background: color-mix(in srgb, var(--landing-muted) 34%, transparent);
  background-clip: content-box;
  border: 0.22rem solid transparent;
  border-radius: 999px;
}

.stream-viewport:hover::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--landing-muted) 58%, transparent);
  background-clip: content-box;
}

.landing-markdown {
  --background: transparent;
  --foreground: var(--landing-ink);
  min-width: 0;
}

.landing-markdown :deep(div[class*='language-']) {
  margin: 0 !important;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
}

.landing-markdown :deep(div[class*='language-'] pre) {
  padding: 1rem !important;
}

.landing-markdown :deep([data-stream-markdown='code-block']) {
  margin: 0.9rem 0 0 !important;
  border-color: color-mix(in srgb, var(--landing-line) 72%, transparent);
  border-radius: 0.65rem;
}

.landing-markdown :deep([data-stream-markdown='code-block-header']) {
  position: static !important;
  top: auto !important;
}

.landing-markdown :deep(blockquote) {
  color: var(--landing-muted);
  border-left-color: var(--landing-accent);
}

.hero-cue {
  width: 1px;
  height: 2.5rem;
  margin: 0 auto;
  background: linear-gradient(180deg, var(--landing-accent), transparent);
}

.capability-band {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 0 0 clamp(3rem, 6vw, 5rem);
  border-top: 1px solid var(--landing-line);
}

.capability-band article {
  min-width: 0;
  padding: 1.35rem 1.25rem;
  border-right: 1px solid var(--landing-line);
}

.capability-band article:first-child {
  padding-left: 0;
}

.capability-band article:last-child {
  padding-right: 0;
  border-right: 0;
}

.capability-band h2 {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.35;
}

.capability-band p {
  margin: 0.55rem 0 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--landing-muted);
}

@keyframes landing-pulse {
  70% {
    box-shadow: 0 0 0 0.45rem color-mix(in srgb, var(--landing-accent) 0%, transparent);
  }
}

@keyframes landing-radio-wiggle {
  0%,
  74%,
  100% {
    transform: rotate(0deg) scale(1);
  }

  79% {
    transform: rotate(-12deg) scale(1.08);
  }

  84% {
    transform: rotate(10deg) scale(1.08);
  }

  89% {
    transform: rotate(-7deg) scale(1.04);
  }

  94% {
    transform: rotate(4deg) scale(1.02);
  }
}

@media (max-width: 768px) {
  .landing-hero {
    grid-template-rows: auto minmax(360px, auto) auto;
    gap: 1.25rem;
    min-height: auto;
    padding-top: 2.25rem;
  }

  .hero-copy {
    align-items: flex-start;
    text-align: left;
  }

  .hero-copy h1 {
    max-width: 9.5ch;
    font-size: clamp(2.65rem, 15vw, 4.8rem);
  }

  .hero-copy p {
    font-size: 1rem;
  }

  .hero-actions {
    justify-content: flex-start;
  }

  .stage-body {
    grid-template-columns: 1fr;
  }

  .stage-rail {
    display: none;
  }

  .stream-stage {
    min-height: 360px;
  }

  .stream-viewport {
    max-height: 360px;
  }

  .capability-band {
    grid-template-columns: 1fr;
  }

  .capability-band article,
  .capability-band article:first-child,
  .capability-band article:last-child {
    padding: 1rem 0;
    border-right: 0;
    border-bottom: 1px solid var(--landing-line);
  }

  .capability-band article:last-child {
    border-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse-dot {
    animation: none;
  }

  .hero-kicker svg {
    animation: none;
  }

  .primary-action,
  .secondary-action,
  .install-command button {
    transition: none;
  }
}
</style>
