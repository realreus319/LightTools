'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { Button } from '@appica/ui-react/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@appica/ui-react/dialog'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@appica/ui-react/drawer'

const DESKTOP_QUERY = '(min-width: 768px)'

function subscribeToDesktop(listener: () => void): () => void {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}

function getDesktopSnapshot(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches
}

function getServerDesktopSnapshot(): boolean {
  return false
}

type ResponsiveDialogProps = {
  triggerLabel: string
  title: string
  description: string
  closeLabel: string
  children: React.ReactNode
}

export function ResponsiveDialog({
  triggerLabel,
  title,
  description,
  closeLabel,
  children,
}: ResponsiveDialogProps) {
  const isDesktop = useSyncExternalStore(
    useCallback(subscribeToDesktop, []),
    getDesktopSnapshot,
    getServerDesktopSnapshot,
  )

  const trigger = (
    <Button variant="outline" size="sm">
      {triggerLabel}
    </Button>
  )

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger render={trigger} />
        <DialogContent closeLabel={closeLabel}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogBody className="pb-6 text-sm leading-6 text-muted-foreground">
            {children}
          </DialogBody>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer>
      <DrawerTrigger render={trigger} />
      <DrawerContent closeLabel={closeLabel}>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="pb-6 text-sm leading-6 text-muted-foreground">{children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
