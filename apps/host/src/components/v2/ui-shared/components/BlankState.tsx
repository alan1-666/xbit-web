import { cn } from '@/lib/utils.ts'
import { IconEmpty } from '@components/icon'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export interface BlankStateProps {
  className?: string
  text?: string
  cta?: ReactNode
}

export const BlankState = (props: BlankStateProps) => {
  const { className, text, cta } = props
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center w-full z-10',
        className,
      )}
    >
      <IconEmpty />
      <span className="text-[#FFFFFF80] text-[0.75rem] text-center max-w-[320px]">{text ?? t('history.nodata')}</span>
      <div className="mt-2">
        {cta}
      </div>
    </div>
  )
}
