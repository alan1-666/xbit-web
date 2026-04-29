import React, { memo } from 'react'
import { cn } from '@/lib/utils'
import { getPositionTagMeta } from './getPositionTagMeta'
import { useTranslation } from 'react-i18next'

type Props = {
  startPosition: any
  szi: any
  className?: string
  dir: any
}

export const PositionTag = memo(function PositionTag({ dir, startPosition, szi, className }: Props) {
  const { t } = useTranslation()

  // const { tagText, Icon, className: tagCls } = getPositionTagMeta(dir, startPosition, szi)
  const { tagText, Icon } = getPositionTagMeta({
    dir,
    startPosition,
    szi,
    t,
  })

  return (
    <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium', className)}>
      {tagText}
      {Icon ? <Icon className="inline-block w-4 h-4 mr-1" /> : null}
    </div>
  )
})
