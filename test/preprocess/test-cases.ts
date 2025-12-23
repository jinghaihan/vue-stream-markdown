export interface TestCase {
  description: string
  input: string
  expected: string
  integrationExpected?: string
  preprocessOptions?: { singleDollarTextMath?: boolean }
}

export type TestCasesByCategory = Record<string, TestCase[]>

export const codeTestCases: TestCasesByCategory = {
  'code-inline': [
    {
      description: 'should remove bare `',
      input: '`',
      expected: '',
    },
    {
      description: 'should remove bare ``',
      input: '``',
      expected: '',
    },
    {
      description: 'should remove bare ```',
      input: '```',
      expected: '',
    },
    {
      description: 'should remove trailing `',
      input: 'Text `',
      expected: 'Text',
    },
    {
      description: 'should remove trailing ``',
      input: 'Text ``',
      expected: 'Text',
    },
    {
      description: 'should remove trailing ```',
      input: 'Text ```',
      expected: 'Text',
    },
    {
      description: 'should complete unclosed `',
      input: 'Hello `world',
      expected: 'Hello `world`',
    },
    {
      description: 'should not modify closed inline code',
      input: 'Hello `world`',
      expected: 'Hello `world`',
    },
    {
      description: 'should remove bare ` in paragraph',
      input: 'Hello\n\n`',
      expected: 'Hello',
    },
    {
      description: 'should complete multiple unclosed ` in paragraph',
      input: '`a` and `b',
      expected: '`a` and `b`',
    },
    {
      description: 'should complete ` spanning multiple lines',
      input: 'Hello `world\nand more code',
      expected: 'Hello `world\nand more code`',
    },
    {
      description: 'should ignore code blocks when counting inline code',
      input: '```js\ncode\n``` and `inline',
      expected: '```js\ncode\n``` and `inline`',
    },
    {
      description: 'should only complete last unclosed inline code',
      input: 'Para1 `one\n\nPara2 `two',
      expected: 'Para1 `one\n\nPara2 `two`',
    },
    {
      description: 'should complete unclosed ` in context',
      input: 'Text with ` and more',
      expected: 'Text with ` and more`',
    },
  ],

  'code-block': [
    {
      description: 'should complete unclosed code block',
      input: '```javascript\nconst x = 1',
      expected: '```javascript\nconst x = 1\n```',
    },
    {
      description: 'should complete code block with trailing `',
      input: '```javascript\nconst x = 1`',
      expected: '```javascript\nconst x = 1\n```',
    },
    {
      description: 'should complete code block with trailing ``',
      input: '```javascript\nconst x = 1``',
      expected: '```javascript\nconst x = 1\n```',
    },
    {
      description: 'should complete code block ending with newline',
      input: '```python\nprint("hello")\n',
      expected: '```python\nprint("hello")\n```',
    },
    {
      description: 'should not modify closed code blocks',
      input: '```js\ncode\n```',
      expected: '```js\ncode\n```',
    },
    {
      description: 'should complete code block spanning multiple paragraphs',
      input: '```javascript\nfunction test() {\n\n  return true;\n}',
      expected: '```javascript\nfunction test() {\n\n  return true;\n}\n```',
    },
    {
      description: 'should complete last code block when multiple exist',
      input: '```js\ncode1\n```\n\nText\n\n```python\ncode2',
      expected: '```js\ncode1\n```\n\nText\n\n```python\ncode2\n```',
    },
    {
      description: 'should complete code block without language',
      input: '```\nplain code',
      expected: '```\nplain code\n```',
    },
    {
      description: 'should complete code block with only language',
      input: '```javascript',
      expected: '```javascript\n```',
    },
    {
      description: 'should ignore inline code inside code block',
      input: '```js\nconst x = `template\n```',
      expected: '```js\nconst x = `template\n```',
    },
    {
      description: 'should not process inline code inside closed code block',
      input: '```js\nconst x = `template\n```',
      expected: '```js\nconst x = `template\n```',
    },
  ],

  'code-mixed': [
    {
      description: 'should handle inline code and code blocks together',
      input: '```js\ncode\n```\n\nUse `variable',
      expected: '```js\ncode\n```\n\nUse `variable`',
    },
    {
      description: 'should complete code block before inline code',
      input: 'Text `inline` code\n\n```js\nconst x = 1',
      expected: 'Text `inline` code\n\n```js\nconst x = 1\n```',
    },
  ],
}

export const deleteTestCases: TestCasesByCategory = {
  delete: [
    {
      description: 'should complete unclosed ~~',
      input: 'Hello ~~world',
      expected: 'Hello ~~world~~',
    },
    {
      description: 'should complete unclosed ~~ with trailing ~',
      input: 'Hello ~~world~',
      expected: 'Hello ~~world~~',
    },
    {
      description: 'should not modify closed ~~',
      input: 'Hello ~~world~~',
      expected: 'Hello ~~world~~',
    },
    {
      description: 'should remove bare ~',
      input: '~',
      expected: '',
    },
    {
      description: 'should remove bare ~~',
      input: '~~',
      expected: '',
    },
    {
      description: 'should remove trailing ~~',
      input: 'Hello ~~',
      expected: 'Hello',
    },
    {
      description: 'should remove trailing ~~ with whitespace',
      input: 'Hello ~~   ',
      expected: 'Hello',
    },
    {
      description: 'should complete multiple unclosed ~~ in paragraph',
      input: '~~a~~ and ~~b',
      expected: '~~a~~ and ~~b~~',
    },
    {
      description: 'should only process last paragraph',
      input: 'Para1 ~~unclosed\n\nPara2 ~~text',
      expected: 'Para1 ~~unclosed\n\nPara2 ~~text~~',
    },
    {
      description: 'should complete ~~ with other markdown',
      input: '**bold** and ~~strike',
      expected: '**bold** and ~~strike~~',
    },
    {
      description: 'should remove trailing ~ after closed ~~',
      input: '~~complete~~ text~',
      expected: '~~complete~~ text',
    },
    {
      description: 'should complete ~~ ending with single ~',
      input: '~~incomplete text~',
      expected: '~~incomplete text~~',
    },
    {
      description: 'should complete ~~ with trailing ~ and whitespace',
      input: '~~text ~',
      expected: '~~text ~~',
    },
    {
      description: 'should complete ~~ with single trailing ~',
      input: '~~text~',
      expected: '~~text~~',
    },
    {
      description: 'should ignore ~~ inside code block',
      input: '```\nconst x = ~~value\n```',
      expected: '```\nconst x = ~~value\n```',
    },
    {
      description: 'should ignore ~~ inside code block',
      input: '```\nconst x = ~~value\n```',
      expected: '```\nconst x = ~~value\n```',
    },
    {
      description: 'should process ~~ outside code block',
      input: '```\ncode\n```\n\nText ~~strike',
      expected: '```\ncode\n```\n\nText ~~strike~~',
    },
    {
      description: 'should ignore ~~ inside math block',
      input: 'The formula is $$x = 1 + 2~~3',
      expected: 'The formula is $$x = 1 + 2~~3',
      integrationExpected: 'The formula is $$x = 1 + 2~~3$$',
    },
    {
      description: 'should complete ~~ when URL contains tilde',
      input: 'Text ~~strike~~ and [link](https://example.com/page~value) ~~more',
      expected: 'Text ~~strike~~ and [link](https://example.com/page~value) ~~more~~',
    },
  ],
}

export const emphasisTestCases: TestCasesByCategory = {
  'emphasis-asterisk': [
    {
      description: 'should remove bare *',
      input: '*',
      expected: '',
    },
    {
      description: 'should complete unclosed *',
      input: 'Hello *world',
      expected: 'Hello *world*',
    },
    {
      description: 'should complete * spanning multiple lines',
      input: 'Hello *world\nand more text',
      expected: 'Hello *world\nand more text*',
    },
    {
      description: 'should not modify closed *',
      input: 'Hello *world*',
      expected: 'Hello *world*',
    },
    {
      description: 'should remove bare * in paragraph',
      input: 'Hello\n\n*',
      expected: 'Hello',
    },
    {
      description: 'should ignore ** when counting *',
      input: '**bold** and *italic',
      expected: '**bold** and *italic*',
    },
    {
      description: 'should only process last paragraph',
      input: 'Para1 *unclosed\n\nPara2 *text',
      expected: 'Para1 *unclosed\n\nPara2 *text*',
    },
    {
      description: 'should prioritize * over _ when both unclosed',
      input: '*asterisk and _underscore',
      expected: '*asterisk and _underscore_*',
    },
  ],

  'emphasis-underscore': [
    {
      description: 'should remove bare _',
      input: '_',
      expected: '',
    },
    {
      description: 'should complete unclosed _',
      input: 'Hello _world',
      expected: 'Hello _world_',
    },
    {
      description: 'should complete _ spanning multiple lines',
      input: 'Hello _world\nand more text',
      expected: 'Hello _world\nand more text_',
    },
    {
      description: 'should not modify closed _',
      input: 'Hello _world_',
      expected: 'Hello _world_',
    },
    {
      description: 'should remove bare _ in paragraph',
      input: 'Hello\n\n_',
      expected: 'Hello',
    },
    {
      description: 'should ignore __ when counting _',
      input: '__bold__ and _italic',
      expected: '__bold__ and _italic_',
    },
    {
      description: 'should only process last paragraph',
      input: 'Para1 _unclosed\n\nPara2 _text',
      expected: 'Para1 _unclosed\n\nPara2 _text_',
    },
    {
      description: 'should prioritize _ over * when both unclosed',
      input: '_underscore and *asterisk',
      expected: '_underscore and *asterisk*_',
    },
    {
      description: 'should ignore * inside code block',
      input: '```\nconst x = *value\n```',
      expected: '```\nconst x = *value\n```',
    },
    {
      description: 'should ignore _ inside code block',
      input: '```\nconst x = _value\n```',
      expected: '```\nconst x = _value\n```',
    },
    {
      description: 'should ignore * inside code block',
      input: '```\nconst x = *value\n```',
      expected: '```\nconst x = *value\n```',
    },
    {
      description: 'should process * outside code block',
      input: '```\ncode\n```\n\nText *italic',
      expected: '```\ncode\n```\n\nText *italic*',
    },
    {
      description: 'should ignore * inside math block',
      input: 'The formula is $$x = 1 + 2*3',
      expected: 'The formula is $$x = 1 + 2*3',
      integrationExpected: 'The formula is $$x = 1 + 2*3$$',
    },
    {
      description: 'should ignore _ inside math block',
      input: 'The formula is $$x = 1 + 2_3',
      expected: 'The formula is $$x = 1 + 2_3',
      integrationExpected: 'The formula is $$x = 1 + 2_3$$',
    },
    {
      description: 'should complete * when URL contains asterisk',
      input: 'Text *italic* and [link](https://example.com/page*value) *more',
      expected: 'Text *italic* and [link](https://example.com/page*value) *more*',
    },
    {
      description: 'should complete _ when URL contains underscore',
      input: 'Text _italic_ and [link](https://example.com/page_with_underscore) _more',
      expected: 'Text _italic_ and [link](https://example.com/page_with_underscore) _more_',
    },
    {
      description: 'should ignore _ in HTML tag url attribute',
      input: '<file id="test" name="test.txt" url="http://example.com/path_with_underscore?param=value" size="135" />',
      expected: '<file id="test" name="test.txt" url="http://example.com/path_with_underscore?param=value" size="135" />',
    },
    {
      description: 'should ignore * in HTML tag url attribute',
      input: '<file id="test" name="test.txt" url="http://example.com/path*value?param=test" size="135" />',
      expected: '<file id="test" name="test.txt" url="http://example.com/path*value?param=test" size="135" />',
    },
  ],
}

export const strongTestCases: TestCasesByCategory = {
  'strong-asterisk': [
    {
      description: 'should complete unclosed **',
      input: 'Hello **world',
      expected: 'Hello **world**',
    },
    {
      description: 'should complete ** with trailing *',
      input: 'Hello **world*',
      expected: 'Hello **world**',
    },
    {
      description: 'should not modify closed **',
      input: 'Hello **world**',
      expected: 'Hello **world**',
    },
    {
      description: 'should remove bare **',
      input: '**',
      expected: '',
    },
    {
      description: 'should remove bare *',
      input: '*',
      expected: '',
    },
    {
      description: 'should remove bare ** in paragraph',
      input: 'Hello\n\n**',
      expected: 'Hello',
    },
    {
      description: 'should only process last paragraph',
      input: 'Para1 **unclosed\n\nPara2 **text',
      expected: 'Para1 **unclosed\n\nPara2 **text**',
    },
    {
      description: 'should complete ** spanning multiple lines',
      input: 'Hello **world\nand more text',
      expected: 'Hello **world\nand more text**',
    },
    {
      description: 'should prioritize ** over __ when both unclosed',
      input: '**asterisk and __underscore',
      expected: '**asterisk and __underscore__**',
    },
    {
      description: 'should complete ** with unclosed *',
      input: '**bold and *mixed',
      expected: '**bold and *mixed***',
    },
    {
      description: 'should complete ** appropriately when there is trailing whitespace',
      input: `**Contribution\n`,
      expected: `**Contribution**\n`,
    },
  ],

  'strong-underscore': [
    {
      description: 'should complete unclosed __',
      input: 'Hello __world',
      expected: 'Hello __world__',
    },
    {
      description: 'should complete __ with trailing _',
      input: 'Hello __world_',
      expected: 'Hello __world__',
    },
    {
      description: 'should not modify closed __',
      input: 'Hello __world__',
      expected: 'Hello __world__',
    },
    {
      description: 'should remove bare __',
      input: '__',
      expected: '',
    },
    {
      description: 'should remove bare _',
      input: '_',
      expected: '',
    },
    {
      description: 'should remove bare __ in paragraph',
      input: 'Hello\n\n__',
      expected: 'Hello',
    },
    {
      description: 'should only process last paragraph',
      input: 'Para1 __unclosed\n\nPara2 __text',
      expected: 'Para1 __unclosed\n\nPara2 __text__',
    },
    {
      description: 'should complete __ spanning multiple lines',
      input: 'Hello __world\nand more text',
      expected: 'Hello __world\nand more text__',
    },
    {
      description: 'should prioritize __ over ** when both unclosed',
      input: '__underscore and **asterisk',
      expected: '__underscore and **asterisk**__',
    },
    {
      description: 'should complete __ with unclosed _',
      input: '__bold and _mixed',
      expected: '__bold and _mixed___',
    },
    {
      description: 'should ignore ** inside code block',
      input: '```\nconst x = **value\n```',
      expected: '```\nconst x = **value\n```',
    },
    {
      description: 'should ignore __ inside code block',
      input: '```\nconst x = __value\n```',
      expected: '```\nconst x = __value\n```',
    },
    {
      description: 'should ignore ** inside code block',
      input: '```\nconst x = **value\n```',
      expected: '```\nconst x = **value\n```',
    },
    {
      description: 'should process ** outside code block',
      input: '```\ncode\n```\n\nText **bold',
      expected: '```\ncode\n```\n\nText **bold**',
    },
    {
      description: 'should ignore ** inside math block',
      input: 'The formula is $$x = 1 + 2**3',
      expected: 'The formula is $$x = 1 + 2**3',
      integrationExpected: 'The formula is $$x = 1 + 2**3$$',
    },
    {
      description: 'should ignore __ inside math block',
      input: 'The formula is $$x = 1 + 2__3',
      expected: 'The formula is $$x = 1 + 2__3',
      integrationExpected: 'The formula is $$x = 1 + 2__3$$',
    },
    {
      description: 'should complete ** when URL contains underscore',
      input: 'Text **bold** and [link](https://example.com/page_with_underscore) **more',
      expected: 'Text **bold** and [link](https://example.com/page_with_underscore) **more**',
    },
    {
      description: 'should complete __ when URL contains underscore',
      input: 'Text __bold__ and [link](https://example.com/page_with_underscore) __more',
      expected: 'Text __bold__ and [link](https://example.com/page_with_underscore) __more__',
    },
  ],
}

export const linkTestCases: TestCasesByCategory = {
  link: [
    {
      description: 'should complete link with missing closing bracket',
      input: '[Google',
      expected: '[Google]()',
    },
    {
      description: 'should complete link with only text',
      input: '[Google]',
      expected: '[Google]()',
    },
    {
      description: 'should complete link with content after bracket',
      input: 'Text [ content',
      expected: 'Text [ content]()',
    },
    {
      description: 'should complete link with empty URL',
      input: '[Google](',
      expected: '[Google]()',
    },
    {
      description: 'should complete link with incomplete URL',
      input: '[Google](https://www.goo',
      expected: '[Google](https://www.goo)',
    },
    {
      description: 'should not modify closed link',
      input: '[Google](https://www.google.com)',
      expected: '[Google](https://www.google.com)',
    },
    {
      description: 'should complete link in context',
      input: 'Visit [Google',
      expected: 'Visit [Google]()',
    },
    {
      description: 'should only process last paragraph',
      input: 'Para1 [unclosed\n\nPara2 [text',
      expected: 'Para1 [unclosed\n\nPara2 [text]()',
    },
    {
      description: 'should complete incomplete link in last paragraph',
      input: '[Complete](url)\n\n[Incomplete',
      expected: '[Complete](url)\n\n[Incomplete]()',
    },
    {
      description: 'should remove trailing standalone [',
      input: 'Text [',
      expected: 'Text',
    },
    {
      description: 'should remove trailing standalone [ with whitespace',
      input: 'Text [ ',
      expected: 'Text',
    },
    {
      description: 'should remove standalone [ with newline',
      input: 'Text [\n',
      expected: 'Text',
    },
    {
      description: 'should ignore link inside code block',
      input: '```\nconst x = [Google\n```',
      expected: '```\nconst x = [Google\n```',
    },
    {
      description: 'should ignore incomplete link inside code block',
      input: '```\nconst url = [Google](https://www.goo\n```',
      expected: '```\nconst url = [Google](https://www.goo\n```',
    },
    {
      description: 'should process link outside code block',
      input: '```\ncode\n```\n\nText [Google',
      expected: '```\ncode\n```\n\nText [Google]()',
    },
    {
      description: 'should complete link with URL containing underscore',
      input: '[text](https://example.com/page_with_underscore',
      expected: '[text](https://example.com/page_with_underscore)',
    },
    {
      description: 'should complete link with URL containing asterisk',
      input: '[text](https://example.com/page*value',
      expected: '[text](https://example.com/page*value)',
    },
    {
      description: 'should complete link with URL containing tilde',
      input: '[text](https://example.com/page~value',
      expected: '[text](https://example.com/page~value)',
    },
    {
      description: 'should complete link with URL containing multiple special chars',
      input: '[text](https://example.com/page_with_underscore*and~tilde',
      expected: '[text](https://example.com/page_with_underscore*and~tilde)',
    },
  ],

  image: [
    {
      description: 'should complete image with missing closing bracket',
      input: '![alt',
      expected: '![alt]()',
    },
    {
      description: 'should complete image with only alt',
      input: '![alt]',
      expected: '![alt]()',
    },
    {
      description: 'should complete image with content after bracket',
      input: 'Text ![ content',
      expected: 'Text ![ content]()',
    },
    {
      description: 'should complete image with empty URL',
      input: '![alt](',
      expected: '![alt]()',
    },
    {
      description: 'should complete image with incomplete URL',
      input: '![mdast](https://image.png',
      expected: '![mdast](https://image.png)',
    },
    {
      description: 'should not modify closed image',
      input: '![mdast](https://raw.githubusercontent.com/logo.svg)',
      expected: '![mdast](https://raw.githubusercontent.com/logo.svg)',
    },
    {
      description: 'should complete image in context',
      input: 'Visit ![Google',
      expected: 'Visit ![Google]()',
    },
    {
      description: 'should only process last paragraph',
      input: 'Para1 ![unclosed\n\nPara2 ![text',
      expected: 'Para1 ![unclosed\n\nPara2 ![text]()',
    },
    {
      description: 'should complete incomplete image in last paragraph',
      input: '![Complete](url)\n\n![Incomplete',
      expected: '![Complete](url)\n\n![Incomplete]()',
    },
    {
      description: 'should remove trailing standalone ![',
      input: 'Text ![',
      expected: 'Text',
    },
    {
      description: 'should remove trailing standalone ![ with whitespace',
      input: 'Text ![ ',
      expected: 'Text',
    },
    {
      description: 'should remove standalone ![ with newline',
      input: 'Text ![\n',
      expected: 'Text',
    },
    {
      description: 'should complete image with empty alt and incomplete URL',
      input: '![](',
      expected: '![]()',
    },
    {
      description: 'should complete image with empty alt',
      input: '![]',
      expected: '![]()',
    },
    {
      description: 'should complete image with empty alt in context',
      input: 'Text ![](',
      expected: 'Text ![]()',
    },
    {
      description: 'should complete image with empty alt in context',
      input: 'Text ![]',
      expected: 'Text ![]()',
    },
    {
      description: 'should not modify closed image with empty alt',
      input: '![]()',
      expected: '![]()',
    },
    {
      description: 'should ignore image inside code block',
      input: '```\nconst img = ![alt\n```',
      expected: '```\nconst img = ![alt\n```',
    },
    {
      description: 'should ignore incomplete image inside code block',
      input: '```\nconst img = ![mdast](https://image.png\n```',
      expected: '```\nconst img = ![mdast](https://image.png\n```',
    },
    {
      description: 'should process image outside code block',
      input: '```\ncode\n```\n\nText ![alt',
      expected: '```\ncode\n```\n\nText ![alt]()',
    },
    {
      description: 'should complete image with URL containing underscore',
      input: '![alt](https://example.com/image_with_underscore',
      expected: '![alt](https://example.com/image_with_underscore)',
    },
    {
      description: 'should complete image with URL containing asterisk',
      input: '![alt](https://example.com/image*value',
      expected: '![alt](https://example.com/image*value)',
    },
    {
      description: 'should complete image with URL containing tilde',
      input: '![alt](https://example.com/image~value',
      expected: '![alt](https://example.com/image~value)',
    },
  ],
}

export const inlineMathTestCases: TestCasesByCategory = {
  'inline-math': [
    {
      description: 'should complete unclosed $$',
      input: 'The formula is $$x = 1',
      expected: 'The formula is $$x = 1$$',
    },
    {
      description: 'should complete $$ with trailing $',
      input: 'The formula is $$x = 1$',
      expected: 'The formula is $$x = 1$$',
    },
    {
      description: 'should not modify closed $$',
      input: 'The formula is $$x = 1$$',
      expected: 'The formula is $$x = 1$$',
    },
    {
      description: 'should remove bare $$',
      input: '$$',
      expected: '',
    },
    {
      description: 'should remove bare $',
      input: '$',
      expected: '',
    },
    {
      description: 'should remove trailing $$',
      input: 'Text $$',
      expected: 'Text',
    },
    {
      description: 'should remove bare $$ in paragraph',
      input: 'Hello\n\n$$',
      expected: 'Hello',
    },
    {
      description: 'should only process last paragraph',
      input: 'Para1 $$x$$\n\nPara2 $$y',
      expected: 'Para1 $$x$$\n\nPara2 $$y$$',
    },
    {
      description: 'should not process $$ spanning multiple lines',
      input: 'Hello $$world\nand more text',
      expected: 'Hello $$world\nand more text',
    },
    {
      description: 'should complete $$ ending with single $',
      input: '$$\\int u \\, dv = uv - \\int v \\, du$',
      expected: '$$\\int u \\, dv = uv - \\int v \\, du$$',
    },
    {
      description: 'should complete $$ with trailing $ in multi-paragraph',
      input: 'Para1 $$x$$\n\nPara2 $$y = 1$',
      expected: 'Para1 $$x$$\n\nPara2 $$y = 1$$',
    },
    {
      description: 'should ignore $$ in inline code',
      input: 'Text `$$` and $$x = 1',
      expected: 'Text `$$` and $$x = 1$$',
    },
    {
      description: 'should ignore $$ in code blocks',
      input: '```\n$$x = 1\n```',
      expected: '```\n$$x = 1\n```',
    },
    {
      description: 'should ignore $$ in inline code',
      input: 'Wrap inline mathematical expressions with `$$`:',
      expected: 'Wrap inline mathematical expressions with `$$`:',
    },
    {
      description: 'should complete $$ with LaTeX underscores in subscripts',
      input: 'The sum of the first $$n$$ natural numbers: $$\\sum_{i=1}^{n} i = \\frac{n(',
      expected: 'The sum of the first $$n$$ natural numbers: $$\\sum_{i=1}^{n} i = \\frac{n($$',
    },
    {
      description: 'should complete $$ with LaTeX underscores and superscripts',
      input: 'Formula: $$x_{i}^{2} + y_{j}',
      expected: 'Formula: $$x_{i}^{2} + y_{j}$$',
    },
    {
      description: 'should complete $$ with complex LaTeX expression',
      input: 'Equation: $$\\int_{a}^{b} f(x) \\, dx = F(b) - F(a',
      expected: 'Equation: $$\\int_{a}^{b} f(x) \\, dx = F(b) - F(a$$',
    },
    {
      description: 'should not treat currency single dollar as math (inline) and still complete strong',
      input: 'The premium plan costs $7,000 and includes **priority support',
      expected: 'The premium plan costs $7,000 and includes **priority support',
      integrationExpected: 'The premium plan costs $7,000 and includes **priority support**',
    },
  ],
}

export const mathTestCases: TestCasesByCategory = {
  math: [
    {
      description: 'should complete unclosed block math',
      input: '$$\nE = mc^2',
      expected: '$$\nE = mc^2\n$$',
    },
    {
      description: 'should complete block math with multiple lines',
      input: '$$\nE = mc^2\nx = 1',
      expected: '$$\nE = mc^2\nx = 1\n$$',
    },
    {
      description: 'should not modify closed block math',
      input: '$$\nE = mc^2\n$$',
      expected: '$$\nE = mc^2\n$$',
    },
    {
      description: 'should complete block math spanning multiple paragraphs',
      input: '$$\nE = mc^2\n\nx = 1',
      expected: '$$\nE = mc^2\n\nx = 1\n$$',
    },
    {
      description: 'should remove bare $$ on separate line',
      input: '$$\n',
      expected: '',
    },
    {
      description: 'should remove bare $$ without newline',
      input: '$$',
      expected: '',
    },
    {
      description: 'should complete block math without trailing newline',
      input: '$$\nE = mc^2',
      expected: '$$\nE = mc^2\n$$',
    },
    {
      description: 'should complete block math with trailing newline',
      input: '$$\nE = mc^2\n',
      expected: '$$\nE = mc^2\n$$',
    },
    {
      description: 'should ignore $$ in code blocks',
      input: '```\n$$\nE = mc^2\n```',
      expected: '```\n$$\nE = mc^2\n```',
    },
    {
      description: 'should ignore $$ in inline code',
      input: 'Text `$$` and more',
      expected: 'Text `$$` and more',
    },
    {
      description: 'should handle multiple block math blocks',
      input: '$$\nE = mc^2\n$$\n\n$$\nx = 1',
      expected: '$$\nE = mc^2\n$$\n\n$$\nx = 1\n$$',
    },
    {
      description: 'should not process inline math ($$ on same line)',
      input: 'The formula is $$x = 1$$',
      expected: 'The formula is $$x = 1$$',
    },
    {
      description: 'should handle block math with whitespace',
      input: '  $$\n  E = mc^2',
      expected: '  $$\n  E = mc^2\n$$',
    },
    {
      description: 'should complete block math after other content',
      input: 'Some text\n\n$$\nE = mc^2',
      expected: 'Some text\n\n$$\nE = mc^2\n$$',
    },
    {
      description: 'should not treat currency single dollar as math (block) and still complete strong',
      input: '### Pricing\n\nThe premium plan costs $7,000 and includes **priority support',
      expected: '### Pricing\n\nThe premium plan costs $7,000 and includes **priority support',
      integrationExpected: '### Pricing\n\nThe premium plan costs $7,000 and includes **priority support**',
    },
    {
      description: 'should treat single dollar as math when singleDollarTextMath is enabled and ignore ** inside math',
      input: 'The formula $x = 1 + 2**3$ has **bold',
      expected: 'The formula $x = 1 + 2**3$ has **bold**',
      integrationExpected: 'The formula $x = 1 + 2**3$ has **bold**',
      preprocessOptions: { singleDollarTextMath: true },
    },
  ],
}

export const tableTestCases: TestCasesByCategory = {
  table: [
    {
      description: 'should add separator after header without newline',
      input: '| Column A | Column B | Column C |',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should add separator after header with newline',
      input: '| Column A | Column B | Column C |\n',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should complete header with single pipe',
      input: '| A',
      expected: '| A |\n| --- |',
    },
    {
      description: 'should complete header starting with pipe',
      input: '| A | B',
      expected: '| A | B |\n| --- | --- |',
    },
    {
      description: 'should add separator when no next line',
      input: '| A | B | C |',
      expected: '| A | B | C |\n| --- | --- | --- |',
    },
    {
      description: 'should complete incomplete separator',
      input: '| A | B | C |\n|',
      expected: '| A | B | C |\n| --- | --- | --- |\n|',
    },
    {
      description: 'should add separator for header not at start',
      input: 'Text\n| A | B | C |\n',
      expected: 'Text\n| A | B | C |\n| --- | --- | --- |',
    },
    {
      description: 'should complete partial separator',
      input: '| Column A | Column B | Column C |\n| --- |',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should replace incomplete separator',
      input: '| Column A | Column B | Column C |\n|----|----|',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should not modify closed table',
      input: '| Column A | Column B | Column C |\n| --- | --- | --- |\n| A1 | B1 | C1 |',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |\n| A1 | B1 | C1 |',
    },
    {
      description: 'should complete header without trailing newline',
      input: '| Column A | Column B | Column C',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should complete header missing closing pipe',
      input: '| Column A | Column B | Column C\n',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should ignore table inside code block',
      input: '```\n| Column A | Column B | Column C |\n```',
      expected: '```\n| Column A | Column B | Column C |\n```',
    },
    {
      description: 'should process table outside code block',
      input: '```\ncode\n```\n\n| Column A | Column B |',
      expected: '```\ncode\n```\n\n| Column A | Column B |\n| --- | --- |',
    },
    {
      description: 'should ignore table in code block with other content',
      input: '```js\nconst table = "| A | B |"\n| Column A | Column B |\n```',
      expected: '```js\nconst table = "| A | B |"\n| Column A | Column B |\n```',
    },
  ],
}

export const taskListTestCases: TestCasesByCategory = {
  'task-list': [
    {
      description: 'should remove trailing standalone dash',
      input: '- [ ] Task 1\n-',
      expected: '- [ ] Task 1',
    },
    {
      description: 'should keep task list with uppercase X',
      input: '- [X] Task 1\n-',
      expected: '- [X] Task 1',
    },
    {
      description: 'should remove standalone dash after multiple items',
      input: '- [ ] Task 1\n- [x] Task 2\n-',
      expected: '- [ ] Task 1\n- [x] Task 2',
    },
    {
      description: 'should not modify valid task list',
      input: '- [ ] Task 1\n- [x] Task 2',
      expected: '- [ ] Task 1\n- [x] Task 2',
    },
    {
      description: 'should remove standalone dash',
      input: '-',
      expected: '',
    },
    {
      description: 'should remove incomplete task list',
      input: '- [',
      expected: '',
    },
    {
      description: 'should remove regular list item dash',
      input: '- [ ] Task 1\n- ',
      expected: '- [ ] Task 1',
    },
    {
      description: 'should remove incomplete task list with bracket',
      input: '- [ ] Task 1\n- [',
      expected: '- [ ] Task 1',
    },
    {
      description: 'should remove incomplete task list in quote',
      input: '> - [',
      expected: '',
    },
    {
      description: 'should remove standalone dash in quote',
      input: '> -',
      expected: '',
    },
    {
      description: 'should ignore - inside code block',
      input: '```\n- task item\n```',
      expected: '```\n- task item\n```',
    },
    {
      description: 'should ignore - inside code block',
      input: '```\n- task item\n```',
      expected: '```\n- task item\n```',
    },
    {
      description: 'should process - outside code block',
      input: '```\ncode\n```\n\n- [ ] Task',
      expected: '```\ncode\n```\n\n- [ ] Task',
    },
    {
      description: 'should remove standalone - outside code block',
      input: '```\ncode\n```\n\n-',
      expected: '```\ncode\n```\n',
    },
  ],
}

export const footnoteTestCases: TestCasesByCategory = {
  footnote: [
    {
      description: 'should remove reference without definition',
      input: 'Text [^1]',
      expected: 'Text',
    },
    {
      description: 'should keep reference with definition',
      input: 'Text [^1]\n\n[^1]: Definition',
      expected: 'Text [^1]\n\n[^1]: Definition',
    },
    {
      description: 'should remove multiple references without definitions',
      input: 'Text [^1] and [^2]',
      expected: 'Text and',
    },
    {
      description: 'should remove only references without definitions',
      input: 'Text [^1] and [^2]\n\n[^1]: First',
      expected: 'Text [^1] and\n\n[^1]: First',
    },
    {
      description: 'should remove references from end to start',
      input: 'Text [^1] and [^2] and [^3]\n\n[^2]: Second',
      expected: 'Text and [^2] and\n\n[^2]: Second',
    },
    {
      description: 'should remove incomplete reference',
      input: 'Text [^1',
      expected: 'Text',
    },
    {
      description: 'should remove incomplete reference missing bracket',
      input: '"Knowledge is power—but digital knowledge is acceleration."[^1',
      expected: '"Knowledge is power—but digital knowledge is acceleration."',
    },
    {
      description: 'should remove incomplete reference in quote',
      input: '> "Knowledge is power—but digital knowledge is acceleration."[^1',
      expected: '> "Knowledge is power—but digital knowledge is acceleration."',
    },
    {
      description: 'should remove incomplete reference in last paragraph',
      input: 'Para1\n\nText [^1',
      expected: 'Para1\n\nText',
    },
    {
      description: 'should remove incomplete reference to end of line',
      input: 'Text [^1\nMore text',
      expected: 'Text\nMore text',
    },
    {
      description: 'should remove reference spanning multiple lines',
      input: 'Text [^1]\nand more text',
      expected: 'Text\nand more text',
    },
    {
      description: 'should handle mixed references in multiple paragraphs',
      input: 'Para1 [^1]\n\nPara2 [^2]\n\n[^1]: First',
      expected: 'Para1 [^1]\n\nPara2\n\n[^1]: First',
    },
    {
      description: 'should ignore references in code blocks',
      input: '```\n[^1]\n```\n\nText [^1]',
      expected: '```\n[^1]\n```\n\nText',
    },
    {
      description: 'should ignore references in inline code',
      input: 'Text `[^1]` and [^1]',
      expected: 'Text `[^1]` and',
    },
    {
      description: 'should skip references in code blocks when finding',
      input: '```\n[^1]\n```\n\nText [^1]',
      expected: '```\n[^1]\n```\n\nText',
    },
    {
      description: 'should skip references in inline code when finding',
      input: 'Text `[^1]` and [^1]',
      expected: 'Text `[^1]` and',
    },
    {
      description: 'should ignore footnote-like text in code blocks',
      input: '```\n[^1]: This is not a real definition\n```\n\nText [^1]',
      expected: '```\n[^1]: This is not a real definition\n```\n\nText',
    },
    {
      description: 'should handle nested code blocks',
      input: '```\n```\n[^1]\n```\n```\n\nText [^1]',
      expected: '```\n```\n\n```\n```\n\nText',
    },
    {
      description: 'should recalculate code blocks after removing reference',
      input: '```\ncode\n```\n\nText [^1',
      expected: '```\ncode\n```\n\nText',
    },
    {
      description: 'should recalculate inline code after removing reference',
      input: 'Text `code` and [^1',
      expected: 'Text `code` and',
    },
  ],
}

export const testCasesByCategory: TestCasesByCategory = {
  ...codeTestCases,
  ...deleteTestCases,
  ...emphasisTestCases,
  ...strongTestCases,
  ...linkTestCases,
  ...inlineMathTestCases,
  ...mathTestCases,
  ...tableTestCases,
  ...taskListTestCases,
  ...footnoteTestCases,
}

export function getTestCases(): TestCase[] {
  return Object.values(testCasesByCategory).flat()
}

export function getTestCasesByCategory(category: string): TestCase[] {
  return testCasesByCategory[category] || []
}

export function getTestCaseCategories(): string[] {
  return Object.keys(testCasesByCategory)
}

export function getTestCasesByCategories(categories: string[]): TestCase[] {
  return categories.flatMap(category => getTestCasesByCategory(category))
}
