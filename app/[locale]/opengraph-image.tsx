import { ImageResponse } from 'next/og'

export const alt = 'LightTools · 轻工具 — private browser utilities'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#f8fafc',
        color: '#111827',
        padding: '72px 84px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#6d28d9',
          color: '#fff',
          fontSize: 54,
          fontWeight: 800,
        }}
      >
        L
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 72, fontWeight: 760, letterSpacing: '-0.04em' }}>
          LightTools · 轻工具
        </div>
        <div style={{ fontSize: 32, color: '#64748b' }}>
          Images · PDFs · Text · Developer tools — processed locally in your browser
        </div>
      </div>
    </div>,
    size,
  )
}
