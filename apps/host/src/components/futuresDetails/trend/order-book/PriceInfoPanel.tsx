
import Text from '@/components/common/Text'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent,DrawerHeader,DrawerTitle } from '@/components/ui/drawer'
import { DialogTitle } from '@radix-ui/react-dialog'
import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

interface PriceInfoPanelProps {
  open: boolean
  type: 'LatestPrice' | 'IndexPrice' | 'MarkPrice'
  setOpen: (open: boolean) => void
}

const PriceInfoPanel: React.FC<PriceInfoPanelProps> = ({ open, setOpen, type }) => {
  const { t } = useTranslation()

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
        <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
          <DrawerTitle className="flex items-center">
            <div className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">
              {type === 'LatestPrice' ? t('modifyOrder.latestPrice') : type === 'IndexPrice' ? t('position.indexPrice') : t('position.markPrice')}
            </div>
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-3">
          <div className="text-[calc(1rem*(15/16))] leading-[calc(1rem*(22/16))] text-[#FFFFFFB2]">
            {type === 'LatestPrice' ? t('orderBook.desc.theLatestPrice') : type === 'IndexPrice' ? t('orderBook.desc.theIndexPrice') : t('orderBook.desc.theMarkPrice')}
          </div>

          <div className="flex justify-center items-center flex-row gap-2.5 mt-9 mb-8">
						<Button variant="purpleDefault" className="h-[44px] text-white rounded-[50px] text-[calc(1rem*(18/16))] w-full"  onClick={() => setOpen(false)}>
              {t('assets.overview.estimatedAssetsAgree')}
						</Button>
					</div>
          
        </div>
      </DrawerContent>
    </Drawer>
    
  )
}

export default memo(PriceInfoPanel)
