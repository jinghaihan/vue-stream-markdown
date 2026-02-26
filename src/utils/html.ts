import type { Config as DOMPurifyConfig, UponSanitizeAttributeHook } from 'dompurify'
import type { HtmlAllowedTagRule, HtmlOptions } from '../types'
import DOMPurify from 'dompurify'
import { isClient } from './inference'

type TagAttrs = Set<string> | undefined

interface PurifyPlan {
  config: DOMPurifyConfig
  tagRules: Map<string, TagAttrs>
}

const ANY_ATTR = '*'

function normalizeToken(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeAllowedTags(rules: Array<HtmlAllowedTagRule | string> = []): Map<string, TagAttrs> {
  const tagRules = new Map<string, TagAttrs>()

  for (const rule of rules) {
    if (typeof rule === 'string') {
      const tagName = normalizeToken(rule)
      if (!tagName)
        continue
      tagRules.set(tagName, undefined)
      continue
    }

    const tagName = normalizeToken(rule.name || '')
    if (!tagName)
      continue

    if (!rule.attrs) {
      tagRules.set(tagName, undefined)
      continue
    }

    const attrs = new Set(
      rule.attrs
        .map(attr => normalizeToken(attr || ''))
        .filter(Boolean),
    )

    tagRules.set(tagName, attrs)
  }

  return tagRules
}

function mergeAdditionalTags(
  current: DOMPurifyConfig['ADD_TAGS'],
  allowedTagSet: Set<string>,
): DOMPurifyConfig['ADD_TAGS'] {
  if (!allowedTagSet.size)
    return current

  if (typeof current === 'function') {
    return (tagName: string) => current(tagName) || allowedTagSet.has(normalizeToken(tagName))
  }

  if (Array.isArray(current))
    return Array.from(new Set([...current, ...allowedTagSet]))

  return Array.from(allowedTagSet)
}

function mergeAdditionalAttrs(
  current: DOMPurifyConfig['ADD_ATTR'],
  allowedAttrs: Set<string>,
): DOMPurifyConfig['ADD_ATTR'] {
  if (!allowedAttrs.size)
    return current

  if (typeof current === 'function') {
    return (attrName: string, tagName: string) =>
      current(attrName, tagName) || allowedAttrs.has(normalizeToken(attrName))
  }

  if (Array.isArray(current))
    return Array.from(new Set([...current, ...allowedAttrs]))

  return Array.from(allowedAttrs)
}

function collectAdditionalAttrs(tagRules: Map<string, TagAttrs>): Set<string> {
  const attrs = new Set<string>()

  for (const tagAttrs of tagRules.values()) {
    if (!tagAttrs || !tagAttrs.size)
      continue

    for (const attr of tagAttrs) {
      if (attr !== ANY_ATTR)
        attrs.add(attr)
    }
  }

  return attrs
}

function matchesTagNameCheck(
  check: RegExp | ((name: string) => boolean) | null | undefined,
  value: string,
): boolean {
  if (!check)
    return false
  if (check instanceof RegExp)
    return check.test(value)
  return check(value)
}

function matchesAttrNameCheck(
  check: RegExp | ((attrName: string, tagName?: string) => boolean) | null | undefined,
  attrName: string,
  tagName?: string,
): boolean {
  if (!check)
    return false
  if (check instanceof RegExp)
    return check.test(attrName)
  return check(attrName, tagName)
}

function applyCustomElementHandling(
  config: DOMPurifyConfig,
  allowedTagSet: Set<string>,
  tagRules: Map<string, TagAttrs>,
): void {
  const customElementHandling = {
    ...(config.CUSTOM_ELEMENT_HANDLING ?? {}),
  }

  const previousTagCheck = customElementHandling.tagNameCheck
  const previousAttrCheck = customElementHandling.attributeNameCheck

  customElementHandling.tagNameCheck = (tagName: string) =>
    allowedTagSet.has(normalizeToken(tagName))
    || matchesTagNameCheck(previousTagCheck, tagName)

  customElementHandling.attributeNameCheck = (attrName: string, tagName?: string) => {
    if (tagName && allowedTagSet.has(normalizeToken(tagName))) {
      const attrs = tagRules.get(normalizeToken(tagName))
      if (!attrs)
        return matchesAttrNameCheck(previousAttrCheck, attrName, tagName)
      if (attrs.has(ANY_ATTR))
        return true
      return attrs.has(normalizeToken(attrName))
    }

    return matchesAttrNameCheck(previousAttrCheck, attrName, tagName)
  }

  config.CUSTOM_ELEMENT_HANDLING = customElementHandling
}

function applyAllowedTagsToConfig(
  config: DOMPurifyConfig,
  tagRules: Map<string, TagAttrs>,
): void {
  if (!tagRules.size)
    return

  const allowedTagSet = new Set(tagRules.keys())
  const allowedAttrs = collectAdditionalAttrs(tagRules)

  config.ADD_TAGS = mergeAdditionalTags(config.ADD_TAGS, allowedTagSet)
  config.ADD_ATTR = mergeAdditionalAttrs(config.ADD_ATTR, allowedAttrs)
  applyCustomElementHandling(config, allowedTagSet, tagRules)
}

export function resolvePurifyConfig(options?: HtmlOptions): PurifyPlan {
  const config: DOMPurifyConfig = {
    ...(options?.purifyConfig ?? {}),
  }

  const tagRules = normalizeAllowedTags(options?.allowedTags)
  applyAllowedTagsToConfig(config, tagRules)

  return { config, tagRules }
}

function createAttributeHook(tagRules: Map<string, TagAttrs>): UponSanitizeAttributeHook {
  return (node, event) => {
    const tagName = normalizeToken(node.tagName || '')
    const attrs = tagRules.get(tagName)
    if (!attrs || attrs.has(ANY_ATTR))
      return

    const attrName = normalizeToken(event.attrName || '')
    if (!attrs.has(attrName))
      event.keepAttr = false
  }
}

export function sanitizeHtml(content: string, options?: HtmlOptions): string {
  if (!content || !isClient())
    return ''

  const { config, tagRules } = resolvePurifyConfig(options)
  if (!tagRules.size)
    return DOMPurify.sanitize(content, config)

  const hook = createAttributeHook(tagRules)
  DOMPurify.addHook('uponSanitizeAttribute', hook)

  try {
    return DOMPurify.sanitize(content, config)
  }
  finally {
    DOMPurify.removeHook('uponSanitizeAttribute', hook)
  }
}
