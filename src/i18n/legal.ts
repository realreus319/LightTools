import type { Locale } from './config'

export type LegalDocument = {
  title: string
  description: string
  updatedLabel: string
  updated: string
  sections: readonly {
    title: string
    paragraphs: readonly string[]
    bullets?: readonly string[]
  }[]
}

type LegalKind = 'privacy' | 'terms'

const DOCUMENTS: Record<Locale, Record<LegalKind, LegalDocument>> = {
  'zh-CN': {
    privacy: {
      title: '隐私政策',
      description:
        'LightTools 采用 Local First 设计，说明我们如何处理文件、文本、浏览器存储和产品遥测。',
      updatedLabel: '更新日期',
      updated: '2026 年 8 月 12 日',
      sections: [
        {
          title: '1. 核心原则',
          paragraphs: [
            'LightTools 的文件处理功能默认在你的浏览器中完成。只要某项能力能够可靠地在浏览器本地运行，我们就不会为了处理任务而把你的文件发送到服务器。',
          ],
          bullets: [
            '默认不上传图片、PDF 或其他用户文件。',
            '默认不采集文件名、文件内容、图片像素、PDF 正文、粘贴文本或完整 JWT。',
            '下载结果由浏览器直接生成并保存。',
          ],
        },
        {
          title: '2. 浏览器本地数据',
          paragraphs: [
            '收藏、最近使用和部分工具参数预设可能保存在 localStorage 等浏览器本地存储中，用于改善使用体验。此类数据仅包含工具标识和非敏感设置，不包含用户文件或正文。你可以通过浏览器的网站数据管理功能删除这些记录。',
          ],
        },
        {
          title: '3. 产品分析与错误信息',
          paragraphs: [
            'LightTools 的遥测接口按最小化原则设计。允许的产品事件只包含工具标识、功能状态、性能数值等非内容信息；错误上报只允许稳定错误码、处理阶段和安全上下文，不应包含用户输入或文件名。默认实现可以保持关闭，未来接入服务时仍必须遵守这一边界。',
          ],
        },
        {
          title: '4. Web Vitals',
          paragraphs: [
            '我们可以收集 LCP、CLS、INP、FCP、TTFB 等页面性能指标，以改进加载和交互体验。性能接口不需要读取你的文件内容或文本输入。',
          ],
        },
        {
          title: '5. 第三方软件',
          paragraphs: [
            'LightTools 使用开源或已审核许可的软件包完成界面、图片编码、PDF 处理和压缩等功能。实际依赖及许可证记录在项目的 THIRD_PARTY_NOTICES.md 中。第三方库在浏览器内部参与计算并不意味着你的文件会被发送给这些项目的作者。',
          ],
        },
        {
          title: '6. 安全与例外',
          paragraphs: [
            '如果未来某项功能必须使用服务器，我们会在启用前明确改变产品说明和数据链路，不会把上传行为隐藏在“本地处理”工具中。法律要求、安全事件或用户主动提交给我们的内容可能需要按适用规则处理。',
          ],
        },
        {
          title: '7. 政策变更',
          paragraphs: [
            '产品能力或数据处理方式发生重要变化时，我们会更新本页的日期和说明。对 Local First 核心边界的重大改变需要在产品中清楚告知。',
          ],
        },
      ],
    },
    terms: {
      title: '使用条款',
      description:
        '使用 LightTools 前，请了解本地处理、结果责任、第三方组件和服务可用性的基本约定。',
      updatedLabel: '更新日期',
      updated: '2026 年 8 月 12 日',
      sections: [
        {
          title: '1. 服务说明',
          paragraphs: [
            'LightTools 提供运行在网页中的图片、PDF、文本和开发者工具。多数文件任务在浏览器本地执行，结果由你的设备生成。',
          ],
        },
        {
          title: '2. 合法使用',
          paragraphs: [
            '你应确保自己有权处理所选择的文件和数据，并遵守适用法律、合同义务和第三方权利。',
          ],
          bullets: [
            '不得利用服务实施违法、侵权、欺诈或破坏性活动。',
            '不得故意以异常自动化流量、恶意输入或攻击方式影响服务稳定性。',
          ],
        },
        {
          title: '3. 结果确认',
          paragraphs: [
            '浏览器、文件格式和第三方编码器都可能存在兼容性差异。对于合同、档案、生产素材或其他重要文件，请在替换原文件前检查输出结果并保留备份。LightTools 不会把近似目标体积等结果描述成无法保证的“精准值”。',
          ],
        },
        {
          title: '4. 服务可用性',
          paragraphs: [
            '我们会按生产质量标准维护工具，但不保证服务永不中断、所有浏览器都具有完全相同的编解码能力，或每种损坏、加密和异常文件都能成功处理。',
          ],
        },
        {
          title: '5. 知识产权与第三方许可',
          paragraphs: [
            'LightTools 自身代码、品牌和内容的权利归相应权利人所有。开源及第三方组件继续适用其各自许可证；相关清单以 THIRD_PARTY_NOTICES.md 和锁定依赖版本为准。',
          ],
        },
        {
          title: '6. 商业能力',
          paragraphs: [
            '未来的 Pro、批量额度、企业部署或支付能力将通过独立 entitlement 与支付适配层提供。除非产品页面明确说明，当前工具功能不代表已购买任何额外商业权益。',
          ],
        },
        {
          title: '7. 条款更新',
          paragraphs: [
            '服务范围、商业模式或法律要求变化时，我们可能更新条款。重大变化会通过合适的产品界面或文档说明。',
          ],
        },
      ],
    },
  },
  en: {
    privacy: {
      title: 'Privacy Policy',
      description:
        'How LightTools handles files, text, browser storage, and product telemetry under a Local First design.',
      updatedLabel: 'Updated',
      updated: 'August 12, 2026',
      sections: [
        {
          title: '1. Core principle',
          paragraphs: [
            'File-processing features in LightTools run in your browser by default. When a task can be performed reliably on-device, we do not send your file to a server merely to process it.',
          ],
          bullets: [
            'Images, PDFs, and other user files are not uploaded by default.',
            'We do not intentionally collect filenames, file contents, image pixels, PDF text, pasted text, or complete JWTs by default.',
            'Generated results are downloaded directly from the browser.',
          ],
        },
        {
          title: '2. Local browser data',
          paragraphs: [
            'Favorites, recently used tools, and selected parameter presets may be stored in browser storage such as localStorage. These records contain tool identifiers and non-sensitive settings, not files or document content. You can remove them through your browser site-data controls.',
          ],
        },
        {
          title: '3. Analytics and errors',
          paragraphs: [
            'LightTools telemetry interfaces follow data minimization. Product events may contain tool identifiers, feature state, and performance values; error reporting is restricted to stable error codes, processing stages, and safe context. User inputs and filenames are outside that contract. The default adapter may remain disabled, and any future provider must preserve the same boundary.',
          ],
        },
        {
          title: '4. Web Vitals',
          paragraphs: [
            'We may measure page-performance metrics such as LCP, CLS, INP, FCP, and TTFB to improve loading and interaction quality. These metrics do not require access to your files or text inputs.',
          ],
        },
        {
          title: '5. Third-party software',
          paragraphs: [
            'LightTools uses reviewed open-source or licensed packages for UI, image codecs, PDF processing, and compression. Installed dependencies and license notes are tracked in THIRD_PARTY_NOTICES.md. A library participating in local browser computation does not mean your file is sent to that library author.',
          ],
        },
        {
          title: '6. Security and exceptions',
          paragraphs: [
            'If a future feature genuinely requires a server, its data path and product copy must be changed explicitly before release; upload behavior will not be hidden inside a feature labeled as local. Legal requirements, security incidents, or content you deliberately submit to us may require separate handling under applicable rules.',
          ],
        },
        {
          title: '7. Policy changes',
          paragraphs: [
            'When product capabilities or data handling materially change, we will update this page and its date. Significant changes to the Local First boundary should be clearly disclosed in the product.',
          ],
        },
      ],
    },
    terms: {
      title: 'Terms of Use',
      description:
        'Basic terms covering local processing, result responsibility, third-party components, and service availability.',
      updatedLabel: 'Updated',
      updated: 'August 12, 2026',
      sections: [
        {
          title: '1. Service',
          paragraphs: [
            'LightTools provides browser-based image, PDF, text, and developer utilities. Most file tasks run locally and produce results on your device.',
          ],
        },
        {
          title: '2. Lawful use',
          paragraphs: [
            'You are responsible for having the right to process the files and data you select and for complying with applicable law, contractual duties, and third-party rights.',
          ],
          bullets: [
            'Do not use the service for unlawful, infringing, fraudulent, or destructive activity.',
            'Do not intentionally disrupt the service with abusive automation, malicious input, or attacks.',
          ],
        },
        {
          title: '3. Verify important results',
          paragraphs: [
            'Browsers, file formats, and third-party codecs can differ. For contracts, archives, production assets, or other important files, verify output and keep backups before replacing originals. LightTools does not claim exact target-size results when the underlying process can only provide the closest safe result.',
          ],
        },
        {
          title: '4. Availability',
          paragraphs: [
            'We maintain the product to production standards but cannot guarantee uninterrupted availability, identical codec support in every browser, or successful processing of every damaged, encrypted, or unusual file.',
          ],
        },
        {
          title: '5. Intellectual property and third-party licenses',
          paragraphs: [
            'Rights in LightTools code, branding, and content belong to their respective owners. Open-source and third-party components remain governed by their own licenses; THIRD_PARTY_NOTICES.md and the locked dependency versions are the reference for shipped packages.',
          ],
        },
        {
          title: '6. Commercial features',
          paragraphs: [
            'Future Pro features, larger batch limits, enterprise deployment, or payment capabilities will be provided through separate entitlement and payment adapters. Unless the product explicitly says otherwise, using the current tools does not imply purchase of additional commercial rights.',
          ],
        },
        {
          title: '7. Updates',
          paragraphs: [
            'We may update these terms as the service scope, commercial model, or legal requirements evolve. Material changes will be communicated through appropriate product or documentation surfaces.',
          ],
        },
      ],
    },
  },
}

export function getLegalDocument(locale: Locale, kind: LegalKind): LegalDocument {
  return DOCUMENTS[locale][kind]
}
