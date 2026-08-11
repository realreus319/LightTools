# LightTools Agent Execution Rules

任何代码代理在开始工作前必须完整阅读：

1. `docs/product/SPECS.md`
2. `README.md`
3. `CODESTYLE.md`
4. `ROADMAP.md`

## Goal

持续执行 `ROADMAP.md` 中尚未完成的 bulletpoints，直到项目达到可公开上线、可商业化维护的质量标准。

## 工作方式

- 从最早的未完成里程碑开始，不跨过基础架构直接堆功能。
- 每完成一个真实 bulletpoint，更新 `ROADMAP.md` 为 `[x]`。
- 重要检查点必须提交。
- 提交格式：`prefix: description`。
- 提交前必须运行：

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

- 建立 E2E 后，重要里程碑再运行：

```bash
pnpm test:e2e
```

## 代码要求

- 使用生产就绪代码，不使用 demo/mock 结果冒充真实能力。
- 注释使用中文，只写必要的技术原因、边界和陷阱。
- 不滥用注释和 token。
- 不为减少代码行数牺牲可读性。
- 任何重型 codec/PDF renderer 必须按需加载。
- CPU 密集文件处理不得长期阻塞主线程。
- 不上传用户文件，除非规格明确改变并经过 ADR。
- 不记录用户文件名、文件内容、文本内容、完整 JWT。
- 依赖引入前检查维护状态、许可证和 bundle 成本。
- 商业许可证不明确的依赖不得进入正式收费版本。

## 调试要求

- 所有可预期失败映射为稳定 error code。
- 保留可追踪的错误 cause。
- 开发模式提供足够日志定位 Worker/codec/任务状态问题。
- 生产日志不得泄露用户数据。
- 失败后 UI 必须可恢复、重试或取消。

## 变更控制

如果需要偏离 `SPECS.md` 的架构底线，先创建 ADR，再实现。

特别是以下事项不得静默决定：

- 后端上传文件
- 更换 Next.js / React 基础架构
- 更换 Appica UI
- 引入 GPL/AGPL 或商业授权不清晰依赖
- 改变公开工具 URL
- 把文件持久化到 IndexedDB 或云端

## 推荐 Goal 指令

```text
阅读 docs/product/SPECS.md、README.md、CODESTYLE.md、ROADMAP.md 和 AGENTS.md。
从 ROADMAP 中最早的未完成 bulletpoint 开始持续实现，按商业化产品标准完成整个项目。
在每个重要检查点提交，commit 使用“prefix: description”。
提交前执行格式化、lint、typecheck、test、build；建立 E2E 后同时运行 E2E。
不要使用 mock 功能冒充完成，不要滥用注释或 token。遇到架构偏离先写 ADR。
```
