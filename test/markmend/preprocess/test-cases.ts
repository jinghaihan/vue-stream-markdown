export interface TestCase {
  description: string
  input: string
  expected: string
  integrationExpected?: string
  preprocessOptions?: {
    hideBareFormattingMarkers?: boolean
    singleDollarTextMath?: boolean
  }
}

export type TestCasesByCategory = Record<string, TestCase[]>

const preserveBareFormattingMarkers = { hideBareFormattingMarkers: false } as const

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
    {
      description: 'should remove trailing fences longer than triple backticks',
      input: 'Text ````',
      expected: 'Text',
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
      description: 'should hide bare ~ by default',
      input: '~',
      expected: '',
    },
    {
      description: 'should preserve bare ~ when configured',
      input: '~',
      expected: '~',
      preprocessOptions: preserveBareFormattingMarkers,
    },
    {
      description: 'should hide bare ~~ by default',
      input: '~~',
      expected: '',
    },
    {
      description: 'should preserve bare ~~ when configured',
      input: '~~',
      expected: '~~',
      preprocessOptions: preserveBareFormattingMarkers,
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
      description: 'should preserve trailing ~ after closed ~~',
      input: '~~complete~~ text~',
      expected: '~~complete~~ text~',
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
    {
      description: 'should not process ~~ inside unclosed code block',
      input: '```js\nconst x = ~~value',
      expected: '```js\nconst x = ~~value',
      integrationExpected: '```js\nconst x = ~~value\n```',
    },
    {
      description: 'should skip ~~ inside inline code fence in paragraph',
      input: 'Text ```~~inside~~``` and ~~outside',
      expected: 'Text ```~~inside~~``` and ~~outside~~',
    },
    {
      description: 'should handle toggled code fences in paragraph',
      input: '```a``` text ```b ~~``` more ~~strike',
      expected: '```a``` text ```b ~~``` more ~~strike~~',
    },
    {
      description: 'should not modify when ~~ only in URL',
      input: 'Check [link](http://a.com/~~path~~)',
      expected: 'Check [link](http://a.com/~~path~~)',
    },
    {
      description: 'should ignore ~~ in HTML attributes',
      input: '<span title="~~tip~~">~~text',
      expected: '<span title="~~tip~~">~~text~~',
    },
    {
      description: 'should handle ~~ in third paragraph',
      input: 'P1\n\nP2\n\nP3 ~~text',
      expected: 'P1\n\nP2\n\nP3 ~~text~~',
    },
    {
      description: 'should not complete ~~ when paragraph starts with closing fence',
      input: '```js\nconst x = 1\n\n```\nText ~~strike',
      expected: '```js\nconst x = 1\n\n```\nText ~~strike',
    },
  ],
}

export const emphasisTestCases: TestCasesByCategory = {
  'emphasis-asterisk': [
    {
      description: 'should hide bare * by default',
      input: '*',
      expected: '',
    },
    {
      description: 'should preserve bare * when configured',
      input: '*',
      expected: '*',
      preprocessOptions: preserveBareFormattingMarkers,
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
      description: 'should hide bare * in paragraph by default',
      input: 'Hello\n\n*',
      expected: 'Hello',
    },
    {
      description: 'should preserve bare * in paragraph when configured',
      input: 'Hello\n\n*',
      expected: 'Hello\n\n*',
      preprocessOptions: preserveBareFormattingMarkers,
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
    {
      description: 'should keep emphasis untouched in unclosed code block',
      input: '```js\n*italic',
      expected: '```js\n*italic',
      integrationExpected: '```js\n*italic\n```',
    },
    {
      description: 'should skip ** pairs while searching unclosed *',
      input: '*open and **closed**',
      expected: '*open and **closed***',
    },
    {
      description: 'should cleanup standalone dash after removing dangling *',
      input: 'a\n- *',
      expected: 'a\n',
    },
    {
      description: 'should preserve formatting-only list item when configured',
      input: 'a\n- *',
      expected: 'a\n- *',
      preprocessOptions: preserveBareFormattingMarkers,
    },
  ],

  'emphasis-underscore': [
    {
      description: 'should hide bare _ by default',
      input: '_',
      expected: '',
    },
    {
      description: 'should preserve bare _ when configured',
      input: '_',
      expected: '_',
      preprocessOptions: preserveBareFormattingMarkers,
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
      description: 'should hide bare _ in paragraph by default',
      input: 'Hello\n\n_',
      expected: 'Hello',
    },
    {
      description: 'should preserve bare _ in paragraph when configured',
      input: 'Hello\n\n_',
      expected: 'Hello\n\n_',
      preprocessOptions: preserveBareFormattingMarkers,
    },
    {
      description: 'should ignore __ when counting _',
      input: '__bold__ and _italic',
      expected: '__bold__ and _italic_',
    },
    {
      description: 'should not complete an underscore inside a word',
      input: 'a_b',
      expected: 'a_b',
    },
    {
      description: 'should not complete an escaped underscore',
      input: 'a\\_b',
      expected: 'a\\_b',
    },
    {
      description: 'should ignore _ inside inline code',
      input: '`a_b`',
      expected: '`a_b`',
    },
    {
      description: 'should still complete _ outside inline code',
      input: '`a_b` and _italic',
      expected: '`a_b` and _italic_',
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
    {
      description: 'should skip __ pairs while searching unclosed _',
      input: '_open and __closed__',
      expected: '_open and __closed___',
    },
    {
      description: 'should cleanup standalone dash after removing dangling _',
      input: 'a\n- _',
      expected: 'a\n',
    },
    {
      description: 'should keep underscore emphasis untouched in unclosed code block',
      input: '```js\n_italic',
      expected: '```js\n_italic',
      integrationExpected: '```js\n_italic\n```',
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
      description: 'should hide bare ** by default',
      input: '**',
      expected: '',
    },
    {
      description: 'should preserve bare ** when configured',
      input: '**',
      expected: '**',
      preprocessOptions: preserveBareFormattingMarkers,
    },
    {
      description: 'should preserve bare * when configured',
      input: '*',
      expected: '*',
      preprocessOptions: preserveBareFormattingMarkers,
    },
    {
      description: 'should hide bare ** in paragraph by default',
      input: 'Hello\n\n**',
      expected: 'Hello',
    },
    {
      description: 'should preserve bare ** in paragraph when configured',
      input: 'Hello\n\n**',
      expected: 'Hello\n\n**',
      preprocessOptions: preserveBareFormattingMarkers,
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
      description: 'should keep strong untouched in unclosed code block',
      input: '```js\n**bold',
      expected: '```js\n**bold',
      integrationExpected: '```js\n**bold\n```',
    },
    {
      description: 'should skip ** inside inline fenced segment and complete outside',
      input: 'Text ```ignore **inside``` and **open',
      expected: 'Text ```ignore **inside``` and **open**',
    },
    {
      description: 'should not complete when last ** is inside URL',
      input: '**out [x](http://a/**b)',
      expected: '**out [x](http://a/**b)',
    },
    {
      description: 'should preserve thematic break ***',
      input: '***',
      expected: '***',
    },
    {
      description: 'should cleanup standalone dash after removing dangling **',
      input: 'a\n- **',
      expected: 'a\n',
    },
    {
      description: 'should fallback to single * after dropping trailing single *',
      input: '** *',
      expected: '*',
      integrationExpected: '',
    },
    {
      description: 'should preserve formatting-only asterisk fragment when configured',
      input: '** *',
      expected: '** *',
      preprocessOptions: preserveBareFormattingMarkers,
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
      description: 'should not complete __ inside a word',
      input: 'a__b',
      expected: 'a__b',
    },
    {
      description: 'should not complete escaped __',
      input: 'a\\__b',
      expected: 'a\\__b',
    },
    {
      description: 'should complete __ with trailing _',
      input: 'Hello __world_',
      expected: 'Hello __world__',
    },
    {
      description: 'should ignore __ inside inline code',
      input: '`a__b`',
      expected: '`a__b`',
    },
    {
      description: 'should still complete __ outside inline code',
      input: '`a__b` and __bold',
      expected: '`a__b` and __bold__',
    },
    {
      description: 'should not modify closed __',
      input: 'Hello __world__',
      expected: 'Hello __world__',
    },
    {
      description: 'should hide bare __ by default',
      input: '__',
      expected: '',
    },
    {
      description: 'should preserve bare __ when configured',
      input: '__',
      expected: '__',
      preprocessOptions: preserveBareFormattingMarkers,
    },
    {
      description: 'should preserve bare _ when configured',
      input: '_',
      expected: '_',
      preprocessOptions: preserveBareFormattingMarkers,
    },
    {
      description: 'should hide bare __ in paragraph by default',
      input: 'Hello\n\n__',
      expected: 'Hello',
    },
    {
      description: 'should preserve bare __ in paragraph when configured',
      input: 'Hello\n\n__',
      expected: 'Hello\n\n__',
      preprocessOptions: preserveBareFormattingMarkers,
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
      description: 'should skip __ inside inline fenced segment and complete outside',
      input: 'Text ```ignore __inside``` and __open',
      expected: 'Text ```ignore __inside``` and __open__',
    },
    {
      description: 'should not complete when last __ is inside URL',
      input: '__out [x](http://a/__b)',
      expected: '__out [x](http://a/__b)',
    },
    {
      description: 'should preserve thematic break ___',
      input: '___',
      expected: '___',
    },
    {
      description: 'should cleanup standalone dash after removing dangling __',
      input: 'a\n- __',
      expected: 'a\n',
    },
    {
      description: 'should remove __ after dropping trailing single _ with no remaining content',
      input: '__ _',
      expected: '',
    },
    {
      description: 'should preserve formatting-only underscore fragment when configured',
      input: '__ _',
      expected: '__ _',
      preprocessOptions: preserveBareFormattingMarkers,
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
    {
      description: 'should keep link untouched in unclosed code block',
      input: '```js\n[Google',
      expected: '```js\n[Google',
      integrationExpected: '```js\n[Google\n```',
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
    {
      description: 'should keep inline math untouched in unclosed code block',
      input: '```js\n$$x = 1',
      expected: '```js\n$$x = 1',
      integrationExpected: '```js\n$$x = 1\n```',
    },
    {
      description: 'should keep $$$ unchanged',
      input: '$$$',
      expected: '$$$',
    },
    {
      description: 'should keep $$ unchanged when inside unmatched inline code',
      input: '`$$x',
      expected: '`$$x',
      integrationExpected: '`$$x`',
    },
    {
      description: 'should handle inline fenced segments when finding last $$',
      input: '```ignore $$``` and $$x = 1',
      expected: '```ignore $$``` and $$x = 1$$',
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
    {
      description: 'should keep block math untouched in unclosed code block',
      input: '```js\n$$\nx = 1',
      expected: '```js\n$$\nx = 1',
      integrationExpected: '```js\n$$\nx = 1\n```',
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
    {
      description: 'should keep table untouched in unclosed code block',
      input: '```md\n| A | B |',
      expected: '```md\n| A | B |',
      integrationExpected: '```md\n| A | B |\n```',
    },
    {
      description: 'should complete header when next line is valid separator',
      input: '| A | B\n| --- | --- |',
      expected: '| A | B |\n| --- | --- |',
    },
    {
      description: 'should replace incomplete separator and keep following rows',
      input: '| A | B |\n| - |\n| 1 | 2 |',
      expected: '| A | B |\n| --- | --- |\n| 1 | 2 |',
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
      description: 'should preserve standalone dash',
      input: '-',
      expected: '-',
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
    {
      description: 'should keep task list markers untouched in unclosed code block',
      input: '```js\n- [',
      expected: '```js\n- [',
      integrationExpected: '```js\n- [\n```',
    },
    {
      description: 'should keep content when last line is empty',
      input: '- [ ] Task 1\n',
      expected: '- [ ] Task 1\n',
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
    {
      description: 'should keep footnote text untouched in unclosed code block',
      input: '```md\nText [^1]',
      expected: '```md\nText [^1]',
      integrationExpected: '```md\nText [^1]\n```',
    },
  ],
}

export const htmlTestCases: TestCasesByCategory = {
  html: [
    {
      description: 'should remove trailing unclosed opening tag',
      input: '<div',
      expected: '',
    },
    {
      description: 'should preserve trailing bare <',
      input: 'Hello <',
      expected: 'Hello <',
    },
    {
      description: 'should remove trailing unclosed opening tag with attributes',
      input: 'Hello <custom-card name="demo"',
      expected: 'Hello',
    },
    {
      description: 'should remove trailing unclosed closing tag',
      input: 'Hello </custom-card',
      expected: 'Hello',
    },
    {
      description: 'should preserve complete html tags',
      input: '<div>ok</div>',
      expected: '<div>ok</div>',
    },
    {
      description: 'should not treat math-like text as html',
      input: '1 < 2',
      expected: '1 < 2',
    },
    {
      description: 'should not modify html-like text in inline code',
      input: 'Use `<div` as literal text',
      expected: 'Use `<div` as literal text',
    },
    {
      description: 'should not modify html-like text in closed code blocks',
      input: '```html\n<div\n```',
      expected: '```html\n<div\n```',
    },
    {
      description: 'should not modify html-like text in unclosed code blocks',
      input: '```html\n<div',
      expected: '```html\n<div',
      integrationExpected: '```html\n<div\n```',
    },
  ],
}

function keepStreamingCase(
  description: string,
  input: string,
  preprocessOptions?: TestCase['preprocessOptions'],
): TestCase {
  return {
    description,
    expected: input,
    input,
    preprocessOptions,
  }
}

function completeStreamingCase(
  description: string,
  input: string,
  expected: string,
  preprocessOptions?: TestCase['preprocessOptions'],
): TestCase {
  return {
    description,
    expected,
    input,
    preprocessOptions,
  }
}

export const streamingDelimiterSafetyCases: TestCase[] = [
  keepStreamingCase('empty input', ''),
  keepStreamingCase('plain prose', 'This is plain text without any markdown'),
  keepStreamingCase('escaped asterisk', 'just a \\* star'),
  completeStreamingCase('escaped asterisk before incomplete italic', '\\*escaped and *italic', '\\*escaped and *italic*'),
  keepStreamingCase('escaped underscore', 'Text with \\_escaped underscore'),
  keepStreamingCase('escaped tilde', 'Text with \\~literal tilde'),
  keepStreamingCase('escaped backtick', 'literal \\` backtick'),
  keepStreamingCase('asterisk list marker', '* item'),
  keepStreamingCase('asterisk list marker with nested bold', '*   **Preheat:** Set  '),
  keepStreamingCase('asterisk surrounded by spaces', 'a * b'),
  keepStreamingCase('double asterisk surrounded by spaces', 'a ** b'),
  keepStreamingCase('underscore surrounded by spaces', 'a _ b'),
  keepStreamingCase('tilde surrounded by spaces', 'a ~ b'),
  keepStreamingCase('intraword asterisk between words', 'hello*world'),
  keepStreamingCase('intraword asterisk between digits', '234234*123'),
  keepStreamingCase('intraword asterisk between letters and digits', 'abc*123'),
  keepStreamingCase('intraword asterisk between digits and letters', '123*abc'),
  keepStreamingCase('intraword asterisk between Unicode letters', '中文*测试'),
  keepStreamingCase('paired intraword asterisks', 'test*123*test'),
  keepStreamingCase('emphasis followed by an intraword suffix', '*foo*bar'),
  keepStreamingCase('emphasis inside a word', 'this is *real*ly good'),
  keepStreamingCase('numeric emphasis-shaped expression', '5*6*78'),
  keepStreamingCase('trailing asterisk after intraword emphasis', '*foo*bar*'),
  keepStreamingCase('trailing asterisk after inline emphasis', 'a *b*c*'),
  keepStreamingCase('trailing asterisk after closed emphasis and space', '*a* b*'),
  keepStreamingCase('trailing asterisk after sentence emphasis', 'a *b* c*'),
  keepStreamingCase('multiple intraword emphasis runs', '*a*b*c*d'),
  keepStreamingCase('Korean suffix after emphasis', '이것은 *기울임*으로 표시'),
  keepStreamingCase('snake case identifier', 'hello_world'),
  keepStreamingCase('multiple snake case separators', 'hello_world_test'),
  keepStreamingCase('constant case identifier', 'MAX_VALUE'),
  keepStreamingCase('multiple identifiers in prose', 'The user_name and user_email are required'),
  keepStreamingCase('numeric separators', 'The value is 1_000_000'),
  keepStreamingCase('underscore in URL path', 'Visit https://example.com/path_with_underscore'),
  keepStreamingCase('unicode word with underscore', 'café_price'),
  keepStreamingCase('multiple unicode words with underscore', 'naïve_approach'),
  keepStreamingCase('intraword underscore between Unicode letters', '中文_测试'),
  keepStreamingCase('word ending in underscore', 'word_'),
  keepStreamingCase('intraword underscore followed by trailing underscore', 'foo_bar_'),
  keepStreamingCase('trailing underscore after completed strong', 'a __b__ c_'),
  keepStreamingCase('complete underscore emphasis beside identifier', '_complete italic_ and some_other_text'),
  keepStreamingCase('dunder identifiers', '__init__ and __main__ are special'),
  keepStreamingCase('single tilde at start', '~hello'),
  keepStreamingCase('single tilde at end', 'hello~'),
  keepStreamingCase('single tilde surrounded by spaces', 'hello ~ world'),
  keepStreamingCase('complete single-tilde deletion', '~hello~'),
  keepStreamingCase('complete single-tilde deletion after prose', 'hello ~world~'),
  keepStreamingCase('single tilde between numbers', '20~25°C'),
  keepStreamingCase('multiple numeric single tildes', '20~25°C。20~25°C'),
  keepStreamingCase('single tilde between ASCII letters', 'foo~bar'),
  keepStreamingCase('multiple intraword single tildes', 'foo~bar~baz'),
  keepStreamingCase('single tilde between Japanese characters', '日本~語'),
  keepStreamingCase('single tilde between Greek characters', 'α~β'),
  keepStreamingCase('single tilde beside accented letter', 'é~x'),
  keepStreamingCase('single tilde beside supplementary Unicode letter', '𐐀~a'),
  keepStreamingCase('complete double-tilde deletion', '~~strikethrough~~'),
  keepStreamingCase('bare single asterisk', '*', preserveBareFormattingMarkers),
  keepStreamingCase('bare double asterisk', '**', preserveBareFormattingMarkers),
  keepStreamingCase('bare triple asterisk', '***'),
  keepStreamingCase('bare single underscore', '_', preserveBareFormattingMarkers),
  keepStreamingCase('bare double underscore', '__', preserveBareFormattingMarkers),
  keepStreamingCase('bare triple underscore', '___'),
  keepStreamingCase('bare single tilde', '~', preserveBareFormattingMarkers),
  keepStreamingCase('bare double tilde', '~~', preserveBareFormattingMarkers),
  keepStreamingCase('hyphen thematic break', '---'),
  keepStreamingCase('long hyphen thematic break', '-----'),
  keepStreamingCase('asterisk thematic break', '****'),
  keepStreamingCase('long asterisk thematic break', '*****'),
  keepStreamingCase('underscore thematic break', '____'),
  keepStreamingCase('long underscore thematic break', '_____'),
  keepStreamingCase('spaced hyphen thematic break', '- - -'),
  keepStreamingCase('spaced asterisk thematic break', '* * *'),
  keepStreamingCase('spaced underscore thematic break', '_ _ _'),
  keepStreamingCase('indented thematic break', '   ---'),
  keepStreamingCase('thematic break between paragraphs', 'Text before\n***\nText after'),
  keepStreamingCase('underscore thematic break between paragraphs', 'Text before\n___\nText after'),
  keepStreamingCase('currency is not default inline math', 'price $20'),
  keepStreamingCase('currency range is not default inline math', 'Costs $20 to $30'),
]

export const streamingInlineCompletionCases: TestCase[] = [
  completeStreamingCase('incomplete bold', 'Text with **bold', 'Text with **bold**'),
  completeStreamingCase('incomplete bold at start', '**incomplete', '**incomplete**'),
  completeStreamingCase('second incomplete bold run', '**first** and **second', '**first** and **second**'),
  completeStreamingCase('half bold closer', '**bold text*', '**bold text**'),
  completeStreamingCase('half bold closer in prose', 'This is **bold text*', 'This is **bold text**'),
  keepStreamingCase('complete bold', 'Text with **bold text**'),
  keepStreamingCase('multiple complete bold runs', '**bold1** and **bold2**'),
  completeStreamingCase('incomplete bold italic', 'Text with ***bold-italic', 'Text with ***bold-italic***'),
  completeStreamingCase('incomplete bold italic at start', '***incomplete', '***incomplete***'),
  completeStreamingCase('second incomplete bold italic run', '***first*** and ***second', '***first*** and ***second***'),
  completeStreamingCase('partial bold italic closer with one marker', '***italic and bold*', '***italic and bold***'),
  completeStreamingCase('partial bold italic closer with two markers', '***italic and bold**', '***italic and bold***'),
  keepStreamingCase('complete bold italic', 'Text with ***bold and italic text***'),
  keepStreamingCase('overlapping bold and italic closers', 'Combined **bold and *italic*** text'),
  keepStreamingCase('overlapping bold and italic closers in list', '- Combined **bold and *italic*** text'),
  completeStreamingCase('incomplete asterisk emphasis', 'Text with *italic', 'Text with *italic*'),
  completeStreamingCase('incomplete asterisk emphasis at start', '*incomplete', '*incomplete*'),
  completeStreamingCase('incomplete asterisk after complete bold', '**bold** and *italic', '**bold** and *italic*'),
  completeStreamingCase('escaped asterisks inside incomplete emphasis', '*start \\* middle \\* end', '*start \\* middle \\* end*'),
  keepStreamingCase('complete asterisk emphasis', 'Text with *italic text*'),
  completeStreamingCase('incomplete underscore emphasis', 'Text with _italic', 'Text with _italic_'),
  completeStreamingCase('incomplete underscore emphasis at start', '_incomplete', '_incomplete_'),
  completeStreamingCase('incomplete underscore after complete strong', '__bold__ and _italic', '__bold__ and _italic_'),
  completeStreamingCase('underscore emphasis containing snake case', '_italic with some_var_name inside', '_italic with some_var_name inside_'),
  completeStreamingCase('underscore emphasis after snake case', 'test_var and _incomplete italic', 'test_var and _incomplete italic_'),
  completeStreamingCase('escaped then unescaped underscore', '\\_escaped\\_ and _unescaped', '\\_escaped\\_ and _unescaped_'),
  keepStreamingCase('complete underscore emphasis', 'Text with _italic text_'),
  completeStreamingCase('incomplete double underscore', 'Text with __strong', 'Text with __strong__'),
  completeStreamingCase('incomplete double underscore at start', '__incomplete', '__incomplete__'),
  completeStreamingCase('half double-underscore closer', '__bold text_', '__bold text__'),
  completeStreamingCase('second incomplete double-underscore run', '__first__ and __second', '__first__ and __second__'),
  keepStreamingCase('complete double underscore', 'Text with __strong text__'),
  completeStreamingCase('incomplete double-tilde deletion', 'Text with ~~strike', 'Text with ~~strike~~'),
  completeStreamingCase('incomplete double-tilde deletion at start', '~~incomplete', '~~incomplete~~'),
  completeStreamingCase('half double-tilde closer', '~~strike text~', '~~strike text~~'),
  completeStreamingCase('second incomplete deletion run', '~~first~~ and ~~second', '~~first~~ and ~~second~~'),
  completeStreamingCase('intraword tilde and incomplete deletion', '20~25 and ~~strike', '20~25 and ~~strike~~'),
  completeStreamingCase('incomplete inline code', 'Text with `code', 'Text with `code`'),
  completeStreamingCase('incomplete inline code at start', '`incomplete', '`incomplete`'),
  completeStreamingCase('second incomplete inline code', '`code1` and `code2', '`code1` and `code2`'),
  completeStreamingCase('open code containing asterisk', '`x * y', '`x * y`'),
  completeStreamingCase('open code containing underscore', '`snake_case', '`snake_case`'),
  completeStreamingCase('open code inside bold closes nested delimiters', '**bold `code', '**bold `code`**'),
  completeStreamingCase('open code inside link text closes in nesting order', '[`foo', '[`foo`]'),
  keepStreamingCase('complete inline code', 'Text with `inline code`'),
  keepStreamingCase('complete multiple inline code spans', '`code1` and `code2`'),
  completeStreamingCase('incomplete link text', 'Text with [partial', 'Text with [partial]'),
  completeStreamingCase('incomplete link URL opener', 'Text with [link](', 'Text with [link]()'),
  completeStreamingCase('incomplete link URL', 'Text with [link](https://exa', 'Text with [link](https://exa)'),
  keepStreamingCase('bracketed text is not automatically a link', 'Text with [label]'),
  keepStreamingCase('complete link', 'Text with [complete link](url)'),
  keepStreamingCase('multiple complete links', '[link1](url1) and [link2](url2)'),
  completeStreamingCase('nested link text with partial URL', '[outer [nested] text](incomplete', '[outer [nested] text](incomplete)'),
  completeStreamingCase('nested link text with empty URL', 'Text [foo [bar] baz](', 'Text [foo [bar] baz]()'),
  completeStreamingCase('incomplete image text', 'Text with ![partial', 'Text with ![partial]()'),
  completeStreamingCase('incomplete image URL opener', 'Text with ![alt](', 'Text with ![alt]()'),
  completeStreamingCase('incomplete image URL', 'Text with ![alt](https://img.test/a', 'Text with ![alt](https://img.test/a)'),
  keepStreamingCase('complete image', 'Text with ![alt text](image.png)'),
]

export const streamingProtectedRegionCases: TestCase[] = [
  keepStreamingCase('asterisk inside inline code', '`*italic`'),
  keepStreamingCase('bold markers inside inline code', '`**bold`'),
  keepStreamingCase('deletion markers inside inline code', '`~~strike`'),
  keepStreamingCase('underscore inside inline code', '`variable_name`'),
  keepStreamingCase('tilde inside inline code', '`20~25`'),
  keepStreamingCase('markers inside closed code block', '```\n*italic _name ~~strike\n```'),
  keepStreamingCase('tilde inside closed code block', '```\n20~25\n```'),
  keepStreamingCase('HTML-like text inside closed code block', '```\n<div\n```'),
  keepStreamingCase('inline HTML-like code', '`<div`'),
  completeStreamingCase('asterisk in incomplete fenced code', '```js\nconst value = *raw', '```js\nconst value = *raw\n```'),
  completeStreamingCase('underscore in incomplete fenced code', '```python\nvariable_name', '```python\nvariable_name\n```'),
  keepStreamingCase('complete HTML tag', 'Hello <div>'),
  keepStreamingCase('complete HTML element', '<div>content</div>'),
  keepStreamingCase('self-closing HTML tag', '<br/>'),
  keepStreamingCase('underscore in HTML attribute', '<a target="_blank">link</a>'),
  keepStreamingCase('multiple underscores in HTML attribute', '<iframe sandbox="allow_scripts">'),
  keepStreamingCase('asterisk in HTML attribute', '<div data-value="*literal">'),
  keepStreamingCase('tilde in HTML attribute', '<div data-value="20~25">'),
  keepStreamingCase('underscore in complete image URL', '![image](https://example.com/path_1.png)'),
  keepStreamingCase('multiple image URLs with underscores', '![a](https://x.test/path_1.png) ![b](https://x.test/path_2.png)'),
  keepStreamingCase('underscore in complete link URL', '[link](https://example.com/path_name)'),
  keepStreamingCase('asterisk in complete link URL', '[link](https://example.com/a*b)'),
  keepStreamingCase('tilde in complete link URL', '[link](https://example.com/a~b)'),
  keepStreamingCase('underscore in autolink URL', 'https://errors.example.dev/value_error'),
  keepStreamingCase('asterisk in autolink URL', 'https://example.com/a*b'),
  keepStreamingCase('tilde in autolink URL', 'https://example.com/a~b'),
  keepStreamingCase('asterisk inside closed double-dollar math', '$$a * b$$'),
  keepStreamingCase('underscore inside closed double-dollar math', '$$x_0$$'),
  keepStreamingCase('tilde inside closed double-dollar math', '$$a~b$$'),
  completeStreamingCase('incomplete bold after closed code', 'text `a*b` and **bold', 'text `a*b` and **bold**'),
  completeStreamingCase('incomplete underscore strong after closed code', 'see `a_b_c` then __bold', 'see `a_b_c` then __bold__'),
  completeStreamingCase('incomplete bold after escaped backticks', '\\`not code\\` **bold', '\\`not code\\` **bold**'),
  completeStreamingCase('incomplete italic after escaped backtick', '\\` *italic', '\\` *italic*'),
  completeStreamingCase('incomplete deletion after URL tilde', 'https://example.com/a~b and ~~strike', 'https://example.com/a~b and ~~strike~~'),
  completeStreamingCase('incomplete emphasis after HTML attribute', '<span data_name="value"> *italic', '<span data_name="value"> *italic*'),
]

export const streamingBlockCompletionCases: TestCase[] = [
  completeStreamingCase('incomplete fenced code block', '```javascript\nconst x = 1', '```javascript\nconst x = 1\n```'),
  completeStreamingCase('incomplete fence with trailing backtick', '```javascript\nconst x = 1`', '```javascript\nconst x = 1\n```'),
  completeStreamingCase('incomplete fence with trailing double backtick', '```javascript\nconst x = 1``', '```javascript\nconst x = 1\n```'),
  completeStreamingCase('incomplete fence ending in newline', '```python\nprint("hello")\n', '```python\nprint("hello")\n```'),
  completeStreamingCase('incomplete fence without language', '```\nplain code', '```\nplain code\n```'),
  completeStreamingCase('incomplete second fenced block', '```js\nfirst\n```\n\n```py\nsecond', '```js\nfirst\n```\n\n```py\nsecond\n```'),
  keepStreamingCase('complete fenced code block', '```js\nconst x = 1\n```'),
  completeStreamingCase('partial inline triple-backtick closer', '```python print("hello")``', '```python print("hello")```'),
  keepStreamingCase('complete inline triple-backtick span', '```python print("hello")```'),
  completeStreamingCase('incomplete block math', '$$\nx = 5', '$$\nx = 5\n$$'),
  completeStreamingCase('incomplete multiline block math', '$$\nf(x) = x^2\n+ 2x + 1', '$$\nf(x) = x^2\n+ 2x + 1\n$$'),
  completeStreamingCase('incomplete block math after prose', 'Introduction\n$$\nx = 5', 'Introduction\n$$\nx = 5\n$$'),
  keepStreamingCase('complete block math', '$$\nx = 5\n$$'),
  keepStreamingCase('complete block math in prose', 'Before\n$$\nx = 5\n$$\nAfter'),
  completeStreamingCase('incomplete inline double-dollar math', 'The formula is $$x = 5', 'The formula is $$x = 5$$'),
  keepStreamingCase('complete inline double-dollar math', 'The formula is $$x = 5$$ and done'),
  completeStreamingCase('incomplete table header', '| Month | Savings', '| Month | Savings |\n| --- | --- |'),
  completeStreamingCase('table header with escaped pipe', '| Month | Savings \\| Money', '| Month | Savings \\| Money |\n| --- | --- |'),
  completeStreamingCase('incomplete table separator', '| A | B |\n| ---', '| A | B |\n| --- | --- |'),
  completeStreamingCase('incomplete left-aligned table separator', '| A | B |\n| :', '| A | B |\n| :- | --- |'),
  completeStreamingCase('incomplete centered table separator', '| A | B |\n| :-:', '| A | B |\n| :-: | --- |'),
  completeStreamingCase('incomplete right-aligned table separator', '| A | B |\n| -:', '| A | B |\n| -: | --- |'),
  keepStreamingCase('complete table header and separator', '| A | B |\n| --- | --- |'),
  keepStreamingCase('valid final table row without trailing pipe', '| A | B |\n| --- | --- |\n| one | two'),
  completeStreamingCase('partial list marker after prose', 'here is a list\n-', 'here is a list\n-\u200B'),
  completeStreamingCase('double dash after prose', 'Some text\n--', 'Some text\n--\u200B'),
  completeStreamingCase('single equals after prose', 'Some text\n=', 'Some text\n=\u200B'),
  completeStreamingCase('double equals after prose', 'Some text\n==', 'Some text\n==\u200B'),
  completeStreamingCase('indented partial list marker after prose', 'Some text\n  -', 'Some text\n  -\u200B'),
  keepStreamingCase('standalone dash without previous text', '-'),
  keepStreamingCase('dash after empty line', '\n-'),
  keepStreamingCase('complete list item after prose', 'Some text\n- Item 1'),
  keepStreamingCase('valid Setext underline', 'Heading\n==='),
  keepStreamingCase('valid thematic break after prose', 'Some text\n---'),
  completeStreamingCase('comparison in unordered list', '- > 25: rich', '- \\> 25: rich'),
  completeStreamingCase('comparison in asterisk list', '* > 25: rich', '* \\> 25: rich'),
  completeStreamingCase('comparison in ordered list', '1. > 25: rich', '1. \\> 25: rich'),
  completeStreamingCase('comparison in nested list', '  - > 5: expensive', '  - \\> 5: expensive'),
  completeStreamingCase('greater-than-or-equal comparison', '- >= 10: high', '- \\>= 10: high'),
  completeStreamingCase('comparison before currency', '- > $100: expensive', '- \\> $100: expensive'),
  keepStreamingCase('actual blockquote', '> Some blockquote'),
  keepStreamingCase('numeric blockquote without list', '> 25 is a number'),
  keepStreamingCase('quoted prose in list', '- > Some quoted text'),
  keepStreamingCase('comparison inside code block', '```\n- > 25: in code\n```'),
  completeStreamingCase('incomplete opening HTML tag', 'Hello <div', 'Hello'),
  completeStreamingCase('incomplete custom HTML tag', 'Hello <custom', 'Hello'),
  completeStreamingCase('incomplete closing HTML tag', 'Hello </div', 'Hello'),
  completeStreamingCase('partial HTML attribute', 'Hello <div class="foo', 'Hello'),
  completeStreamingCase('incomplete tag after paragraph', '# Heading\n\nParagraph <custom', '# Heading\n\nParagraph'),
  keepStreamingCase('less-than comparison', '3 < 5'),
  keepStreamingCase('less-than before identifier', 'x < y'),
  keepStreamingCase('less-than at end of prose', 'if a <'),
  keepStreamingCase('less-than before digit', 'value <1'),
]

export const streamingCompletionTestCases: TestCasesByCategory = {
  'streaming-completion': [
    ...streamingDelimiterSafetyCases,
    ...streamingInlineCompletionCases,
    ...streamingProtectedRegionCases,
    ...streamingBlockCompletionCases,
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
  ...htmlTestCases,
  ...streamingCompletionTestCases,
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
