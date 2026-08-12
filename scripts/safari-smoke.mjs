const endpoint = process.env.SAFARIDRIVER_URL ?? 'http://127.0.0.1:4444'
const appUrl = process.env.LIGHTTOOLS_URL ?? 'http://127.0.0.1:3000'

async function request(method, path, body) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : {}
  if (!response.ok || payload.value?.error) {
    throw new Error(`WebDriver ${method} ${path} failed: ${text}`)
  }
  return payload.value
}

const created = await request('POST', '/session', {
  capabilities: { alwaysMatch: { browserName: 'safari' } },
})
const sessionId = created.sessionId
if (!sessionId) throw new Error('SafariDriver did not return a session id')

try {
  await request('POST', `/session/${sessionId}/url`, { url: `${appUrl}/en` })
  const homepage = await request('POST', `/session/${sessionId}/execute/sync`, {
    script:
      "return { lang: document.documentElement.lang, search: Boolean(document.querySelector('#tool-search')), text: document.body.innerText.includes('LightTools') };",
    args: [],
  })
  if (homepage.lang !== 'en' || !homepage.search || !homepage.text) {
    throw new Error(`Safari homepage smoke failed: ${JSON.stringify(homepage)}`)
  }

  await request('POST', `/session/${sessionId}/url`, { url: `${appUrl}/en/tools/json-format` })
  const tool = await request('POST', `/session/${sessionId}/execute/sync`, {
    script:
      "return { heading: document.body.innerText.includes('JSON'), inputs: document.querySelectorAll('textarea').length, local: document.body.innerText.includes('Local processing') };",
    args: [],
  })
  if (!tool.heading || tool.inputs < 2 || !tool.local) {
    throw new Error(`Safari tool smoke failed: ${JSON.stringify(tool)}`)
  }

  await request('POST', `/session/${sessionId}/url`, { url: `${appUrl}/en/privacy` })
  const privacyVisible = await request('POST', `/session/${sessionId}/execute/sync`, {
    script: "return document.body.innerText.includes('Privacy Policy');",
    args: [],
  })
  if (!privacyVisible) throw new Error('Safari privacy page smoke failed')

  console.log('Native Safari compatibility smoke passed.')
} finally {
  await request('DELETE', `/session/${sessionId}`)
}
