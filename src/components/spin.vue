<template>
  <div aria-hidden="true" data-stream-markdown="spin" />
</template>

<style>
:is(.stream-markdown, .stream-markdown-overlay) {
  & [data-stream-markdown='spin'] {
    display: inline-block;
    height: 1rem;
    width: 1rem;
    margin-block: 1rem;
    border: 2px solid var(--foreground);
    border-top-color: transparent;
    border-radius: 50%;
    animation: stream-markdown-spin 1s linear infinite;
  }
}
</style>
