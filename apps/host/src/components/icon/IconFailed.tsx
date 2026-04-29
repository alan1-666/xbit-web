import { cn } from '@/lib/utils'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

type IconFailedProps = {
  className?: string
  iconClassName?: string
  textClassName?: string
}

const IconFailed: FC<IconFailedProps> = ({ className, iconClassName, textClassName }) => {
  const { t } = useTranslation()
  return (
    <div className={cn('flex items-center gap-1 font-[400] text-[12px]', className)}>
      <img alt="icon status" className={cn('w-3 h-3', iconClassName)} src="/images/icons/icon-x-fill.svg" />
      <span className={cn(textClassName)}>{t('orderForm.errors.orderFailed')}</span>
    </div>
  )
}

export default IconFailed