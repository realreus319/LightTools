'use client'

import { useReducer } from 'react'
import { fileQueueReducer } from './file-queue-state'

export function useFileQueue() {
  const [items, dispatch] = useReducer(fileQueueReducer, [])
  return { items, dispatch }
}
