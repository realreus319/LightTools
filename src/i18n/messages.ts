import type { ToolCategory } from '@/lib/tool-registry/schema'
import type { ToolSlug } from '@/lib/tool-registry/tools'
import type { Locale } from './config'

type ToolCopy = {
  title: string
  description: string
}

type CategoryCopy = {
  title: string
  description: string
}

export type Messages = {
  brand: {
    name: string
    chineseName: string
    tagline: string
  }
  nav: {
    image: string
    pdf: string
    text: string
    developer: string
    mainLabel: string
    mobileLabel: string
    footerLabel: string
  }
  theme: {
    switchLabel: string
    system: string
    light: string
    dark: string
  }
  home: {
    privacyBadge: string
    titleLead: string
    titleAccent: string
    description: string
    browseTools: string
    privacyAction: string
    privacyEyebrow: string
    privacyTitle: string
    privacySteps: readonly [
      { number: string; title: string; description: string },
      { number: string; title: string; description: string },
      { number: string; title: string; description: string },
    ]
  }
  search: {
    label: string
    placeholder: string
    resultsLabel: string
    noResults: string
    planned: string
  }
  toolCard: {
    local: string
    stable: string
    beta: string
    planned: string
    open: string
  }
  preferences: {
    favorites: string
    recent: string
    addFavorite: string
    removeFavorite: string
  }
  toolPage: {
    breadcrumbHome: string
    localBadge: string
    plannedTitle: string
    plannedDescription: string
    relatedTitle: string
    privacyTitle: string
    privacyDescription: string
  }
  footer: {
    privacy: string
    terms: string
    github: string
  }
  categories: Record<ToolCategory, CategoryCopy>
}

const ZH_MESSAGES: Messages = {
  brand: {
    name: 'LightTools',
    chineseName: '轻工具',
    tagline: '打开即用，尽量在浏览器本地完成。',
  },
  nav: {
    image: '图片',
    pdf: 'PDF',
    text: '文本',
    developer: '开发',
    mainLabel: '主导航',
    mobileLabel: '移动端导航',
    footerLabel: '页脚导航',
  },
  theme: {
    switchLabel: '切换主题',
    system: '跟随系统',
    light: '浅色',
    dark: '深色',
  },
  home: {
    privacyBadge: '文件默认不上传',
    titleLead: '一个真正轻量的',
    titleAccent: '网页百宝箱',
    description: '图片、PDF、文本和开发者工具，打开就能用。能在浏览器本地完成的任务，就不把你的文件交给服务器。',
    browseTools: '浏览工具',
    privacyAction: '为什么更私密',
    privacyEyebrow: 'Local First',
    privacyTitle: '隐私不是一句标语，而是数据链路。',
    privacySteps: [
      { number: '01', title: '选择文件', description: '文件只进入当前浏览器会话。' },
      { number: '02', title: '本地处理', description: 'Worker / WASM 在设备上完成计算。' },
      { number: '03', title: '直接下载', description: '结果 Blob 从浏览器直接保存。' },
    ],
  },
  search: {
    label: '搜索工具',
    placeholder: '搜索图片压缩、PDF 合并、JSON…',
    resultsLabel: '搜索结果',
    noResults: '没有找到匹配的工具。',
    planned: '即将上线',
  },
  toolCard: {
    local: '本地处理',
    stable: '可用',
    beta: '测试版',
    planned: '即将上线',
    open: '打开工具',
  },
  preferences: {
    favorites: '收藏工具',
    recent: '最近使用',
    addFavorite: '收藏',
    removeFavorite: '取消收藏',
  },
  toolPage: {
    breadcrumbHome: '首页',
    localBadge: '浏览器本地处理',
    plannedTitle: '这个工具正在建设中',
    plannedDescription: '页面和产品入口已经就位，但核心处理能力尚未达到上线标准，因此不会用模拟结果冒充可用功能。',
    relatedTitle: '相关工具',
    privacyTitle: '隐私设计',
    privacyDescription: '这个工具按 Local First 架构设计。正式可用后，能在浏览器完成的处理不会上传你的文件或正文。',
  },
  footer: {
    privacy: '隐私',
    terms: '条款',
    github: 'GitHub',
  },
  categories: {
    image: { title: '图片工具', description: '压缩、转换、缩放和隐私处理，重型编码任务在浏览器 Worker 中执行。' },
    pdf: { title: 'PDF 工具', description: '合并、拆分和格式转换，尽量让合同、资料和扫描件留在本机。' },
    text: { title: '文本与数据', description: '格式化、编码和文本整理等高频轻量任务。' },
    developer: { title: '开发者工具', description: 'UUID、Hash、JWT、正则和时间戳等常用开发辅助能力。' },
    utility: { title: '实用工具', description: '不属于单一专业类别，但值得随手使用的小工具。' },
  },
}

const EN_MESSAGES: Messages = {
  brand: {
    name: 'LightTools',
    chineseName: 'LightTools',
    tagline: 'Open it, use it, and keep processing local whenever possible.',
  },
  nav: {
    image: 'Images',
    pdf: 'PDF',
    text: 'Text',
    developer: 'Developer',
    mainLabel: 'Main navigation',
    mobileLabel: 'Mobile navigation',
    footerLabel: 'Footer navigation',
  },
  theme: {
    switchLabel: 'Switch theme',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  },
  home: {
    privacyBadge: 'Files stay local by default',
    titleLead: 'A genuinely lightweight',
    titleAccent: 'web toolbox',
    description: 'Image, PDF, text, and developer utilities that work in the browser. If a job can run locally, your file does not need to leave your device.',
    browseTools: 'Browse tools',
    privacyAction: 'Why it is private',
    privacyEyebrow: 'Local First',
    privacyTitle: 'Privacy is a data path, not a slogan.',
    privacySteps: [
      { number: '01', title: 'Choose a file', description: 'The file enters only the current browser session.' },
      { number: '02', title: 'Process locally', description: 'Worker / WASM performs the computation on your device.' },
      { number: '03', title: 'Download directly', description: 'The result Blob is saved directly from the browser.' },
    ],
  },
  search: {
    label: 'Search tools',
    placeholder: 'Search image compression, PDF merge, JSON…',
    resultsLabel: 'Search results',
    noResults: 'No matching tools found.',
    planned: 'Coming soon',
  },
  toolCard: {
    local: 'Local',
    stable: 'Available',
    beta: 'Beta',
    planned: 'Coming soon',
    open: 'Open tool',
  },
  preferences: {
    favorites: 'Favorites',
    recent: 'Recently used',
    addFavorite: 'Favorite',
    removeFavorite: 'Remove favorite',
  },
  toolPage: {
    breadcrumbHome: 'Home',
    localBadge: 'Local browser processing',
    plannedTitle: 'This tool is being built',
    plannedDescription: 'The product route is ready, but the processing engine has not reached release quality. LightTools will not present simulated output as a finished feature.',
    relatedTitle: 'Related tools',
    privacyTitle: 'Privacy by design',
    privacyDescription: 'This tool follows the Local First architecture. Once released, processing that can run in the browser will not upload your files or content.',
  },
  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
    github: 'GitHub',
  },
  categories: {
    image: { title: 'Image tools', description: 'Compress, convert, resize, and sanitize images with heavy encoding work moved to browser workers.' },
    pdf: { title: 'PDF tools', description: 'Merge, split, and convert documents while keeping contracts and scans on your device whenever possible.' },
    text: { title: 'Text & data', description: 'Fast formatting, encoding, and cleanup utilities for everyday text tasks.' },
    developer: { title: 'Developer tools', description: 'Common helpers for UUIDs, hashes, JWTs, regular expressions, timestamps, and more.' },
    utility: { title: 'Utilities', description: 'Small browser tools that are useful even when they do not fit a specialist category.' },
  },
}

const TOOL_COPY: Record<Locale, Record<ToolSlug, ToolCopy>> = {
  'zh-CN': {
    'image-compress': { title: '图片压缩', description: '批量压缩 JPEG、PNG、WebP、AVIF，控制画质、尺寸和目标体积。' },
    'image-convert': { title: '图片格式转换', description: '在 JPEG、PNG、WebP、AVIF 等浏览器可处理格式之间转换。' },
    'image-resize': { title: '图片缩放', description: '按宽高、百分比或常用尺寸调整图片，并保持比例。' },
    'image-crop': { title: '图片裁剪', description: '自由裁剪或使用常用比例，并支持旋转与翻转。' },
    'image-metadata-remove': { title: '清除图片元数据', description: '通过安全重编码移除 EXIF 等元数据，降低隐私暴露。' },
    'pdf-merge': { title: 'PDF 合并', description: '排序并在浏览器中合并多个 PDF 文件。' },
    'pdf-split': { title: 'PDF 拆分', description: '按页码范围提取页面，或将 PDF 拆成多个文件。' },
    'image-to-pdf': { title: '图片转 PDF', description: '将多张图片按页面尺寸、方向和边距生成 PDF。' },
    'pdf-to-image': { title: 'PDF 转图片', description: '将 PDF 页面渲染为 PNG、JPEG 或 WebP，并支持批量下载。' },
    'json-format': { title: 'JSON 工具', description: '格式化、压缩和校验 JSON，并清楚定位语法问题。' },
    base64: { title: 'Base64 编解码', description: '对文本或文件进行 Base64 编码与解码。' },
    'url-codec': { title: 'URL 编解码', description: '执行 URL / URI 编码和解码，快速处理查询参数。' },
    'text-stats': { title: '文本统计', description: '统计字符、字数、行数等常用文本指标。' },
    'text-clean': { title: '文本整理', description: '去重、去空行、排序并清理常见文本列表。' },
    uuid: { title: 'UUID 生成', description: '使用浏览器安全能力批量生成 UUID。' },
    timestamp: { title: '时间戳转换', description: '在 Unix 时间戳与本地日期时间之间转换。' },
    hash: { title: 'Hash 计算', description: '使用 Web Crypto 计算 SHA-256、SHA-384 和 SHA-512。' },
    'jwt-decode': { title: 'JWT 解析', description: '只读解析 JWT Header 与 Payload，不把解析冒充为签名验证。' },
    regex: { title: '正则测试', description: '在浏览器中测试正则表达式、标志位与匹配结果。' },
  },
  en: {
    'image-compress': { title: 'Image Compressor', description: 'Compress JPEG, PNG, WebP, and AVIF in batches with quality, dimensions, and target size controls.' },
    'image-convert': { title: 'Image Converter', description: 'Convert between JPEG, PNG, WebP, AVIF, and other browser-supported image formats.' },
    'image-resize': { title: 'Image Resizer', description: 'Resize by dimensions, percentage, or common presets while preserving aspect ratio.' },
    'image-crop': { title: 'Image Cropper', description: 'Crop freely or to common aspect ratios, with rotation and flip controls.' },
    'image-metadata-remove': { title: 'Remove Image Metadata', description: 'Re-encode images to remove EXIF and other metadata that can expose private details.' },
    'pdf-merge': { title: 'Merge PDF', description: 'Reorder and merge multiple PDF files directly in your browser.' },
    'pdf-split': { title: 'Split PDF', description: 'Extract page ranges or split a PDF into separate files.' },
    'image-to-pdf': { title: 'Image to PDF', description: 'Build a PDF from images with page size, orientation, and margin controls.' },
    'pdf-to-image': { title: 'PDF to Image', description: 'Render PDF pages to PNG, JPEG, or WebP with batch download support.' },
    'json-format': { title: 'JSON Tools', description: 'Format, minify, and validate JSON with clear syntax errors.' },
    base64: { title: 'Base64 Encoder / Decoder', description: 'Encode or decode text and files with Base64.' },
    'url-codec': { title: 'URL Encoder / Decoder', description: 'Encode and decode URL or URI components and query values.' },
    'text-stats': { title: 'Text Statistics', description: 'Count characters, words, lines, and other common text metrics.' },
    'text-clean': { title: 'Text Cleaner', description: 'Deduplicate, remove blank lines, sort, and normalize text lists.' },
    uuid: { title: 'UUID Generator', description: 'Generate UUID values using browser-safe platform capabilities.' },
    timestamp: { title: 'Timestamp Converter', description: 'Convert between Unix timestamps and readable local date/time values.' },
    hash: { title: 'Hash Calculator', description: 'Calculate SHA-256, SHA-384, and SHA-512 with Web Crypto.' },
    'jwt-decode': { title: 'JWT Decoder', description: 'Read JWT header and payload data without pretending that decoding verifies a signature.' },
    regex: { title: 'Regex Tester', description: 'Test regular expressions, flags, and matches directly in the browser.' },
  },
}

export function getMessages(locale: Locale): Messages {
  return locale === 'zh-CN' ? ZH_MESSAGES : EN_MESSAGES
}

export function getToolCopy(locale: Locale, slug: ToolSlug): ToolCopy {
  return TOOL_COPY[locale][slug]
}
