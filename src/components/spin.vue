<template>
  <div aria-hidden="true" data-stream-markdown="spin" />
</template>

<style>
.stream-markdown [data-stream-markdown='spin'] {
  display: inline-block;
  height: 1rem;
  width: 1rem;
  margin-block: 1rem;
  border: 2px solid var(--foreground);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
