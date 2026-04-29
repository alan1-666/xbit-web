import { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import Text from '../common/Text'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

const PopoverNumberTX = ({
  count,
  showCountTX,
  scrollToTop,
  setShowCountTX,
}: {
  count: string
  showCountTX: boolean
  scrollToTop?: () => void

  setShowCountTX: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()

  return (
    <Popover open={showCountTX} onOpenChange={setShowCountTX}>
      <PopoverTrigger asChild>
        <span className="absolute inset-0"></span>
      </PopoverTrigger>
      <PopoverContent className="w-80 !bg-[#232329CC] border border-[#ECECED1F]" sideOffset={-140}>
        <div
          className="flex gap-2 justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            scrollToTop?.()

            setShowCountTX(false)
          }}
        >
          <Text text={t('detail.tokenDetail.countTX', { count: count as unknown as number })} fontSize={12} className="!font-[330]" />
          <img src="/images/icons/arrow-down-icon.svg" alt="Arrow Icon" className="rotate-180" />
        </div>
      </PopoverContent>
    </Popover>
  )
}
export default PopoverNumberTX
