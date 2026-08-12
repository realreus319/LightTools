import { expect, test } from '@playwright/test'

test('core navigation and local tool UI remain compatible', async ({ page }) => {
  await page.goto('/en')
  await expect(page.getByRole('link', { name: /LightTools/ }).first()).toBeVisible()

  const search = page.locator('#tool-search')
  await search.fill('json')
  const jsonLink = page.locator('a[href="/en/tools/json-format"]')
  await expect(jsonLink).toBeVisible()
  await jsonLink.click()

  await expect(page).toHaveURL(/\/en\/tools\/json-format$/)
  const textareas = page.locator('textarea')
  await textareas.nth(0).fill('{"compatible":true}')
  await page.getByRole('button', { name: 'Format', exact: true }).click()
  await expect(textareas.nth(1)).toHaveValue(/"compatible": true/)

  await page.getByRole('button', { name: 'Local processing details' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('locale and responsive navigation remain usable', async ({ page }) => {
  await page.goto('/en')
  await page.getByRole('link', { name: '中文' }).click()
  await expect(page).toHaveURL(/\/zh-CN$/)

  await page.setViewportSize({ width: 390, height: 844 })
  const menu = page.locator('summary')
  await expect(menu).toBeVisible()
  await menu.click()
  await expect(page.locator('nav').filter({ hasText: /图片/ }).last()).toBeVisible()
})
