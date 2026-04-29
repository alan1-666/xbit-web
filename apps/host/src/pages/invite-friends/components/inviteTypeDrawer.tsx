import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@components/ui/drawer.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { IconCheckedCircle } from '@components/icon/IconCheckedCircle.tsx'
import { motion } from 'framer-motion'
import { useResponsive } from '@/hooks/useResponsive'

type TimeRangeOption = {
  value: string
  label: string
}

const RangeSelectItem = (props: {
  name: string
  selected: boolean
  onClick: () => void
}) => {
  const { name, selected, onClick } = props
  return (
    <div
      className="flex items-center py-4 border-b border-[#ECECED14] last:border-b-0 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="text-[16px]  text-white">{name}</div>
      </div>
      {selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <IconCheckedCircle className="size-5" />
        </motion.div>
      )}
    </div>
  )
}

type TimeRangeSelectProps = {
 
  isOpen?: boolean
  onChange: (value: string) => void
  onClose: () => void 
  value?: string
}

const TimeRangeSelect = ({ isOpen, onChange ,onClose ,value }: TimeRangeSelectProps) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()

  const RangeOptions: TimeRangeOption[] = [
    // { value: 'ALL', label: t('nodeAgent.tradingOverview.all') },
    { value: 'CONTRACT', label: t('nodeAgent.tradingOverview.futures') },
    { value: 'MEME', label: t('nodeAgent.tradingOverview.meme') },
    // { value: 'SPOT', label: t('nodeAgent.tradingOverview.spot') },
  ]

  // const selectedOption = timeRangeOptions.find(option => option.value === value) || timeRangeOptions[0]

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    onClose()
  }

  // 桌面端使用 Dialog
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full bg-[#232329] max-w-[300px] mx-auto pb-6 rounded-2xl px-0 pt-3" showDialogPrimitiveClose={false}>
          <DialogHeader className="flex align-center justify-between items-left">
            <div className='flex items-center justify-between px-4 '>
              <DialogTitle className="text-white text-lg font-medium">{t('nodeAgent.selectType')}</DialogTitle>
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer"
                onClick={onClose}
                alt=""
              />
            </div>
          </DialogHeader>
          <div className="px-4">
            {RangeOptions.map((option) => (
              <RangeSelectItem
                key={option.value}
                name={option.label}
                selected={value === option.value}
                onClick={() => handleSelect(option.value)}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // 移动端使用 Drawer
  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto pb-6 ">
        <DrawerTitle></DrawerTitle>
        <DrawerHeader className="flex justify-between items-center px-4 py-3">
          <div className="text-white text-lg font-medium">{t('nodeAgent.selectType')}</div>
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={onClose}
            alt=""
          />
        </DrawerHeader>
        <div className="px-4">
          {RangeOptions.map((option) => (
            <RangeSelectItem
              key={option.value}
              name={option.label}
              selected={value === option.value}
              onClick={() => handleSelect(option.value)}
            />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default TimeRangeSelect
