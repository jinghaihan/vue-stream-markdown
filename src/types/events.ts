export type DownloadEvent = UrlDownloadEvent | ContentDownloadEvent

export interface UrlDownloadEvent {
  type: 'image'
  url: string
}

export interface ContentDownloadEvent {
  type: 'code' | 'mermaid' | 'table'
  content: string
}
