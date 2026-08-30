# Custom Rendering

> Combine safe native HTML, registered Vue components, and custom fenced-code previewers in the same document.

## Native HTML

Allowed HTML remains part of the document instead of being flattened into plain text.

<div class="flex flex-col gap-4">
  <p class="my-4 align-middle">
    Native HTML can contain <strong>formatted content</strong> and
    <em>registered custom components</em>.
  </p>
  <figure class="inline-block self-start">
    <img
      class="max-w-full rounded-lg"
      src="https://placehold.co/600x400?text=Safe+HTML"
      alt="Safe HTML preview"
      title="Safe HTML preview"
      width="600"
      height="400"
    />
    <figcaption class="text-sm text-center italic text-muted-foreground">
      An image rendered from an allowed native tag.
    </figcaption>
  </figure>
</div>

## Registered Vue components

The `GitHub` tag below is mapped to a Vue component by the Playground.

<GitHub name="vue-stream-markdown" description="A streaming-optimized Markdown renderer for Vue" />

## Custom code previewers

The `echarts` language is mapped to an interactive Vue previewer while its source remains available from the code-block toolbar.

```echarts
{
  "tooltip": {
    "trigger": "item"
  },
  "legend": {
    "top": "5%",
    "left": "center"
  },
  "series": [
    {
      "name": "Traffic source",
      "type": "pie",
      "radius": ["40%", "70%"],
      "itemStyle": {
        "borderRadius": 10,
        "borderColor": "#fff",
        "borderWidth": 2
      },
      "data": [
        { "value": 1048, "name": "Search" },
        { "value": 735, "name": "Direct" },
        { "value": 580, "name": "Email" },
        { "value": 484, "name": "Referrals" }
      ]
    }
  ]
}
```

## Unsafe input

Unsafe protocols, event handlers, scripts, and unregistered tags are removed or rendered inert.

```markdown
<script>alert('XSS')</script>
<img src="https://placehold.co/600x400" onerror="alert('XSS')">
<a href="javascript:alert('XSS')">Unsafe link</a>
<div onclick="maliciousFunction()">Unsafe handler</div>
<UnknownWidget>Not registered</UnknownWidget>
```

<script>alert('XSS')</script>
<img src="https://placehold.co/600x400" onerror="alert('XSS')">
<a href="javascript:alert('XSS')">Unsafe link</a>
<div onclick="maliciousFunction()">Unsafe handler</div>
<UnknownWidget>Not registered</UnknownWidget>
