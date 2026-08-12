'use client'

import { useRef, useState } from 'react'
import { Button } from '@appica/ui-react/button'
import type { FilePolicy } from '@/lib/files/file-policy'

type FileDropzoneLabels = {
  title: string
  description: string
  chooseFiles: string
  dropActive: string
}

type FileDropzoneProps = {
  policy: FilePolicy
  labels: FileDropzoneLabels
  multiple?: boolean
  disabled?: boolean
  onFilesSelected(files: File[]): void
}

export function FileDropzone({
  policy,
  labels,
  multiple = true,
  disabled = false,
  onFilesSelected,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const accept = policy.acceptedMimeTypes.join(',')

  const selectFiles = (files: FileList | null) => {
    if (!files || disabled) return
    onFilesSelected(Array.from(files))
  }

  return (
    <div
      className={`rounded-3xl border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${
        isDragging ? 'border-[var(--lt-brand)] bg-background-muted' : 'border-border bg-background'
      }`}
      onDragEnter={(event) => {
        event.preventDefault()
        if (!disabled) setIsDragging(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        setIsDragging(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragging(false)
        selectFiles(event.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          selectFiles(event.currentTarget.files)
          event.currentTarget.value = ''
        }}
      />
      <h2 className="text-lg font-semibold">{isDragging ? labels.dropActive : labels.title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {labels.description}
      </p>
      <Button
        type="button"
        className="mt-5"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {labels.chooseFiles}
      </Button>
    </div>
  )
}
