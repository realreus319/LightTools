# LightTools Roadmap

> 本路线图由 `docs/product/SPECS.md` 派生。所有实现必须同时遵守 `CODESTYLE.md`。  
> 目标：从空仓库建设到可公开上线、可持续扩展、具备商业化基础的纯 Web 工具箱。

## 执行规则

- [ ] 每个重要检查点都创建独立提交，提交格式 `prefix: description`
- [ ] 每次提交前执行 `pnpm format`、`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`
- [ ] E2E 建立后，重要里程碑额外执行 `pnpm test:e2e`
- [ ] 每完成一个 bullet，将本文件对应项更新为 `[x]`
- [ ] 不用占位实现冒充完成；只有达到 `SPECS.md` Definition of Done 才可勾选

---

## M0 — 工程基线

- [ ] 初始化 Next.js App Router + React 19 + TypeScript strict + pnpm
- [ ] 配置 Tailwind CSS v4
- [ ] 集成 `@appica/ui-react` 与 ThemeProvider
- [ ] 配置 ESLint、Prettier、TypeScript、Vitest
- [ ] 配置路径别名与严格编译选项
- [ ] 建立 `src/`、`app/`、`tests/`、`docs/adr/` 目录骨架
- [ ] 建立 format/lint/typecheck/test/build 脚本
- [ ] 增加 `.editorconfig`、`.gitignore`、Node/pnpm engine 约束
- [ ] 建立最小首页并完成 Appica 样式验证
- [ ] 添加第三方许可证登记框架 `THIRD_PARTY_NOTICES.md`

**Checkpoint commit:** `init: bootstrap production web application`

---

## M1 — Design System 与 App Shell

- [ ] 定义 LightTools 品牌 tokens：背景、前景、品牌色、边框、圆角、阴影、排版
- [ ] 建立 Header、Footer、Container、Section 基础布局
- [ ] 完成浅色/深色/跟随系统主题切换
- [ ] Header 支持桌面与移动端导航
- [ ] 创建统一 `ToolCard`
- [ ] 创建统一 `CategorySection`
- [ ] 创建空状态、错误状态、加载状态、Skeleton
- [ ] 尊重 `prefers-reduced-motion`
- [ ] 完成基础键盘可访问性检查

**Checkpoint commit:** `feat: build app shell and design system`

---

## M2 — Tool Registry、路由与搜索

- [ ] 使用 Zod 定义 `ToolDefinition` schema
- [ ] 建立单一 Tool Registry 数据源
- [ ] 首页工具卡片由 Registry 生成
- [ ] 工具分类由 Registry 生成
- [ ] `/[locale]/tools/[slug]` 动态路由读取 Registry
- [ ] 建立全局工具搜索，支持标题、别名、关键词
- [ ] 搜索支持键盘操作与无结果状态
- [ ] 建立最近使用工具（仅 localStorage，保存 slug，不保存文件内容）
- [ ] 建立收藏工具（仅 localStorage）
- [ ] 建立 Related Tools 规则

**Checkpoint commit:** `feat: add registry driven tool platform`

---

## M3 — 国际化与 SEO 基础

- [ ] 完成 `zh-CN` 与 `en` locale 路由
- [ ] UI 文案全部进入 i18n 资源
- [ ] 首页 metadata
- [ ] 工具页 metadata 由 Registry + i18n 生成
- [ ] canonical / hreflang
- [ ] `robots.ts`
- [ ] `sitemap.ts` 根据稳定工具自动生成
- [ ] Breadcrumb structured data
- [ ] SoftwareApplication structured data
- [ ] Related tools 内链
- [ ] 建立工具帮助内容和 FAQ 结构，但不允许薄内容批量灌水

**Checkpoint commit:** `seo: add internationalized metadata and discovery`

---

## M4 — 通用本地文件处理框架

- [ ] 定义 `FilePolicy`
- [ ] 建立 MIME + extension 双重验证
- [ ] 建立统一 `FileDropzone`
- [ ] 支持选择文件、拖拽文件、移动端文件选择
- [ ] 支持批量文件队列
- [ ] 每个文件有独立状态、错误和重试
- [ ] 建立任务状态机
- [ ] 建立 Worker message protocol
- [ ] Worker 支持 transferable ArrayBuffer
- [ ] Worker 任务支持取消
- [ ] 批处理有并发上限
- [ ] Object URL 集中创建与释放
- [ ] ImageBitmap 生命周期集中释放
- [ ] 建立 ZIP 批量下载能力
- [ ] 建立稳定 error code 和用户友好错误映射
- [ ] 开发环境 Debug logger 不上报用户内容

**Checkpoint commit:** `feat: add local file processing foundation`

---

## M5 — 图片工具核心

### 图片压缩

- [ ] 引入并审计 jSquash JPEG codec
- [ ] 引入并审计 jSquash PNG codec
- [ ] 引入并审计 jSquash WebP codec
- [ ] 引入并审计 jSquash AVIF codec
- [ ] codec 动态加载，不进入首页 bundle
- [ ] 解码/编码在 Worker 执行
- [ ] 单张图片压缩
- [ ] 批量图片压缩
- [ ] 质量参数
- [ ] 输出格式选择
- [ ] 调整尺寸
- [ ] 输出统计：大小、节省比例、尺寸、格式
- [ ] 单个下载
- [ ] ZIP 全部下载

### 指定大小压缩

- [ ] 实现质量有界/二分搜索
- [ ] 设置最大尝试次数
- [ ] 低质量仍超目标时自动降分辨率
- [ ] 返回 targetReached 而非虚假宣称精准
- [ ] 为 target-size 算法建立单元测试

### 图片转换与调整

- [ ] JPEG/PNG/WebP/AVIF 格式转换
- [ ] alpha -> JPEG 背景色处理
- [ ] 图片缩放
- [ ] 常用尺寸预设
- [ ] 保持比例
- [ ] 默认不放大
- [ ] 图片裁剪
- [ ] 1:1、4:3、16:9 比例
- [ ] 旋转与翻转
- [ ] 清除元数据工具

**Checkpoint commits:**

- `feat: implement browser image compression`
- `feat: add target size image optimization`
- `feat: add image conversion resize and crop`
- `perf: lazy load image wasm codecs`

---

## M6 — PDF 工具

- [ ] 引入并审计 `pdf-lib`
- [ ] PDF 文件页数读取与错误处理
- [ ] PDF 合并
- [ ] 拖拽重排 PDF 文件
- [ ] PDF 拆分 range parser
- [ ] `1-3,5,8-10` 输入校验
- [ ] 单页拆分
- [ ] 指定范围生成 PDF
- [ ] 图片转 PDF
- [ ] A4 / Letter / 图片原尺寸
- [ ] 方向和边距设置
- [ ] 引入并审计 `pdfjs-dist`
- [ ] PDF 转图片
- [ ] 多页 ZIP 下载
- [ ] 加密/损坏 PDF 给出明确错误
- [ ] 大 PDF 达到内存风险时给出预警

**Checkpoint commits:**

- `feat: add local pdf merge and split tools`
- `feat: add image pdf conversion tools`

---

## M7 — 文本与开发者工具

- [ ] JSON 格式化
- [ ] JSON 压缩
- [ ] JSON 校验和定位错误
- [ ] Base64 文本编码/解码
- [ ] Base64 文件编码/解码
- [ ] URL Encode/Decode
- [ ] 文本字符/字数/行数统计
- [ ] 去重、去空行、排序
- [ ] UUID 生成
- [ ] Unix 时间戳转换
- [ ] Web Crypto SHA-256 / SHA-384 / SHA-512
- [ ] JWT 只读解析并明确“不验证签名”
- [ ] 正则测试器
- [ ] 文本 Diff
- [ ] QR Code 生成
- [ ] Cron 解释器

**Checkpoint commits:**

- `feat: add text transformation tools`
- `feat: add developer utility tools`

---

## M8 — 产品体验强化

- [ ] 工具页统一 `ToolShell`
- [ ] 工具隐私标记与“本地处理”说明
- [ ] 批任务总体进度
- [ ] 每文件进度与错误隔离
- [ ] 成功结果前后数据对比
- [ ] 图片前后对比预览
- [ ] 参数 preset
- [ ] 用户自定义 preset 先本地保存
- [ ] 复制结果按钮统一行为
- [ ] 下载命名规则统一
- [ ] Toast 反馈一致
- [ ] URL 可分享但不把敏感用户输入塞进 query string
- [ ] Mobile Drawer 与 Desktop Dialog 使用 Appica 响应式模式
- [ ] 全站空状态、错误状态和极端长文件名检查

**Checkpoint commit:** `feat: polish production tool experience`

---

## M9 — 隐私、安全、商业化基础

- [ ] `/privacy` 隐私政策页面
- [ ] `/terms` 使用条款页面
- [ ] UI 明确说明文件默认不上传
- [ ] CSP 基线
- [ ] `object-src 'none'`
- [ ] 审计 SVG/HTML 注入路径
- [ ] 确认生产环境无用户文件内容日志
- [ ] Analytics adapter，仅允许无内容事件
- [ ] Error reporter adapter，仅允许安全上下文
- [ ] Web Vitals 上报接口
- [ ] Entitlement 类型与 provider 抽象
- [ ] 不绑定具体支付平台
- [ ] `THIRD_PARTY_NOTICES.md` 填写实际依赖和许可证
- [ ] Appica UI 商业许可在正式收费前完成确认；不明确则替换
- [ ] 自动依赖许可证检查脚本
- [ ] 自动依赖漏洞检查流程

**Checkpoint commit:** `chore: harden privacy security and licensing`

---

## M10 — 测试、性能与发布门禁

- [ ] Unit：registry schema
- [ ] Unit：range parser
- [ ] Unit：target-size algorithm
- [ ] Unit：filename utilities
- [ ] Unit：file policy
- [ ] Integration：Worker lifecycle
- [ ] Integration：image codec smoke tests
- [ ] Integration：PDF merge/split
- [ ] Integration：取消任务
- [ ] Integration：批量部分失败
- [ ] Playwright：首页搜索并打开工具
- [ ] Playwright：图片压缩并下载
- [ ] Playwright：目标大小压缩
- [ ] Playwright：PDF 合并
- [ ] Playwright：JSON 格式化
- [ ] Playwright：中英文切换
- [ ] Playwright：浅色/深色
- [ ] Playwright：移动端 viewport
- [ ] Playwright：键盘基本流程
- [ ] Chrome/Edge/Firefox/Safari 手工兼容矩阵
- [ ] 首页 bundle 检查，确保 codec 未提前加载
- [ ] Lighthouse / Web Vitals 检查
- [ ] 大批量图片压力测试
- [ ] 大 PDF 内存保护测试
- [ ] 生产构建无 warning

**Checkpoint commits:**

- `test: cover critical local processing flows`
- `perf: enforce web performance budgets`

---

## M11 — 上线候选版本

- [ ] README 与真实实现一致
- [ ] 所有稳定工具满足 Definition of Done
- [ ] 删除无意义 TODO、demo 文案、mock 数据
- [ ] 404 / error boundary / global error 完整
- [ ] favicon、manifest、OG image、品牌素材齐全
- [ ] Sitemap、robots、canonical 在生产域名验证
- [ ] 隐私政策、条款、第三方 notices 可访问
- [ ] 全部 CI 门禁通过
- [ ] 做一次从新用户角度的完整 UX Review
- [ ] 做一次代码架构 Review
- [ ] 做一次依赖、许可证、安全 Review
- [ ] 标记 v1.0.0 release candidate

**Checkpoint commit:** `release: prepare lighttools v1 release candidate`

---

## v1 之后

- [ ] PWA 离线壳与 WASM 版本缓存
- [ ] 更多图片格式和高级压缩 preset
- [ ] 更多 PDF 工具
- [ ] Office 轻量纯 Web 工具（只在浏览器可可靠实现时加入）
- [ ] 用户登录与跨设备 preset（独立于文件内容）
- [ ] Pro entitlement + 支付适配层
- [ ] 企业白标与私有部署策略
- [ ] 内容增长与 SEO 数据驱动优化
- [ ] 根据真实用户使用数据调整工具优先级
