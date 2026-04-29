import { ReactNode } from 'react'

export interface NavigationItemData {
  key: string
  title: string
  subTitle?: string
  href?: string | (() => string)
  onClick?: () => void
  children?: NavigationItemData[]
  external?: boolean
  disabled?: boolean
  hidden?: boolean
  isActive?: (currentPath: string) => boolean
  customRender?: () => ReactNode
  icon?: ReactNode
}
