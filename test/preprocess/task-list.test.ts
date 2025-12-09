import { describe, expect, it } from 'vitest'
import { fixTaskList } from '../../src/preprocess/task-list'

describe('fixTaskList', () => {
  it('should remove standalone dash at the end', () => {
    expect(fixTaskList('- [ ] Task 1\n-')).toBe('- [ ] Task 1\n')
  })

  it('should remove standalone dash after multiple task items', () => {
    expect(fixTaskList('- [ ] Task 1\n- [x] Task 2\n-')).toBe('- [ ] Task 1\n- [x] Task 2\n')
  })

  it('should keep valid task list items', () => {
    expect(fixTaskList('- [ ] Task 1\n- [x] Task 2')).toBe('- [ ] Task 1\n- [x] Task 2')
  })

  it('should keep task list with uppercase X', () => {
    expect(fixTaskList('- [X] Task 1\n-')).toBe('- [X] Task 1\n')
  })

  it('should keep dash with space (regular list item)', () => {
    expect(fixTaskList('- [ ] Task 1\n- ')).toBe('- [ ] Task 1\n- ')
  })

  it('should handle nested task lists', () => {
    const content = `- [ ] Phase 1: Setup
  - [x] Initialize repository
  - [x] Configure build tools
  - [ ] Setup CI/CD
- [ ] Phase 2: Development
  - [ ] Implement features
  -`
    const expected = `- [ ] Phase 1: Setup
  - [x] Initialize repository
  - [x] Configure build tools
  - [ ] Setup CI/CD
- [ ] Phase 2: Development
  - [ ] Implement features
`
    expect(fixTaskList(content)).toBe(expected)
  })

  it('should remove standalone dash in quote block', () => {
    const content = `> **Note**: Here's a quote with tasks:

> -`
    const expected = `> **Note**: Here's a quote with tasks:

`
    expect(fixTaskList(content)).toBe(expected)
  })

  it('should remove standalone dash in quote block with nested content', () => {
    const content = `- [ ] Milk

- [ ] Eggs

- [x] Bread

> **Note**: Here's a quote with tasks:

> -`
    const expected = `- [ ] Milk

- [ ] Eggs

- [x] Bread

> **Note**: Here's a quote with tasks:

`
    expect(fixTaskList(content)).toBe(expected)
  })

  it('should keep valid task list in quote block', () => {
    const content = `> **Note**: Here's a quote with tasks:
> - [x] Complete quote formatting
> - [ ] Add more examples`
    expect(fixTaskList(content)).toBe(content)
  })

  it('should remove standalone dash in quote block but keep valid task list', () => {
    const content = `> **Note**: Here's a quote with tasks:
> - [x] Complete quote formatting
> - [ ] Add more examples
> -`
    const expected = `> **Note**: Here's a quote with tasks:
> - [x] Complete quote formatting
> - [ ] Add more examples
`
    expect(fixTaskList(content)).toBe(expected)
  })

  it('should handle empty content', () => {
    expect(fixTaskList('')).toBe('')
  })

  it('should handle content with only whitespace', () => {
    expect(fixTaskList('   ')).toBe('   ')
  })

  it('should handle standalone dash with indentation', () => {
    expect(fixTaskList('- [ ] Task 1\n  -')).toBe('- [ ] Task 1\n')
  })

  it('should handle quote block with indentation', () => {
    const content = `> **Note**: Here's a quote:
>   -`
    const expected = `> **Note**: Here's a quote:
`
    expect(fixTaskList(content)).toBe(expected)
  })

  it('should not remove dash that is part of task list syntax', () => {
    expect(fixTaskList('- [ ] Task 1\n- [')).toBe('- [ ] Task 1\n- [')
  })

  it('should handle multiple paragraphs with standalone dash at end', () => {
    const content = `## Shopping List

- [ ] Milk
- [ ] Eggs
- [x] Bread

Some text here.

-`
    const expected = `## Shopping List

- [ ] Milk
- [ ] Eggs
- [x] Bread

Some text here.

`
    expect(fixTaskList(content)).toBe(expected)
  })
})
