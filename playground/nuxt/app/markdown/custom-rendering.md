# Custom Rendering

> Add Vue components and interactive code previews to Markdown.

## Registered Vue components

The Playground maps `<GitHub>` to a Vue component.

<GitHub name="vue-stream-markdown" description="A streaming-optimized Markdown renderer for Vue" />

## Custom code previewers

An `echarts` code block becomes a chart. Use the toolbar to switch between preview and source.

```echarts
{
  "tooltip": { "trigger": "item" },
  "legend": { "bottom": 0 },
  "series": [
    {
      "name": "Traffic source",
      "type": "pie",
      "radius": ["40%", "65%"],
      "data": [
        { "value": 1048, "name": "Search" },
        { "value": 735, "name": "Direct" },
        { "value": 580, "name": "Email" }
      ]
    }
  ]
}
```

## Inline HTML

Simple HTML works alongside Markdown: <mark>highlighted text</mark> and H<sub>2</sub>O.
