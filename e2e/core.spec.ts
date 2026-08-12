import { expect, test } from '@playwright/test'
import { PDFDocument } from 'pdf-lib'

const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lI9pWQAAAABJRU5ErkJggg==',
  'base64',
)

async function createPdf(label: string): Promise<Buffer> {
  const document = await PDFDocument.create()
  const page = document.addPage([320, 240])
  page.drawText(label, { x: 24, y: 24 })
  return Buffer.from(await document.save())
}

test('homepage search supports keyboard navigation and opens a tool', async ({ page }) => {
  await page.goto('/en')
  const search = page.locator('#tool-search')
  await search.fill('json')
  await expect(page.locator('a[href="/en/tools/json-format"]')).toBeVisible()
  await search.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/en\/tools\/json-format$/)
})

test('JSON formatter produces formatted output', async ({ page }) => {
  await page.goto('/en/tools/json-format')
  const textareas = page.locator('textarea')
  await textareas.nth(0).fill('{"a":1,"b":[2,3]}')
  await page.getByRole('button', { name: 'Format', exact: true }).click()
  await expect(textareas.nth(1)).toHaveValue(/"a": 1/)
  await expect(textareas.nth(1)).toHaveValue(/"b": \[/)
})

test('image compression runs real PNG/WebP codecs, target-size logic, and download', async ({ page }) => {
  await page.goto('/en/tools/image-compress')
  await page.getByLabel('Output format').selectOption('image/webp')
  await page.getByLabel('Target size (KB, optional)').fill('1')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: ONE_PIXEL_PNG,
  })

  await expect(page.getByText('Complete', { exact: true })).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/Encode attempts/)).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.webp$/)
})

test('PDF merge validates pages, merges locally, and downloads a result', async ({ page }) => {
  await page.goto('/en/tools/pdf-merge')
  await page.locator('input[type="file"]').setInputFiles([
    { name: 'first.pdf', mimeType: 'application/pdf', buffer: await createPdf('first') },
    { name: 'second.pdf', mimeType: 'application/pdf', buffer: await createPdf('second') },
  ])

  await expect(page.getByText(/1 pages/).first()).toBeVisible({ timeout: 20_000 })
  const merge = page.getByRole('button', { name: 'Merge PDFs', exact: true })
  await expect(merge).toBeEnabled()
  await merge.click()
  const downloadButton = page.getByRole('button', { name: 'Download result', exact: true })
  await expect(downloadButton).toBeVisible({ timeout: 20_000 })
  const downloadPromise = page.waitForEvent('download')
  await downloadButton.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('lighttools-merged.pdf')
})

test('locale, theme, responsive drawer, and mobile navigation remain usable', async ({ page }) => {
  await page.goto('/en')
  await page.getByRole('link', { name: '中文' }).click()
  await expect(page).toHaveURL(/\/zh-CN$/)
  await page.getByRole('link', { name: 'EN' }).click()
  await expect(page).toHaveURL(/\/en$/)

  const themeButton = page.getByRole('button', { name: /theme/i })
  await themeButton.click()
  await expect(themeButton).toContainText('Light')
  await themeButton.click()
  await expect(themeButton).toContainText('Dark')

  await page.setViewportSize({ width: 390, height: 844 })
  const menu = page.locator('summary')
  await expect(menu).toBeVisible()
  await menu.click()
  await expect(page.locator('nav').filter({ hasText: /Image/ }).last()).toBeVisible()

  await page.goto('/en/tools/json-format')
  await page.getByRole('button', { name: 'Local processing details' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('How this tool handles your data')).toBeVisible()
})
