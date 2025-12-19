export interface SimpleTestCase {
  description: string
  input: string
  expected: string
}

export type TestCasesByCategory = Record<string, SimpleTestCase[]>

export const codeTestCases: TestCasesByCategory = {
  'code-inline': [
    {
      description: 'should handle trailing ` without content',
      input: '`',
      expected: '',
    },
    {
      description: 'should handle trailing `` without content',
      input: '``',
      expected: '',
    },
    {
      description: 'should handle trailing ``` without content',
      input: '```',
      expected: '',
    },
    {
      description: 'should remove trailing ` without content',
      input: 'Text `',
      expected: 'Text',
    },
    {
      description: 'should handle trailing `` without content',
      input: 'Text ``',
      expected: 'Text',
    },
    {
      description: 'should handle trailing ``` without content',
      input: 'Text ```',
      expected: 'Text',
    },
    {
      description: 'should complete unclosed ` with content',
      input: 'Hello `world',
      expected: 'Hello `world`',
    },
    {
      description: 'should not modify already closed inline code',
      input: 'Hello `world`',
      expected: 'Hello `world`',
    },
    {
      description: 'should remove bare ` in paragraph',
      input: 'Hello\n\n`',
      expected: 'Hello',
    },
    {
      description: 'should handle multiple ` in same paragraph',
      input: '`a` and `b',
      expected: '`a` and `b`',
    },
    {
      description: 'should handle ` spanning multiple lines',
      input: 'Hello `world\nand more code',
      expected: 'Hello `world\nand more code`',
    },
    {
      description: 'should not interfere with code blocks when counting inline code',
      input: '```js\ncode\n``` and `inline',
      expected: '```js\ncode\n``` and `inline`',
    },
    {
      description: 'should handle multiple unclosed inline codes (only complete the last)',
      input: 'Para1 `one\n\nPara2 `two',
      expected: 'Para1 `one\n\nPara2 `two`',
    },
    {
      description: 'should handle backticks in different contexts',
      input: 'Text with ` and more',
      expected: 'Text with ` and more`',
    },
  ],

  'code-block': [
    {
      description: 'should complete unclosed code block with content',
      input: '```javascript\nconst x = 1',
      expected: '```javascript\nconst x = 1\n```',
    },
    {
      description: 'should handle trailing ` without content',
      input: '```javascript\nconst x = 1`',
      expected: '```javascript\nconst x = 1\n```',
    },
    {
      description: 'should handle trailing `` without content',
      input: '```javascript\nconst x = 1``',
      expected: '```javascript\nconst x = 1\n```',
    },
    {
      description: 'should complete code block that already ends with newline',
      input: '```python\nprint("hello")\n',
      expected: '```python\nprint("hello")\n```',
    },
    {
      description: 'should not modify already closed code blocks',
      input: '```js\ncode\n```',
      expected: '```js\ncode\n```',
    },
    {
      description: 'should handle code blocks spanning multiple paragraphs',
      input: '```javascript\nfunction test() {\n\n  return true;\n}',
      expected: '```javascript\nfunction test() {\n\n  return true;\n}\n```',
    },
    {
      description: 'should complete last code block when multiple blocks exist',
      input: '```js\ncode1\n```\n\nText\n\n```python\ncode2',
      expected: '```js\ncode1\n```\n\nText\n\n```python\ncode2\n```',
    },
    {
      description: 'should handle code blocks without language identifiers',
      input: '```\nplain code',
      expected: '```\nplain code\n```',
    },
    {
      description: 'should handle code block with only language identifier',
      input: '```javascript',
      expected: '```javascript\n```',
    },
    {
      description: 'should not process inline code when inside code block',
      input: '```js\nconst x = `template',
      expected: '```js\nconst x = `template\n```',
    },
    {
      description: 'should not complete inline code inside complete code blocks',
      input: '```js\nconst x = `template\n```',
      expected: '```js\nconst x = `template\n```',
    },
  ],

  'code-mixed': [
    {
      description: 'should handle both inline code and code blocks',
      input: '```js\ncode\n```\n\nUse `variable',
      expected: '```js\ncode\n```\n\nUse `variable`',
    },
    {
      description: 'should complete code block before processing inline code',
      input: 'Text `inline` code\n\n```js\nconst x = 1',
      expected: 'Text `inline` code\n\n```js\nconst x = 1\n```',
    },
  ],
}

export const deleteTestCases: TestCasesByCategory = {
  delete: [
    {
      description: 'should complete unclosed ~~ with content',
      input: 'Hello ~~world',
      expected: 'Hello ~~world~~',
    },
    {
      description: 'should complete unclosed ~~ with single ~',
      input: 'Hello ~~world~',
      expected: 'Hello ~~world~~',
    },
    {
      description: 'should not modify already closed ~~',
      input: 'Hello ~~world~~',
      expected: 'Hello ~~world~~',
    },
    {
      description: 'should remove bare single ~ without content',
      input: '~',
      expected: '',
    },
    {
      description: 'should remove bare ~~ without content',
      input: '~~',
      expected: '',
    },
    {
      description: 'should remove ~~ when there is no content after it',
      input: 'Hello ~~',
      expected: 'Hello',
    },
    {
      description: 'should remove ~~ and trailing whitespace',
      input: 'Hello ~~   ',
      expected: 'Hello',
    },
    {
      description: 'should handle multiple ~~ in same paragraph',
      input: '~~a~~ and ~~b',
      expected: '~~a~~ and ~~b~~',
    },
    {
      description: 'should only process last paragraph after blank line for ~~',
      input: 'Para1 ~~unclosed\n\nPara2 ~~text',
      expected: 'Para1 ~~unclosed\n\nPara2 ~~text~~',
    },
    {
      description: 'should handle mixed formatting with other markdown',
      input: '**bold** and ~~strike',
      expected: '**bold** and ~~strike~~',
    },
    {
      description: 'should handle complex scenarios with mixed ~ and ~~ (single ~ after complete)',
      input: '~~complete~~ text~',
      expected: '~~complete~~ text',
    },
    {
      description: 'should handle complex scenarios with mixed ~ and ~~ (incomplete ending with ~)',
      input: '~~incomplete text~',
      expected: '~~incomplete text~~',
    },
    {
      description: 'should handle edge cases with whitespace and single ~',
      input: '~~text ~',
      expected: '~~text ~~',
    },
    {
      description: 'should handle single ~ at end with unclosed ~~ before it',
      input: '~~text~',
      expected: '~~text~~',
    },
  ],
}

export const emphasisTestCases: TestCasesByCategory = {
  'emphasis-asterisk': [
    {
      description: 'should remove bare * without content',
      input: '*',
      expected: '',
    },
    {
      description: 'should complete unclosed * with content',
      input: 'Hello *world',
      expected: 'Hello *world*',
    },
    {
      description: 'should handle * spanning multiple lines',
      input: 'Hello *world\nand more text',
      expected: 'Hello *world\nand more text*',
    },
    {
      description: 'should not modify already closed *',
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
      description: 'should prioritize * over _ when both are unclosed',
      input: '*asterisk and _underscore',
      expected: '*asterisk and _underscore_*',
    },
  ],

  'emphasis-underscore': [
    {
      description: 'should remove bare _ without content',
      input: '_',
      expected: '',
    },
    {
      description: 'should complete unclosed _ with content',
      input: 'Hello _world',
      expected: 'Hello _world_',
    },
    {
      description: 'should handle _ spanning multiple lines',
      input: 'Hello _world\nand more text',
      expected: 'Hello _world\nand more text_',
    },
    {
      description: 'should not modify already closed _',
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
      description: 'should prioritize _ over * when both are unclosed',
      input: '_underscore and *asterisk',
      expected: '_underscore and *asterisk*_',
    },
  ],
}

export const strongTestCases: TestCasesByCategory = {
  'strong-asterisk': [
    {
      description: 'should complete unclosed ** in streaming content',
      input: 'Hello **world',
      expected: 'Hello **world**',
    },
    {
      description: 'should handle trailing * without content',
      input: 'Hello **world*',
      expected: 'Hello **world**',
    },
    {
      description: 'should not modify already closed **',
      input: 'Hello **world**',
      expected: 'Hello **world**',
    },
    {
      description: 'should remove bare ** without content',
      input: '**',
      expected: '',
    },
    {
      description: 'should remove bare single * without content',
      input: '*',
      expected: '',
    },
    {
      description: 'should remove bare ** in paragraph',
      input: 'Hello\n\n**',
      expected: 'Hello',
    },
    {
      description: 'should only process last paragraph after blank line',
      input: 'Para1 **unclosed\n\nPara2 **text',
      expected: 'Para1 **unclosed\n\nPara2 **text**',
    },
    {
      description: 'should handle ** spanning multiple lines',
      input: 'Hello **world\nand more text',
      expected: 'Hello **world\nand more text**',
    },
    {
      description: 'should prioritize ** over __ when both are unclosed',
      input: '**asterisk and __underscore',
      expected: '**asterisk and __underscore__**',
    },
    {
      description: 'should complete ** when mixed with unclosed *',
      input: '**bold and *mixed',
      expected: '**bold and *mixed***',
    },
  ],

  'strong-underscore': [
    {
      description: 'should complete unclosed __ in streaming content',
      input: 'Hello __world',
      expected: 'Hello __world__',
    },
    {
      description: 'should handle trailing _ without content',
      input: 'Hello __world_',
      expected: 'Hello __world__',
    },
    {
      description: 'should not modify already closed __',
      input: 'Hello __world__',
      expected: 'Hello __world__',
    },
    {
      description: 'should remove bare __ without content',
      input: '__',
      expected: '',
    },
    {
      description: 'should remove bare single _ without content',
      input: '_',
      expected: '',
    },
    {
      description: 'should remove bare __ in paragraph',
      input: 'Hello\n\n__',
      expected: 'Hello',
    },
    {
      description: 'should only process last paragraph after blank line',
      input: 'Para1 __unclosed\n\nPara2 __text',
      expected: 'Para1 __unclosed\n\nPara2 __text__',
    },
    {
      description: 'should handle __ spanning multiple lines',
      input: 'Hello __world\nand more text',
      expected: 'Hello __world\nand more text__',
    },
    {
      description: 'should prioritize __ over ** when both are unclosed',
      input: '__underscore and **asterisk',
      expected: '__underscore and **asterisk**__',
    },
    {
      description: 'should complete __ when mixed with unclosed _',
      input: '__bold and _mixed',
      expected: '__bold and _mixed___',
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
      description: 'should add URL part when only text is present',
      input: '[Google]',
      expected: '[Google]()',
    },
    {
      description: 'should not remove bracket when it has content after',
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
      description: 'should not modify complete links',
      input: '[Google](https://www.google.com)',
      expected: '[Google](https://www.google.com)',
    },
    {
      description: 'should complete link with missing closing bracket and content',
      input: 'Visit [Google',
      expected: 'Visit [Google]()',
    },
    {
      description: 'should only process last paragraph after blank line for links',
      input: 'Para1 [unclosed\n\nPara2 [text',
      expected: 'Para1 [unclosed\n\nPara2 [text]()',
    },
    {
      description: 'should handle incomplete link in last paragraph',
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
      description: 'should remove standalone bracket with trailing newline',
      input: 'Text [\n',
      expected: 'Text',
    },
  ],

  image: [
    {
      description: 'should complete image with missing closing bracket',
      input: '![alt',
      expected: '![alt]()',
    },
    {
      description: 'should add URL part when only alt is present',
      input: '![alt]',
      expected: '![alt]()',
    },
    {
      description: 'should not remove bracket when it has content after',
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
      description: 'should not modify complete images',
      input: '![mdast](https://raw.githubusercontent.com/logo.svg)',
      expected: '![mdast](https://raw.githubusercontent.com/logo.svg)',
    },
    {
      description: 'should complete image with missing closing bracket and content',
      input: 'Visit ![Google',
      expected: 'Visit ![Google]()',
    },
    {
      description: 'should only process last paragraph after blank line for images',
      input: 'Para1 ![unclosed\n\nPara2 ![text',
      expected: 'Para1 ![unclosed\n\nPara2 ![text]()',
    },
    {
      description: 'should handle incomplete image in last paragraph',
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
      description: 'should remove standalone bracket with trailing newline',
      input: 'Text ![\n',
      expected: 'Text',
    },
    {
      description: 'should complete image with empty alt and incomplete URL',
      input: '![](',
      expected: '![]()',
    },
    {
      description: 'should complete image with empty alt and missing URL part',
      input: '![]',
      expected: '![]()',
    },
    {
      description: 'should complete image with empty alt and incomplete URL in context',
      input: 'Text ![](',
      expected: 'Text ![]()',
    },
    {
      description: 'should complete image with empty alt and missing URL part in context',
      input: 'Text ![]',
      expected: 'Text ![]()',
    },
    {
      description: 'should not modify complete image with empty alt',
      input: '![]()',
      expected: '![]()',
    },
  ],
}

export const inlineMathTestCases: TestCasesByCategory = {
  'inline-math': [
    {
      description: 'should complete unclosed $$ with content',
      input: 'The formula is $$x = 1',
      expected: 'The formula is $$x = 1$$',
    },
    {
      description: 'should handle trailing $ without content',
      input: 'The formula is $$x = 1$',
      expected: 'The formula is $$x = 1$$',
    },
    {
      description: 'should not modify already closed $$',
      input: 'The formula is $$x = 1$$',
      expected: 'The formula is $$x = 1$$',
    },
    {
      description: 'should remove bare $$ without content',
      input: '$$',
      expected: '',
    },
    {
      description: 'should remove bare $ without content',
      input: '$',
      expected: '',
    },
    {
      description: 'should remove trailing $$ when no content',
      input: 'Text $$',
      expected: 'Text',
    },
    {
      description: 'should remove bare $$ in paragraph',
      input: 'Hello\n\n$$',
      expected: 'Hello',
    },
    {
      description: 'should only process last paragraph after blank line for $$',
      input: 'Para1 $$x$$\n\nPara2 $$y',
      expected: 'Para1 $$x$$\n\nPara2 $$y$$',
    },
    {
      description: 'should only process last paragraph after blank line for $$ spanning multiple lines',
      input: 'Hello $$world\nand more text',
      expected: 'Hello $$world\nand more text',
    },
    {
      description: 'should complete when ending with single $ after content',
      input: '$$\\int u \\, dv = uv - \\int v \\, du$',
      expected: '$$\\int u \\, dv = uv - \\int v \\, du$$',
    },
    {
      description: 'should complete when ending with single $ in multi-paragraph',
      input: 'Para1 $$x$$\n\nPara2 $$y = 1$',
      expected: 'Para1 $$x$$\n\nPara2 $$y = 1$$',
    },
    {
      description: 'should find last dollar pair skipping inline code',
      input: 'Text `$$` and $$x = 1',
      expected: 'Text `$$` and $$x = 1$$',
    },
    {
      description: 'should not process inside code blocks (unclosed)',
      input: '```\n$$x = 1\n```',
      expected: '```\n$$x = 1\n```',
    },
    {
      description: 'should not process inside inline code (backticks)',
      input: 'Wrap inline mathematical expressions with `$$`:',
      expected: 'Wrap inline mathematical expressions with `$$`:',
    },
  ],
}

export const tableTestCases: TestCasesByCategory = {
  table: [
    {
      description: 'should add separator after table header without trailing newline',
      input: '| Column A | Column B | Column C |',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should add separator after complete table header',
      input: '| Column A | Column B | Column C |\n',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should handle header row with only one pipe',
      input: '| A',
      expected: '| A |\n| --- |',
    },
    {
      description: 'should find header row starting with pipe',
      input: '| A | B',
      expected: '| A | B |\n| --- | --- |',
    },
    {
      description: 'should handle no next line after header',
      input: '| A | B | C |',
      expected: '| A | B | C |\n| --- | --- | --- |',
    },
    {
      description: 'should handle incomplete separator starting with pipe',
      input: '| A | B | C |\n|',
      expected: '| A | B | C |\n| --- | --- | --- |\n|',
    },
    {
      description: 'should handle header row not at start of paragraph',
      input: 'Text\n| A | B | C |\n',
      expected: 'Text\n| A | B | C |\n| --- | --- | --- |',
    },
    {
      description: 'should complete partial separator with correct column count',
      input: '| Column A | Column B | Column C |\n| --- |',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should replace incomplete separator with complete one',
      input: '| Column A | Column B | Column C |\n|----|----|',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should not modify complete table',
      input: '| Column A | Column B | Column C |\n| --- | --- | --- |\n| A1 | B1 | C1 |',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |\n| A1 | B1 | C1 |',
    },
    {
      description: 'should complete incomplete header row without trailing newline',
      input: '| Column A | Column B | Column C',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
    {
      description: 'should complete incomplete header row (missing closing pipe) at end of paragraph',
      input: '| Column A | Column B | Column C\n',
      expected: '| Column A | Column B | Column C |\n| --- | --- | --- |',
    },
  ],
}

export const taskListTestCases: TestCasesByCategory = {
  'task-list': [
    {
      description: 'should remove standalone dash at the end',
      input: '- [ ] Task 1\n-',
      expected: '- [ ] Task 1',
    },
    {
      description: 'should keep task list with uppercase X',
      input: '- [X] Task 1\n-',
      expected: '- [X] Task 1',
    },
    {
      description: 'should remove standalone dash after multiple task items',
      input: '- [ ] Task 1\n- [x] Task 2\n-',
      expected: '- [ ] Task 1\n- [x] Task 2',
    },
    {
      description: 'should keep valid task list items',
      input: '- [ ] Task 1\n- [x] Task 2',
      expected: '- [ ] Task 1\n- [x] Task 2',
    },
    {
      description: 'should handle single line with standalone dash',
      input: '-',
      expected: '',
    },
    {
      description: 'should handle single line with incomplete task list',
      input: '- [',
      expected: '',
    },
    {
      description: 'should keep dash with space (regular list item)',
      input: '- [ ] Task 1\n- ',
      expected: '- [ ] Task 1',
    },
    {
      description: 'should remove incomplete task list item with opening bracket',
      input: '- [ ] Task 1\n- [',
      expected: '- [ ] Task 1',
    },
    {
      description: 'should remove incomplete task list in quote block',
      input: '> - [',
      expected: '',
    },
    {
      description: 'should remove standalone dash in quote block',
      input: '> -',
      expected: '',
    },
  ],
}

export const footnoteTestCases: TestCasesByCategory = {
  footnote: [
    {
      description: 'should remove footnote reference without definition',
      input: 'Text [^1]',
      expected: 'Text',
    },
    {
      description: 'should keep footnote reference with definition',
      input: 'Text [^1]\n\n[^1]: Definition',
      expected: 'Text [^1]\n\n[^1]: Definition',
    },
    {
      description: 'should remove multiple footnote references without definitions',
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
      description: 'should remove incomplete footnote reference (simple)',
      input: 'Text [^1',
      expected: 'Text',
    },
    {
      description: 'should remove incomplete footnote reference (missing closing bracket)',
      input: '"Knowledge is power—but digital knowledge is acceleration."[^1',
      expected: '"Knowledge is power—but digital knowledge is acceleration."',
    },
    {
      description: 'should remove incomplete footnote reference (quote block)',
      input: '> "Knowledge is power—but digital knowledge is acceleration."[^1',
      expected: '> "Knowledge is power—but digital knowledge is acceleration."',
    },
    {
      description: 'should handle incomplete reference in last paragraph',
      input: 'Para1\n\nText [^1',
      expected: 'Para1\n\nText',
    },
    {
      description: 'should remove incomplete reference to end of line',
      input: 'Text [^1\nMore text',
      expected: 'Text\nMore text',
    },
    {
      description: 'should handle footnote references spanning multiple lines in same paragraph',
      input: 'Text [^1]\nand more text',
      expected: 'Text\nand more text',
    },
    {
      description: 'should handle multiple paragraphs with mixed references',
      input: 'Para1 [^1]\n\nPara2 [^2]\n\n[^1]: First',
      expected: 'Para1 [^1]\n\nPara2\n\n[^1]: First',
    },
    {
      description: 'should ignore footnote references in code blocks',
      input: '```\n[^1]\n```\n\nText [^1]',
      expected: '```\n[^1]\n```\n\nText',
    },
    {
      description: 'should ignore footnote references in inline code blocks',
      input: 'Text `[^1]` and [^1]',
      expected: 'Text `[^1]` and',
    },
    {
      description: 'should skip references inside code blocks when finding',
      input: '```\n[^1]\n```\n\nText [^1]',
      expected: '```\n[^1]\n```\n\nText',
    },
    {
      description: 'should skip references inside inline code when finding',
      input: 'Text `[^1]` and [^1]',
      expected: 'Text `[^1]` and',
    },
    {
      description: 'should handle code blocks with footnote-like text',
      input: '```\n[^1]: This is not a real definition\n```\n\nText [^1]',
      expected: '```\n[^1]: This is not a real definition\n```\n\nText',
    },
    {
      description: 'should handle nested code blocks',
      input: '```\n```\n[^1]\n```\n```\n\nText [^1]',
      expected: '```\n```\n\n```\n```\n\nText',
    },
    {
      description: 'should recalculate code blocks after removing incomplete reference',
      input: '```\ncode\n```\n\nText [^1',
      expected: '```\ncode\n```\n\nText',
    },
    {
      description: 'should recalculate inline code after removing incomplete reference',
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
  ...tableTestCases,
  ...taskListTestCases,
  ...footnoteTestCases,
}

export function getTestCases(): SimpleTestCase[] {
  return Object.values(testCasesByCategory).flat()
}

export function getTestCasesByCategory(category: string): SimpleTestCase[] {
  return testCasesByCategory[category] || []
}

export function getTestCaseCategories(): string[] {
  return Object.keys(testCasesByCategory)
}

export function getTestCasesByCategories(categories: string[]): SimpleTestCase[] {
  return categories.flatMap(category => getTestCasesByCategory(category))
}
