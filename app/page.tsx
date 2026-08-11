import { Button } from '@appica/ui-react/button'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-6 py-20">
      <div className="max-w-3xl space-y-5">
        <p className="text-sm font-medium text-muted-foreground">LightTools · 轻工具</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">浏览器里的轻量百宝箱</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          打开即用。能在浏览器本地完成的工作，就不把你的文件交给服务器。
        </p>
      </div>
      <div>
        <Button disabled>工具目录正在初始化</Button>
      </div>
    </main>
  )
}
