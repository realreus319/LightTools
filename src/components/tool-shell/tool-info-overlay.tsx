'use client'

import { useState } from 'react'
import { Button } from '@appica/ui-react/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@appica/ui-react/dialog'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@appica/ui-react/drawer'
import { useMediaQuery } from '@appica/ui-react/hooks/use-media-query'
import type { Locale } from '@/i18n/config'
import type { ToolStatus } from '@/lib/tool-registry/schema'

function InfoBody({
  locale,
  localOnly,
  status,
  inputKinds,
  outputKinds,
}: {
  locale: Locale
  localOnly: boolean
  status: ToolStatus
  inputKinds: readonly string[]
  outputKinds: readonly string[]
}) {
  const zh = locale === 'zh-CN'
  const statusText =
    status === 'stable'
      ? zh
        ? '稳定版'
        : 'Stable'
      : status === 'beta'
        ? zh
          ? '测试版'
          : 'Beta'
        : zh
          ? '规划中'
          : 'Planned'

  return (
    <div className="space-y-5 text-sm leading-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [
            zh ? '数据位置' : 'Data location',
            localOnly
              ? zh
                ? '浏览器本地'
                : 'Local browser'
              : zh
                ? '视工具而定'
                : 'Tool dependent',
          ],
          [zh ? '版本状态' : 'Release status', statusText],
          [zh ? '分享方式' : 'Sharing', zh ? '仅工具路径' : 'Tool path only'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-background-muted p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold">{zh ? '处理链路' : 'Processing path'}</h3>
        <ol className="mt-2 list-decimal space-y-1 ps-5 text-muted-foreground">
          <li>
            {zh
              ? '先在浏览器校验输入类型与安全边界。'
              : 'Validate input types and safety limits in the browser first.'}
          </li>
          <li>
            {zh
              ? '重型计算优先进入 Worker / WASM，避免阻塞页面。'
              : 'Heavy computation runs in Worker / WASM where practical to protect UI responsiveness.'}
          </li>
          <li>
            {zh
              ? '结果直接从浏览器生成下载，不把内容塞进分享 URL。'
              : 'Generate downloads directly from the browser without putting content into the share URL.'}
          </li>
        </ol>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="font-semibold">{zh ? '输入' : 'Inputs'}</h3>
          <p className="mt-1 break-words text-muted-foreground">
            {inputKinds.length
              ? inputKinds.join(' · ')
              : zh
                ? '无需文件输入'
                : 'No file input required'}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">{zh ? '输出' : 'Outputs'}</h3>
          <p className="mt-1 break-words text-muted-foreground">
            {outputKinds.length ? outputKinds.join(' · ') : zh ? '页面内结果' : 'In-page result'}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ToolInfoOverlay({
  locale,
  localOnly,
  status,
  inputKinds,
  outputKinds,
}: {
  locale: Locale
  localOnly: boolean
  status: ToolStatus
  inputKinds: readonly string[]
  outputKinds: readonly string[]
}) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const zh = locale === 'zh-CN'
  const title = zh ? '工具与隐私说明' : 'Tool & privacy details'
  const description = zh
    ? '查看这个工具如何处理数据，以及它当前的发布状态。'
    : 'See how this tool handles data and its current release status.'
  const body = (
    <InfoBody
      locale={locale}
      localOnly={localOnly}
      status={status}
      inputKinds={inputKinds}
      outputKinds={outputKinds}
    />
  )

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {zh ? '处理说明' : 'Details'}
      </Button>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
          <DialogContent closeLabel={zh ? '关闭' : 'Close'}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogBody className="overflow-y-auto pb-6">{body}</DialogBody>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)} side="bottom">
          <DrawerContent closeLabel={zh ? '关闭' : 'Close'} className="max-h-[90dvh]">
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="overflow-y-auto pb-6">{body}</DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
