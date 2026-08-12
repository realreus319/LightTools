import { expect, test } from '@playwright/test'

test('homepage does not eagerly load tool WASM or PDF worker resources', async ({ page }) => {
  await page.goto('/en')
  await page.waitForLoadState('networkidle')

  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => /\.wasm(?:\?|$)|jsquash|pdf\.worker|pdfjs/i.test(url)),
  )

  expect(resources).toEqual([])
})
