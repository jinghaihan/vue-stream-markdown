## Custom Html Render

<div class="flex flex-col gap-4">
  <p class="my-4 align-middle">
    Native HTML can be mixed with <strong>markdown output</strong> and
    <em>custom components</em>.
  </p>

  <figure class="inline-block self-start">
    <img
      class="max-w-full rounded-lg"
      src="https://placehold.co/600x400"
      alt="Placeholder preview"
      title="Placeholder preview"
      width="600"
      height="400"
    />
    <figcaption class="text-sm text-center italic text-muted-foreground">
      A safe image rendered from an allowed native tag.
    </figcaption>
  </figure>

  <p class="my-4 align-middle">
    <a
      class="text-primary underline cursor-pointer [overflow-wrap:anywhere]"
      href="https://github.com/jinghaihan/vue-stream-markdown"
      target="_blank"
    >
      Open repository
    </a>
  </p>

  <ul class="leading-6 pl-5 whitespace-normal list-disc my-4">
    <li class="py-1 pl-1">Safe native tags stay native.</li>
    <li class="py-1 pl-1">Registered custom tags become Vue components.</li>
  </ul>

  <GitHub name="vue-stream-markdown" description="Streaming-optimized Markdown Renderer" />
</div>

Rendering raw HTML content can lead to serious security vulnerabilities, particularly **XSS (Cross-Site Scripting) attacks**, which can compromise system security.

Consider this example:

```markdown
<script>alert('XSS Attack')</script>
<img src="https://placehold.co/600x400" onerror="alert('XSS')">
<a href="javascript:alert('XSS')">Unsafe link</a>
<div onclick="maliciousFunction()">Click me</div>
<UnknownWidget>Not registered</UnknownWidget>
```

If rendered directly without sanitization, these could execute malicious JavaScript in the user's browser.

<script>alert('XSS Attack')</script>
<img src="https://placehold.co/600x400" onerror="alert('XSS')">
<a href="javascript:alert('XSS')">Unsafe link</a>
<div onclick="maliciousFunction()">Click me</div>
<UnknownWidget>Not registered</UnknownWidget>
