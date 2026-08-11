# LightTools 产品与技术规格（SPECS）

> 产品名：LightTools / 轻工具  
> 产品定位：浏览器里的本地优先在线百宝箱。  
> 文档状态：v1.0，作为实现、评审、测试和商业化验收的唯一产品技术基线。  
> 核心约束：纯 Web；不依赖 Native；文件类工具默认不上传用户文件；商业化质量优先于 Demo 速度。

---

## 1. 产品目标

LightTools 是面向普通用户、办公人员、设计师、开发者和内容创作者的综合在线工具箱。用户打开网页即可处理图片、PDF、文本、数据编码、开发者常用转换等任务，不需要安装桌面软件。

产品必须具备以下长期能力：

- **Local First**：能在浏览器完成的任务全部在浏览器完成，文件默认不上传服务器。
- **Privacy First**：默认不采集文件内容、文件名、文本内容、PDF 内容、图片像素等用户数据。
- **Fast First**：工具打开快、首屏轻，重型 WASM/Worker/工具依赖按需加载。
- **SEO First**：每个工具拥有独立、可索引、可分享的稳定 URL 和完整 metadata。
- **Mobile First**：手机可完成核心工具操作，桌面端提供更高密度的批处理体验。
- **Commercial Ready**：代码、依赖、许可证、可观测性、错误处理、可访问性、测试和结构均按可收费产品标准建设。
- **Extensible**：新增一个工具不应要求修改全站路由、首页、SEO、导航等多个散落文件；工具必须由统一 registry 驱动。

### 1.1 非目标

v1 不做：

- Native / Electron / Tauri 客户端。
- 强依赖服务器上传才能工作的文件处理工具。
- 用户云盘、云端文件永久存储。
- 在线协同编辑。
- 视频转码、音视频压缩等需要超大型 WASM、服务端 FFmpeg 或高算力的能力。
- 未明确许可证可商用的第三方代码、模型、字体、素材。

---

## 2. 品牌与用户体验

### 2.1 品牌

- 中文名：**轻工具**
- 英文名：**LightTools**
- 核心口号：**打开即用，尽量在浏览器本地完成。**
- 品牌感受：轻、快、干净、可信、专业，不做传统“站长工具箱”的拥挤页面。

### 2.2 设计原则

1. 工具本身必须是页面主角，SEO 内容不得挤压首屏操作区。
2. 首屏应让用户在 3 秒内知道：这是做什么、文件是否上传、下一步怎么操作。
3. 高级选项默认折叠，基础任务一到两步完成。
4. 输出结果必须给出明确收益，例如压缩前后体积、节省比例、尺寸变化、页数变化。
5. 任何长任务都有进度、取消、错误和重试能力。
6. 用户离开页面时自动释放 Object URL、ArrayBuffer、大图 Bitmap、Worker 任务引用。
7. 拖拽、文件选择、粘贴、键盘操作均应覆盖合理场景。
8. 支持浅色/深色主题；尊重 `prefers-reduced-motion`。
9. WCAG 2.2 AA 作为可访问性目标。

---

## 3. 技术栈

### 3.1 应用框架

- Next.js App Router（使用实现时最新稳定版本，升级须通过构建、E2E 和 bundle 检查）
- React 19+
- TypeScript，`strict: true`
- pnpm，锁定 package manager 版本
- Tailwind CSS v4
- Appica UI：`@appica/ui-react`
- Appica Icons：如实际组件需要，可使用 `@appica/icons-react`

Appica UI 的集成约束：

```css
@import 'tailwindcss';
@import '@appica/ui-react/styles.css';
@source '../node_modules/@appica/ui-react/dist';
```

- 根布局必须使用 Appica `ThemeProvider`。
- 组件使用 subpath import，避免无必要的聚合导入。
- 链接保持 `<a>` / Next `Link` 的语义，不把链接伪装成 Button。
- Appica 的 `render`、Field、Form、Dialog/Drawer、Toast、Tooltip 等优先用于对应场景。
- Appica 官方当前公开描述为 free/open-source，但**正式商业发布前必须在 `THIRD_PARTY_NOTICES.md` 中记录实际安装版本与许可证；若无法确认允许商业使用，必须替换，不允许带着许可证疑问上线收费。**

### 3.2 浏览器计算

统一采用能力分层：

```text
UI / Route
  -> Tool Controller
    -> Tool Adapter
      -> Worker Pool
        -> WASM / Web API / pure JS engine
```

原则：

- CPU 密集操作不得长时间阻塞主线程。
- 图片编码、PDF 渲染、复杂 Hash、大批量处理优先进入 Web Worker。
- Worker 使用标准消息协议，不让 UI 直接依赖具体 codec。
- WASM 按工具动态加载，不进入首页主 bundle。
- 支持 `AbortController` 或等价取消协议。
- 大文件处理前先进行能力评估，避免浏览器 OOM。

### 3.3 首选依赖

> 具体版本由 lockfile 固定；引入前检查维护状态、许可证、安全性、bundle 成本。

图片：

- `@jsquash/jpeg`
- `@jsquash/png`
- `@jsquash/webp`
- `@jsquash/avif`
- `@jsquash/resize`
- 可选 `@jsquash/oxipng`

jSquash 顶层包为 Apache-2.0，codec 自身可能包含 BSD/zlib 等兼容许可证；发布时保留相应 NOTICE。

PDF：

- `pdf-lib`：PDF 合并、拆分、页面复制、图片转 PDF 等；MIT。
- `pdfjs-dist`：只在需要渲染 PDF 页面时按需加载；引入前记录实际版本许可证。

通用：

- `fflate`：ZIP 打包，批量下载。
- `zod`：工具参数、registry 和边界数据校验。
- `nanoid` 或 Web Crypto UUID：内部任务 ID。

不得因为“方便”引入整个大型 utility 库。

---

## 4. 代码与目录架构

目标目录：

```text
LightTools/
├─ app/
│  ├─ [locale]/
│  │  ├─ (marketing)/
│  │  ├─ tools/
│  │  │  └─ [slug]/
│  │  ├─ privacy/
│  │  └─ terms/
│  ├─ robots.ts
│  ├─ sitemap.ts
│  └─ globals.css
├─ src/
│  ├─ components/
│  │  ├─ app-shell/
│  │  ├─ tool-shell/
│  │  ├─ file-dropzone/
│  │  └─ common/
│  ├─ features/
│  │  └─ tools/
│  │     ├─ image-compress/
│  │     ├─ image-convert/
│  │     ├─ image-resize/
│  │     ├─ pdf-merge/
│  │     ├─ pdf-split/
│  │     ├─ json-format/
│  │     └─ ...
│  ├─ lib/
│  │  ├─ tool-registry/
│  │  ├─ workers/
│  │  ├─ files/
│  │  ├─ analytics/
│  │  ├─ errors/
│  │  └─ seo/
│  ├─ i18n/
│  └─ types/
├─ public/
│  └─ wasm/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ docs/
│  ├─ product/SPECS.md
│  └─ adr/
├─ ROADMAP.md
├─ CODESTYLE.md
├─ AGENTS.md
└─ README.md
```

### 4.1 Tool Registry

所有工具必须通过统一 registry 注册。

最小类型：

```ts
type ToolCategory = 'image' | 'pdf' | 'text' | 'developer' | 'utility'

type ToolDefinition = {
  slug: string
  category: ToolCategory
  titleKey: string
  descriptionKey: string
  keywords: string[]
  icon: string
  inputKinds: readonly string[]
  outputKinds: readonly string[]
  localOnly: boolean
  featured?: boolean
  related: readonly string[]
  status: 'stable' | 'beta' | 'planned'
}
```

Registry 驱动：

- 首页工具卡片
- 分类页
- 搜索
- sitemap
- related tools
- 页面结构化数据
- 功能开关
- 未来 Pro entitlement

禁止在多个页面手工维护相同工具列表。

---

## 5. v1 工具范围

### 5.1 图片类（P0）

#### 图片压缩

- 输入：JPEG/JPG、PNG、WebP、AVIF（解码能力不足时给清晰提示）
- 输出：原格式优先，也可切换 JPEG/WebP/AVIF
- 单张与批量
- 质量滑杆
- 保留/调整尺寸
- 指定目标体积：KB / MB
- 下载单个结果
- ZIP 下载全部
- 显示：原始大小、结果大小、节省比例、像素尺寸、输出格式
- 默认通过 Worker + WASM 处理

指定体积算法：

1. 校验 target bytes。
2. 固定尺寸下对可调质量的有损编码执行二分/有界搜索。
3. 在目标体积下选择最高可达质量。
4. 若最低质量仍超过目标，按面积比例估算下一分辨率并递进缩放。
5. 设置最大尝试次数，防止死循环。
6. 返回 `targetReached`、最终质量、尺寸、尝试次数；UI 不虚假宣称“精准”达到目标。

#### 图片格式转换

- JPEG/PNG/WebP/AVIF 互转（受 codec 能力限制）
- PNG alpha 转 JPEG 时可选背景颜色，默认白色
- 输出文件名安全化，不覆盖用户原文件

#### 图片缩放

- 按宽高、百分比、常用尺寸
- 锁定比例
- 不默认放大
- 显示最终尺寸

#### 图片裁剪

- 自由比例、1:1、4:3、16:9
- 旋转 90°
- 水平/垂直翻转
- 输出格式和质量

#### 清除图片元数据

- 通过重新编码实现隐私清理
- 明确提示重新编码可能导致体积/质量变化

### 5.2 PDF 类（P0/P1）

#### PDF 合并

- 多文件排序
- 拖拽重排
- 显示文件名和页数
- 全部浏览器本地合并

#### PDF 拆分

- 页码范围语法，如 `1-3,5,8-10`
- 单页拆分为多个文件
- 指定范围生成一个 PDF

#### 图片转 PDF

- JPG/PNG/WebP 等浏览器可读图片
- 页面尺寸：适应图片 / A4 / Letter
- 方向、边距

#### PDF 转图片

- pdf.js 渲染
- 输出 PNG/JPEG/WebP
- 可选倍率
- 多页 ZIP

### 5.3 文本与数据（P0）

- JSON 格式化 / 压缩 / 校验
- Base64 编码 / 解码（文本与文件分开）
- URL Encode / Decode
- 文本字数、字符数、行数统计
- 文本去重、去空行、排序
- 文本 Diff（P1）

### 5.4 开发者工具（P0/P1）

- UUID 生成
- 时间戳转换
- Hash：SHA-256 / SHA-384 / SHA-512，优先 Web Crypto
- JWT 解析：**仅解析，不声称验证签名**
- 正则测试器
- Cron 解释器（P1）
- 二维码生成（P1）

---

## 6. 工具页面统一 UX

每个工具页必须使用统一 `ToolShell`：

1. Breadcrumb
2. H1 + 一句话说明
3. Local Processing / Privacy 标记
4. 主要操作区
5. 参数区
6. 结果区
7. 错误/空状态
8. Related tools
9. 使用说明
10. FAQ
11. 隐私说明

文件工具主要状态：

```text
idle -> loading -> ready -> processing -> success
                           -> cancelled
                           -> error
```

必须避免：

- 页面刷新后仍显示不存在的 Object URL。
- 对已释放 Blob 保留下载按钮。
- 任务失败后 UI 永久处于 loading。
- 一个文件失败导致整个批次不可恢复。

---

## 7. 文件与内存安全

### 7.1 默认限制

限制不写死在组件内部，统一由 policy 配置：

```ts
type FilePolicy = {
  maxFiles: number
  maxFileBytes: number
  maxTotalBytes: number
  maxPixels?: number
  acceptedMimeTypes: readonly string[]
}
```

v1 建议默认：

- 图片单文件：50 MiB
- 图片总批次：250 MiB
- PDF 单文件：200 MiB
- 批次文件数：50
- 解码像素量达到高风险阈值时预警或拒绝

实际阈值需通过 Chrome/Edge/Firefox/Safari 的真机测试调整。

### 7.2 内存纪律

- 优先 transferable ArrayBuffer，减少复制。
- 处理完成后释放中间缓冲。
- Object URL 必须 revoke。
- `ImageBitmap` 必须 close。
- Worker 必须能在页面卸载或任务取消时终止。
- 批处理使用并发上限，不根据 CPU 核数无限并发。

---

## 8. 安全与隐私

### 8.1 数据原则

文件处理工具默认：

- 文件不上传服务器。
- 不记录文件名。
- 不记录文件哈希。
- 不记录输入/输出正文。
- 不把文件发给第三方分析 SDK。
- 不因错误上报自动附带用户文件内容。

允许的匿名产品事件示例：

```text
tool_opened: tool_slug, locale
job_finished: tool_slug, duration_bucket, size_bucket, success
job_failed: tool_slug, error_code, browser_family
```

禁止字段：原始文件名、文本输入、PDF 内容、图片内容、完整 JWT、用户粘贴数据。

### 8.2 Web 安全

- CSP 默认收紧；WASM Worker 所需策略明确列出。
- `object-src 'none'`。
- 不使用 `unsafe-eval`，除非被已审计依赖强制要求且有 ADR。
- HTML/SVG 预览不得直接注入未清洗字符串。
- JSON/文本结果使用文本节点，不使用不必要的 `dangerouslySetInnerHTML`。
- 外部链接使用安全 rel。
- 依赖漏洞在发布流程中检查。

---

## 9. SEO 与内容架构

每个稳定工具拥有独立 URL，例如：

```text
/zh/tools/image-compress
/zh/tools/image-convert
/zh/tools/pdf-merge
/zh/tools/json-format
/en/tools/image-compress
```

要求：

- canonical
- hreflang
- title / description
- Open Graph / Twitter metadata
- `SoftwareApplication` 或适用 schema.org 结构化数据
- Breadcrumb schema
- FAQ 仅在页面真实展示相同问答时生成
- sitemap 自动来自 Tool Registry
- robots 可配置
- 工具页正文具有真实帮助价值，禁止批量生成关键词堆砌的薄内容

SEO 页面和工具逻辑共用同一工具 slug，避免 landing page 与应用页重复竞争。

---

## 10. 国际化

v1：

- `zh-CN` 默认
- `en` 完整覆盖

规则：

- UI 文案不得散落硬编码。
- 工具名称、描述、FAQ、错误信息可翻译。
- URL locale 明确。
- 数字、日期使用 Intl API。
- 未来为 RTL 留出能力，但 v1 不强制交付阿拉伯语。

---

## 11. PWA 与离线策略

v1.1 可加入 PWA，但架构预留：

- 静态壳可缓存。
- WASM 可按版本缓存。
- 不缓存用户输入文件到 Service Worker cache。
- IndexedDB 若用于本地偏好或最近工具，不保存敏感文件正文，除非用户明确选择。

---

## 12. 商业化架构

核心工具不应该因为未来收费而重构。

### 12.1 Entitlement 抽象

预留：

```ts
type Entitlement =
  'batch-large' | 'advanced-presets' | 'no-ads' | 'saved-presets' | 'priority-codec'
```

UI 只读取 entitlement，不直接依赖支付供应商。

未来可接：Stripe / Paddle / Lemon Squeezy 等，但支付、登录不是 v1 首发阻塞项。

### 12.2 可商业化方式

可选而非同时上线：

- 免费基础工具 + Pro 批量/高级预设
- 免费 + 低干扰广告 + Pro 去广告
- 一次性 Lifetime
- 企业白标/私有部署授权

绝不通过上传用户文件换取商业化。

---

## 13. 可观测性

至少实现：

- 可关闭的匿名 analytics adapter
- error reporter adapter
- web vitals
- 工具任务性能埋点接口

生产错误必须包含：

- 稳定 error code
- tool slug
- stage
- 可安全上报的浏览器环境信息

不得上传用户文件/文本作为 debug context。

开发环境提供 debug 模式：

- Worker 生命周期日志
- codec 加载耗时
- 输入/输出字节数（仅本地 console，不发送）
- 任务状态迁移

---

## 14. 性能预算

目标以中端移动设备为基准：

- 首页不加载图片/PDF codec WASM。
- 非交互工具介绍页面不应因工具实现而强制全部 client render。
- LCP 目标 < 2.5s（真实线上 p75 目标）。
- CLS < 0.1。
- INP < 200ms。
- 首页初始 JS 应严格预算；每次引入依赖需检查 bundle。
- 重型工具依赖 route/feature 动态加载。
- 批量任务主线程长任务应尽量避免 > 50ms。

性能是发布门禁，不接受“功能正确但页面长期卡死”。

---

## 15. 浏览器支持

首发支持：

- Chrome / Edge 当前稳定版及前 2 个主版本
- Firefox 当前稳定版及前 2 个主版本
- Safari 当前稳定版及前 2 个主版本
- iOS Safari 对应当前主流系统版本

若某 codec 在 Safari 不可用：

- 显式 capability detect。
- 隐藏不支持的输出选项或展示具体原因。
- 不以 UA 字符串作为唯一判断。

---

## 16. 测试策略

### 16.1 Unit

必须覆盖：

- 文件大小格式化
- range parser
- target-size 搜索算法
- tool registry schema
- filename 生成
- MIME/extension 判断
- error mapping

### 16.2 Integration

- Worker request/response
- 图片 encode/decode 最小 fixture
- PDF merge/split
- 批任务部分失败恢复
- 取消任务

### 16.3 E2E

Playwright 覆盖：

- 首页 -> 搜索工具 -> 工具页
- 图片压缩成功下载
- 指定大小压缩
- PDF 合并
- JSON 格式化
- locale 切换
- dark mode
- keyboard-only 基本操作
- 移动 viewport

测试 fixture 必须小、可公开、许可证明确。

---

## 17. 质量门禁

每个重要里程碑提交前必须通过：

```text
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

具备 E2E 后再加：

```text
pnpm test:e2e
```

CI 后续必须复现上述步骤。

禁止：

- `any` 逃避类型问题。
- 无理由 `eslint-disable`。
- 大量 TODO 留到“以后”。
- catch 后静默吞错。
- 工具页复制粘贴同一套状态逻辑。
- 用模拟结果冒充真实压缩/转换。

---

## 18. Git 与提交策略

重要检查点提交，格式：

```text
prefix: description
```

允许 prefix：

- `init`
- `docs`
- `feat`
- `fix`
- `refactor`
- `perf`
- `test`
- `chore`
- `build`
- `seo`
- `a11y`

示例：

```text
init: bootstrap next app and appica ui
feat: add registry driven tool catalog
feat: implement local image compression worker
perf: lazy load image codecs
seo: generate tool metadata and sitemap
```

每个 commit 应可解释、可回滚，禁止一次提交把无关模块混在一起。

---

## 19. Definition of Done

一个工具只有同时满足以下条件才可标记 `stable`：

- 功能真实可用，不是 UI 占位。
- 失败场景有可恢复错误提示。
- 可取消耗时任务。
- 不泄漏 Object URL / Worker / 大内存对象。
- keyboard 可操作。
- mobile 可用。
- 中英文文案齐全。
- SEO metadata 完整。
- 单元/集成测试覆盖核心算法。
- 依赖许可证已记录。
- lint/typecheck/test/build 通过。
- 无用户文件上传行为，除非规格明确标注且 UI 明示。

---

## 20. 架构决策底线

如实现过程中需要偏离本规格，必须创建 `docs/adr/ADR-xxxx-*.md`，包含：

- 背景
- 决策
- 备选方案
- 为什么放弃备选方案
- 安全/性能/商业影响
- 回滚策略

尤其以下变更必须 ADR：

- 引入后端文件处理
- 引入 GPL/AGPL 或许可证存在商业风险的依赖
- 更换 UI 基础库
- 更换核心框架
- 大幅改变 URL/SEO 结构
- 文件持久化到 IndexedDB/云端

本规格优先级高于临时实现便利。
