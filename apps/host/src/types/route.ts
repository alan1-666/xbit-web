import React from 'react'
import { PageWrapperProps } from '@components/wrapper.tsx'

export type AppRoute = {
  path: string
  element: React.ReactNode
} & PageWrapperProps
