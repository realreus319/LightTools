# LightTools / 轻工具

**LightTools 是一个打开即用、尽量在浏览器本地完成处理的现代在线工具箱。**

它不是传统堆满链接的“站长工具站”，而是一套面向真实用户的 Web 产品：统一的交互、统一的工具框架、统一的隐私标准，以及可以长期扩展到几十甚至上百个工具的架构。

> 当前仓库正在按照 `docs/product/SPECS.md` 与 `ROADMAP.md` 建设。本文描述的是项目完成后的目标形态。

## 完成后的 LightTools 会是什么样

用户进入网站后，可以通过分类、搜索、最近使用和收藏快速找到工具。图片、PDF 等文件类功能默认在浏览器本地处理，不需要把私人文件上传到服务器。

首页会提供：

- 全局工具搜索
- 常用/推荐工具
- 图片、PDF、文本、开发者、实用工具分类
- 最近使用
- 收藏
- 清晰的“本地处理、保护隐私”产品说明

每个工具都拥有独立 URL，可直接收藏、分享和被搜索引擎索引。

## 核心工具

### 图片

- 图片压缩
- 压缩到指定 KB / MB
- JPEG / PNG / WebP / AVIF 格式转换
- 图片缩放
- 图片裁剪
- 旋转 / 翻转
- 清除图片元数据
- 批量处理与 ZIP 下载

图片编码由 Web Worker + WebAssembly 执行，尽量避免阻塞页面。

### PDF

- PDF 合并
- PDF 拆分
- 图片转 PDF
- PDF 转图片

文件默认只存在于当前浏览器会话中。

### 文本与数据

- JSON 格式化、压缩、校验
- Base64 编码 / 解码
- URL Encode / Decode
- 文本字数、字符数、行数统计
- 去重、去空行、排序
- 文本 Diff

### 开发者工具

- UUID
- Unix 时间戳
- SHA-256 / SHA-384 / SHA-512
- JWT 只读解析
- 正则测试
- Cron 解释
- 二维码生成

## 产品原则

### Local First

能在浏览器完成的工作，不交给服务器。

### Privacy First

默认不上传文件，不记录文件名、文件内容、用户粘贴文本、完整 JWT 等敏感信息。

### Fast First

首页不会提前加载图片 codec、PDF renderer 等重型依赖。WASM 和 Worker 只在用户真正打开对应工具时加载。

### Commercial Ready

项目从第一天就按可商业化产品建设：

- 明确依赖许可证
- 完整错误处理
- 类型安全
- 自动化测试
- SEO
- Web Vitals
- CSP 与安全边界
- 可访问性
- 未来 Pro entitlement 抽象
- 支付平台可替换，不侵入工具核心

## 技术架构

```text
Next.js App Router
        │
        ├─ Server-rendered marketing / SEO shell
        │
        └─ Interactive tool islands
                │
                ▼
          Tool Controller
                │
                ▼
           Tool Adapter
                │
                ▼
            Worker Pool
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
      WASM    Web API   pure JS
```

主要技术：

- Next.js App Router
- React 19+
- TypeScript strict
- Tailwind CSS v4
- Appica UI
- Web Worker
- WebAssembly
- jSquash image codecs
- pdf-lib / pdf.js
- Zod
- Vitest
- Playwright

## UI

LightTools 使用 Appica UI 作为基础组件系统，并在其 token 体系上建立自己的品牌层。

目标体验：

- 清爽、现代，不堆砌
- 手机和桌面都真正可用
- 浅色 / 深色 / 跟随系统
- 键盘可操作
- 尊重 reduced motion
- 工具操作区始终优先于 SEO 内容

## 目录约定

```text
app/                       Next.js routes
src/components/            跨功能 UI 与 App Shell
src/features/tools/        各工具独立 feature
src/lib/tool-registry/     工具唯一注册源
src/lib/workers/           Worker 基础设施
src/lib/files/             文件策略与生命周期
src/i18n/                  国际化资源
tests/                     单元、集成、E2E
docs/product/SPECS.md      产品与技术规格
ROADMAP.md                 项目路线图
CODESTYLE.md               代码规范
AGENTS.md                  代码代理执行规则
```

## 开发原则

任何实现都必须优先阅读：

1. `docs/product/SPECS.md`
2. `README.md`
3. `CODESTYLE.md`
4. `ROADMAP.md`
5. `AGENTS.md`

路线图每个重要检查点都需要独立 Git commit，格式：

```text
prefix: description
```

例如：

```text
init: bootstrap production web application
feat: add registry driven tool platform
feat: implement browser image compression
perf: lazy load image wasm codecs
```

提交前必须格式化并运行质量门禁。

## 隐私

LightTools 的文件工具默认遵循：

```text
用户文件
   │
   ▼
浏览器内存
   │
   ├─ Web Worker
   ├─ WASM codec
   └─ Web API
   │
   ▼
结果 Blob
   │
   ▼
本地下载
```

服务器不应出现在默认文件处理数据链路里。

## 商业化方向

架构会为以下模式预留能力，但不会让支付逻辑侵入工具核心：

- 免费基础工具 + Pro 高级能力
- 更大批量处理
- 高级 preset
- 保存 preset
- 去广告
- Lifetime license
- 企业白标 / 私有部署

所有商业化设计都必须保持文件本地处理这一核心信任优势。

## 项目状态

请以 [`ROADMAP.md`](./ROADMAP.md) 为真实进度来源。

## License

项目自身许可证将在商业发布策略确定后明确。第三方依赖许可证统一记录在 `THIRD_PARTY_NOTICES.md`，正式收费发布前必须完成完整许可证审计。
