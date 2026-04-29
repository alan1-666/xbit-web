import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import React from 'react'
import { Button } from '@components/ui/button.tsx'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@components/ui/drawer.tsx'
import { X } from 'lucide-react'
import { PlatformType, PoolTransactionType } from '@/types/enums.ts'
import ButtonGradient from '../common/buttons/ButtonGradient'


type FilterPoolTransactionTypeProps = {
  open: boolean
  currentPlatform?: PlatformType
  currentType: PoolTransactionType

  setOpen: (value: boolean) => void
  updatePlatform?: (platform: PlatformType) => void
  updateTransactionType: (type: PoolTransactionType) => void
}

const FilterPoolTransactionType = React.memo(({
  updateTransactionType,
  currentType,
  currentPlatform = PlatformType.All,
  updatePlatform,
  open,
  setOpen
}: FilterPoolTransactionTypeProps) => {
  const { t } = useTranslation()
  const [currentTypeState, setCurrentTypeState] = useState<PoolTransactionType>(currentType)
  const [currentPlatformState, setCurrentTypePlatformState] = useState<PlatformType>(currentPlatform)

  const handleClickPlatformFilterItem = (platform: PlatformType) => {
    if (updatePlatform) {
      setCurrentTypePlatformState(platform)
    }
  }

  const handleReset = () => {
    setCurrentTypeState(PoolTransactionType.All)
    if (updatePlatform) {
      setCurrentTypePlatformState(PlatformType.All)
    }
  }

  const handleApply = () => {
    updateTransactionType(currentTypeState)
    if (updatePlatform) {
      updatePlatform(currentPlatformState)
    }
    setOpen(false)
  }

  const getPlatformLabel = (platform: PlatformType): string => {
    switch (platform) {
      case PlatformType.All:
        return t('detail.tabs.all')
      case PlatformType.MeteoraAMM:
        return t('detail.platforms.meteoraAMM')
      case PlatformType.MeteoraDLMM:
        return t('detail.platforms.meteoraDLMM')
      case PlatformType.RaydiumAMM:
        return t('detail.platforms.raydiumAMM')
      case PlatformType.RaydiumCLMM:
        return t('detail.platforms.raydiumCLMM')
      case PlatformType.RaydiumCPMM:
        return t('detail.platforms.raydiumCPMM')
      case PlatformType.PumpAMM:
        return t('detail.platforms.pumpAMM')
      case PlatformType.OrcaWhirlpools:
        return t('detail.platforms.orcaWhirlpools')
      case PlatformType.Others:
        return t('detail.platforms.others')
      default:
        return platform
    }
  }

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] max-h-[80vh] mx-auto">
          <DrawerHeader>
            <DrawerTitle className="mt-1.5">
              <div className="text-[calc(1rem*(22/16))] leading-[1] app-font-regular text-left">
                {t('detail.tokenDetail.finalType')}
              </div>
            </DrawerTitle>

            <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="size-5" />
            </DrawerClose>
          </DrawerHeader>

          <DrawerDescription></DrawerDescription>
          <DrawerFooter className="pb-6 overflow-auto">
            <div className="mb-6">
              <ul className="flex flex-col text-[14px]">
                <li
                  className="flex justify-between items-center py-[18px] cursor-pointer border-b-[0.5px] border-b-[#ECECED14]"
                  onClick={() => setCurrentTypeState(PoolTransactionType.All)}
                >
                  <span>{t('detail.tabs.all')}</span>
                  {currentTypeState === PoolTransactionType.All && (
                    <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="ic tick" />
                  )}
                </li>
                <li
                  className="flex justify-between items-center py-[18px] cursor-pointer border-b-[0.5px] border-b-[#ECECED14]"
                  onClick={() => setCurrentTypeState(PoolTransactionType.SingleSideLiquidity)}
                >
                  <span>{t('history.singleSideLiquidity')}</span>
                  {currentTypeState === PoolTransactionType.SingleSideLiquidity && (
                    <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="ic tick" />
                  )}
                </li>
                <li
                  className="flex justify-between items-center py-[18px] cursor-pointer border-b-[0.5px] border-b-[#ECECED14]"
                  onClick={() => setCurrentTypeState(PoolTransactionType.AddLiquidity)}
                >
                  <span>{t('history.addLiquidity')}</span>
                  {currentTypeState === PoolTransactionType.AddLiquidity && (
                    <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="ic tick" />
                  )}
                </li>
                <li
                  className="flex justify-between items-center py-[18px] cursor-pointer border-b-[0.5px] border-b-[#ECECED14]"
                  onClick={() => setCurrentTypeState(PoolTransactionType.RemoveLiquidity)}
                >
                  <span>{t('history.removeLiquidity')}</span>
                  {currentTypeState === PoolTransactionType.RemoveLiquidity && (
                    <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="ic tick" />
                  )}
                </li>
              </ul>
            </div>

            {updatePlatform && (
              <div className="mb-6 hidden">
                <h3 className="text-white text-base font-medium mb-4">{t('detail.common.platform')}</h3>
                <ul className="flex flex-col pl-3">
                  {Object.values(PlatformType).map((platform) => (
                    <li
                      key={platform}
                      className="flex justify-between items-center py-[18px] cursor-pointer border-b-[0.5px] border-b-[#ECECED14] text-[14px]"
                      onClick={() => handleClickPlatformFilterItem(platform)}
                    >
                      <span>{getPlatformLabel(platform)}</span>
                      {currentPlatformState === platform && (
                        <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="ic tick" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button
                variant="close"
                className="flex-1 rounded-[200px]"
                onClick={handleReset}
              >
                {t('detail.common.reset')}
              </Button>
              <ButtonGradient
                className="flex-1 bg-white text-black hover:bg-gray-200 rounded-[200px]"
                onClick={handleApply}
              >
                {t('detail.common.apply')}
              </ButtonGradient>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
})

FilterPoolTransactionType.displayName = 'FilterPoolTransactionType'

export default FilterPoolTransactionType
