import { Badge } from '@appica/ui-react/badge'
import { buttonVariants } from '@appica/ui-react/button'
import { Container } from '@/components/app-shell/container'
import { SiteFooter } from '@/components/app-shell/site-footer'
import { SiteHeader } from '@/components/app-shell/site-header'
import { CategorySection } from '@/components/tool-shell/category-section'
import { ToolCard } from '@/components/tool-shell/tool-card'

const IMAGE_TOOLS = [
  {
    href: '/zh-CN/tools/image-compress',
    title: '图片压缩',
    description: '批量压缩图片，控制画质、尺寸和输出格式。',
  },
  {
    href: '/zh-CN/tools/image-convert',
    title: '图片格式转换',
    description: '在 JPEG、PNG、WebP、AVIF 之间转换。',
  },
  {
    href: '/zh-CN/tools/image-resize',
    title: '图片缩放',
    description: '按宽高、比例或常用尺寸调整图片。',
  },
] as const

const PDF_TOOLS = [
  {
    href: '/zh-CN/tools/pdf-merge',
    title: 'PDF 合并',
    description: '在浏览器中调整顺序并合并多个 PDF。',
  },
  {
    href: '/zh-CN/tools/pdf-split',
    title: 'PDF 拆分',
    description: '按页码范围提取或拆分 PDF 页面。',
  },
] as const

const DEVELOPER_TOOLS = [
  {
    href: '/zh-CN/tools/json-format',
    title: 'JSON 工具',
    description: '格式化、压缩和验证 JSON 数据。',
  },
  {
    href: '/zh-CN/tools/base64',
    title: 'Base64',
    description: '对文本与文件执行 Base64 编码和解码。',
  },
  {
    href: '/zh-CN/tools/hash',
    title: 'Hash',
    description: '使用浏览器 Web Crypto 计算 SHA 系列摘要。',
  },
] as const

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="lt-skip-link">
        跳到主要内容
      </a>
      <SiteHeader />
      <main id="main-content">
        <section className="relative overflow-hidden border-b border-border/60 py-20 sm:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-96 max-w-4xl rounded-full bg-[color-mix(in_oklab,var(--lt-brand)_12%,transparent)] blur-3xl"
          />
          <Container>
            <div className="max-w-3xl">
              <Badge variant="soft">文件默认不上传</Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">
                一个真正轻量的
                <span className="text-[var(--lt-brand)]">网页百宝箱</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                图片、PDF、文本和开发者工具，打开就能用。能在浏览器本地完成的任务，就不把你的文件交给服务器。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#image-tools" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  浏览工具
                </a>
                <a href="#privacy-first" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  为什么更私密
                </a>
              </div>
            </div>
          </Container>
        </section>

        <Container className="py-6 sm:py-10">
          <CategorySection id="image-tools" title="图片工具" description="图片编码和处理将由浏览器本地 Worker 执行。">
            {IMAGE_TOOLS.map((tool) => (
              <ToolCard key={tool.href} {...tool} category="Image" disabled />
            ))}
          </CategorySection>

          <CategorySection id="pdf-tools" title="PDF 工具" description="无需把合同、资料或扫描件上传给第三方服务器。">
            {PDF_TOOLS.map((tool) => (
              <ToolCard key={tool.href} {...tool} category="PDF" disabled />
            ))}
          </CategorySection>

          <CategorySection id="developer-tools" title="文本与开发者工具" description="高频小工具保持快速、可复制、可预测。">
            {DEVELOPER_TOOLS.map((tool) => (
              <ToolCard key={tool.href} {...tool} category="Developer" disabled />
            ))}
          </CategorySection>
        </Container>

        <section id="privacy-first" className="border-t border-border/60 bg-background-muted/40 py-14 sm:py-20">
          <Container>
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold text-[var(--lt-brand)]">Local First</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">隐私不是一句标语，而是数据链路。</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['01', '选择文件', '文件只进入当前浏览器会话。'],
                  ['02', '本地处理', 'Worker / WASM 在设备上完成计算。'],
                  ['03', '直接下载', '结果 Blob 从浏览器直接保存。'],
                ].map(([number, title, description]) => (
                  <div key={number} className="rounded-2xl border border-border bg-background p-5">
                    <span className="text-xs font-semibold text-[var(--lt-brand)]">{number}</span>
                    <h3 className="mt-4 font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
