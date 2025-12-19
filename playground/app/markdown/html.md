## Custom Html Render

<GitHub name="vue-stream-markdown" description="Streaming-optimized Markdown Renderer" />

rendering raw HTML content can lead to serious security vulnerabilities, particularly **XSS (Cross-Site Scripting) attacks**, which can compromise system security.

Consider this example:

```markdown
<script>alert('XSS Attack')</script>
<img src="x" onerror="alert('XSS')">
<div onclick="maliciousFunction()">Click me</div>
```

If rendered directly without sanitization, these could execute malicious JavaScript in the user's browser.

<script>alert('XSS Attack')</script>
<img src="x" onerror="alert('XSS')">
<div onclick="maliciousFunction()">Click me</div>
