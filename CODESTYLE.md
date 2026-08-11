# LightTools Code Style

> 本文件是所有人工与代码代理共同遵守的代码规则。  
> 原则：可读、可调试、可测试、可维护、可商业化；不要为“看起来聪明”增加复杂度。

## 1. 语言与注释

- 源码、类型、变量、函数、文件名使用英文。
- **代码注释使用中文。**
- 用户可见文案通过 i18n 管理，不把中文或英文业务文案散落在组件中。
- 注释只解释“为什么”“边界条件”“技术陷阱”，不要翻译代码本身。
- 不写大段教程式注释。
- 不写无意义注释，例如：

```ts
// 设置 loading 为 true
setLoading(true)
```

- 对 WASM、Worker、浏览器兼容、内存释放、非直观算法可写必要技术注释。
- TODO 必须能执行，并优先转 Issue；不可长期遗留大量 TODO/FIXME。

## 2. 格式化

- 所有代码提交前必须运行格式化。
- Prettier 是最终格式标准，不手工与格式化器对抗。
- import 排序由统一规则完成。
- 禁止仅为个人审美制造无功能意义的格式 diff。

## 3. TypeScript

- `strict: true`。
- 禁止裸 `any`。只有第三方边界确实无法描述时才能局部使用，并写中文原因注释。
- 优先 `unknown` + runtime narrowing。
- 外部输入必须经过 Zod 或明确校验。
- 公共 API、registry、Worker message、adapter 边界必须有显式类型。
- 不滥用类型断言 `as`。
- 不使用非空断言 `!` 掩盖真实空值问题。
- 能用 discriminated union 表示状态时，不用多个互相矛盾的 boolean。

推荐：

```ts
type JobState =
  | { status: 'idle' }
  | { status: 'processing'; progress: number }
  | { status: 'success'; result: JobResult }
  | { status: 'error'; error: ToolError }
```

不推荐：

```ts
type State = {
  loading: boolean
  success: boolean
  failed: boolean
}
```

## 4. React / Next.js

- 默认使用 Server Component；只有真正需要浏览器状态、事件、Worker、DOM API 时才加 `'use client'`。
- 不把整个页面因为一个按钮而升级成 Client Component；将交互岛下沉。
- 不在 render 过程中执行有副作用的浏览器逻辑。
- Effect 只用于与 React 外部系统同步，不把普通派生状态塞进 Effect。
- 组件尽量纯；复杂业务状态进入 feature/controller/hook。
- 避免超大组件。一个文件如果同时负责 UI、文件解析、codec、下载和 analytics，应拆分。
- props 保持语义明确，避免 `config: Record<string, unknown>` 这种万能对象。
- 列表 key 使用稳定业务 ID，禁止无脑使用数组 index。
- Appica 组件通过 subpath import。

## 5. Appica UI

- Appica UI 是默认基础组件库，不重复造 Button/Input/Dialog/Drawer/Toast 等通用组件。
- 业务组件可以组合 Appica，而不是 fork Appica 源码。
- 链接保持链接语义；不要把 `<a>` 通过 Button `render` 伪装成 button semantics。
- `className` 覆盖遵循 Appica composition 文档。
- 使用 ThemeProvider；主题变量集中覆盖，不在页面里散落硬编码主题色。
- 新增复杂交互前先确认 Appica 是否已有组件。

## 6. Tailwind CSS

- 使用 Tailwind v4。
- 颜色、圆角、阴影等品牌视觉优先通过 tokens/CSS variables 管理。
- 禁止在几十个组件中复制完全相同的长 class 字符串。
- 可复用的视觉结构抽成业务组件，而不是创建过度抽象的 class 工厂。
- 响应式优先 mobile-first。
- 使用逻辑方向属性时优先 `start/end`、`ms/me`、`ps/pe`，为未来 RTL 留余地。

## 7. 文件与功能组织

按 feature 组织业务，不按“hooks/components/utils”把一个功能拆散到全项目：

```text
src/features/tools/image-compress/
├─ components/
├─ image-compress.tool.ts
├─ image-compress.worker.ts
├─ image-compress.service.ts
├─ image-compress.types.ts
└─ __tests__/
```

真正跨 feature 的能力才进入：

```text
src/lib/
src/components/common/
```

禁止 `utils.ts` 变成数千行杂物间。工具函数按领域命名：

```text
files/format-file-size.ts
files/safe-output-name.ts
pdf/parse-page-ranges.ts
```

## 8. Tool Registry

- 工具元数据只维护一份。
- 新工具必须先注册 schema 合法的数据，再实现页面。
- slug 一旦公开应视为产品 URL API，修改要考虑 redirect/SEO。
- registry 不直接 import 重型 codec；只保存轻量 metadata 和 lazy loader。

## 9. Worker 与 WASM

- CPU 密集任务放 Worker。
- UI 不直接调用具体 codec API，通过 adapter/service 层。
- Worker message 必须可判别：

```ts
type WorkerRequest =
  { type: 'compress-image'; id: string; payload: CompressPayload } | { type: 'cancel'; id: string }
```

- 大 ArrayBuffer 使用 transferables，避免复制。
- 每个 Worker 任务都必须有清理路径。
- 页面卸载、任务取消、失败、成功都应释放资源。
- 不捕获异常后静默失败。
- WASM 初始化失败必须转换为稳定业务错误代码。

## 10. 文件处理

- 不信任 `file.type`；结合扩展名、magic bytes 或实际 decoder 结果判断。
- 文件大小、数量、像素数受统一 FilePolicy 控制。
- Object URL 谁创建谁释放，或由统一 manager 管理。
- `ImageBitmap` 用完 `close()`。
- 不把 File/Blob/ArrayBuffer 放进全局长生命周期 store。
- 不把用户文件内容写入 localStorage。
- 不在 analytics/error reporting 中上报用户文件名或正文。

## 11. 错误处理与可调试性

- 每个可预期错误有稳定 `code`，例如：

```text
FILE_TOO_LARGE
UNSUPPORTED_FORMAT
DECODE_FAILED
ENCODE_FAILED
TARGET_SIZE_UNREACHABLE
PDF_ENCRYPTED
WORKER_CRASHED
```

- 对用户展示可理解文案，对开发环境保留技术 cause。
- 使用 `Error` 的 `cause` 保存底层错误链，而不是拼字符串。
- catch 块至少要做：恢复状态、映射错误、记录安全 debug 信息中的一种。
- 禁止空 catch。
- Debug log 必须可关闭，生产默认不输出敏感信息。

## 12. 函数与复杂度

- 函数只做一件主要事情。
- 尽量使用 guard clauses 减少深层嵌套。
- 三层以上嵌套通常意味着需要重构。
- 算法代码与 UI 分离。
- 不为了减少行数写晦涩的一行表达式。
- 不创建只有一次使用、却隐藏业务含义的过度抽象。

## 13. 命名

- React component：`PascalCase`
- function/variable：`camelCase`
- constant：语义常量可 `UPPER_SNAKE_CASE`
- boolean：`is/has/can/should`
- event handler：`handleXxx`
- props callback：`onXxx`
- worker message：动词 + 领域，例如 `compress-image`
- error code：`UPPER_SNAKE_CASE`
- 文件名默认 kebab-case；React 组件可使用 kebab-case 文件 + PascalCase export。

## 14. 测试

- 测试业务行为，不测试实现细节。
- 修复 bug 时优先先补复现测试。
- 算法边界必须测试：0、空输入、最大值、非法格式、极端比例、取消。
- 文件 fixture 小而明确，禁止提交超大二进制测试文件。
- codec smoke test 验证“真实执行”，禁止 mock 掉核心功能后宣称通过。

## 15. 性能

- 首页禁止静态 import codec/PDF renderer。
- 新增依赖前考虑 bundle 大小与是否可动态导入。
- 大量文件处理使用并发限制。
- 避免在 state 中重复存储巨大二进制数据。
- 对昂贵计算先 profile，再优化；不要凭感觉写复杂缓存。

## 16. 安全

- 不使用不必要的 `dangerouslySetInnerHTML`。
- SVG/HTML 用户输入必须按不可信内容处理。
- JWT 工具不得把 decode 描述成 verify。
- 不在 URL query 中默认存储敏感输入。
- 外部依赖必须明确许可证和用途。
- 不引入来历不明的复制代码。

## 17. i18n

- 用户可见文本必须使用 message key。
- 中文是默认产品体验，但英文不是机器占位翻译，必须可读。
- 错误 code 与文案分离。
- 数字、日期、字节单位使用 Intl 或统一 formatter。

## 18. Git

提交格式：

```text
prefix: description
```

- description 使用英文、祈使/结果描述均可，但保持短且明确。
- 一次提交一个逻辑目的。
- 不提交格式化和大功能混杂的无关 diff。
- 不提交 `.env`、密钥、真实用户文件。
- 提交前必须格式化。

## 19. 生产就绪要求

禁止以下“Demo 写法”进入稳定代码：

- `console.log(file)` 输出用户文件。
- 用 setTimeout 模拟进度并标记功能完成。
- hardcode 假压缩率。
- mock Blob 作为下载结果。
- 页面内手写重复工具列表。
- 无限制 Promise.all 处理几十个大文件。
- 大文件全部复制多份 ArrayBuffer。
- 对失败只显示 `Something went wrong` 而没有恢复方式。
- 依赖版本使用不受控的 `latest`。

最终标准：代码应该能让下一位工程师容易定位问题、增加工具、替换 codec、做性能分析和继续商业化，而不是只能由最初作者维护。
