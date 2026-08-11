type CreateObjectUrl = (blob: Blob) => string
type RevokeObjectUrl = (url: string) => void

export class ObjectUrlManager {
  private readonly urls = new Set<string>()

  constructor(
    private readonly createUrl: CreateObjectUrl = (blob) => URL.createObjectURL(blob),
    private readonly revokeUrl: RevokeObjectUrl = (url) => URL.revokeObjectURL(url),
  ) {}

  create(blob: Blob): string {
    const url = this.createUrl(blob)
    this.urls.add(url)
    return url
  }

  revoke(url: string): void {
    if (!this.urls.delete(url)) return
    this.revokeUrl(url)
  }

  revokeAll(): void {
    for (const url of this.urls) {
      this.revokeUrl(url)
    }
    this.urls.clear()
  }

  get size(): number {
    return this.urls.size
  }
}
