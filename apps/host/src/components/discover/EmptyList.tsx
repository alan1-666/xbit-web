import useCustomTranslation from '@hooks/useCustomTranslation.ts'
import { IconEmpty } from '@components/icon'
import { cn } from '@/lib/utils'

export const EmptyList = (props: { emptyText?: string, containerClassName?: string }) => {
  const { emptyText, containerClassName } = props
  const { t } = useCustomTranslation()
  return (
    <div className={cn("flex flex-col items-center justify-center h-80", containerClassName)}>
      <IconEmpty />
      <span className="text-[#FFFFFF80] text-[0.75rem] my-2">
        {emptyText ?? t('listCoin.noData')}
      </span>
    </div>
  )
}
