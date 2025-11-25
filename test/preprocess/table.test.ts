import { describe, expect, it } from 'vitest'
import { fixTable } from '../../src/preprocess/table'

describe('fixTable', () => {
  it('should add separator after complete table header', () => {
    const input = '| Column A | Column B | Column C |\n'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should add separator after table header without trailing newline', () => {
    const input = '| Column A | Column B | Column C |'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should replace incomplete separator with complete one', () => {
    const input = '| Column A | Column B | Column C |\n|----|----|'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should complete partial separator with correct column count', () => {
    const input = '| Column A | Column B | Column C |\n| --- |'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should handle two column table', () => {
    const input = '| A | B |\n'
    const expected = '| A | B |\n| --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should not modify complete table', () => {
    const input = '| Column A | Column B | Column C |\n| --- | --- | --- |\n| A1 | B1 | C1 |'
    expect(fixTable(input)).toBe(input)
  })

  it('should insert separator before data row', () => {
    const input = '| Column A | Column B | Column C |\n| A1 | B1 | C1 |'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |\n| A1 | B1 | C1 |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should not process table inside code block', () => {
    const input = '```\n| Column A | Column B | Column C |\n'
    expect(fixTable(input)).toBe(input)
  })

  it('should handle table in paragraph context', () => {
    const input = '# Title\n\n| Column A | Column B | Column C |\n'
    const expected = '# Title\n\n| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should handle incomplete separator starting with pipe', () => {
    const input = '| A | B | C |\n|'
    const expected = '| A | B | C |\n| --- | --- | --- |\n|'
    expect(fixTable(input)).toBe(expected)
  })

  it('should not process non-table lines', () => {
    const input = 'This is just text\n'
    expect(fixTable(input)).toBe(input)
  })

  it('should handle table with empty cells', () => {
    const input = '| A |  | C |\n'
    const expected = '| A |  | C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should complete incomplete header row (missing closing pipe) at end of paragraph', () => {
    const input = '| Column A | Column B | Column C\n'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should complete incomplete header row without trailing newline', () => {
    const input = '| Column A | Column B | Column C'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should complete incomplete header row and add separator before data row', () => {
    const input = '| Column A | Column B | Column C\n| A1 | B1 | C1 |'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |\n| A1 | B1 | C1 |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should complete incomplete header row when separator already exists', () => {
    const input = '| Column A | Column B | Column C\n| --- | --- | --- |'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should complete incomplete header row and replace incomplete separator', () => {
    const input = '| Column A | Column B | Column C\n|----|----|'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should complete incomplete header row in paragraph context', () => {
    const input = '# Title\n\n| Column A | Column B | Column C\n'
    const expected = '# Title\n\n| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should handle incomplete header row with partial content', () => {
    const input = '| A | B\n'
    const expected = '| A | B |\n| --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })

  it('should complete incomplete header row and handle incomplete separator', () => {
    const input = '| Column A | Column B | Column C\n| --- |'
    const expected = '| Column A | Column B | Column C |\n| --- | --- | --- |'
    expect(fixTable(input)).toBe(expected)
  })
})
