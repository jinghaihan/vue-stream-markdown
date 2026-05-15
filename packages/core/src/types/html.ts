export type HtmlAstNode = HtmlAstElementNode | HtmlAstTextNode

export interface HtmlAstElementNode {
  type: 'element'
  tag: string
  attrs: Record<string, string>
  children: HtmlAstNode[]
}

export interface HtmlAstTextNode {
  type: 'text'
  value: string
}
