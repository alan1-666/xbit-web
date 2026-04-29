import { TransactionType } from '@/@generated/gql/graphql-trading'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useResponsive } from '@/hooks/useResponsive'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { cn } from '@/lib/utils'
import {
  initialTradeSettings,
  resetTradeSettings,
  setSelectedPreset,
  TradeSetting,
  updateTradeSettings,
} from '@/redux/modules/tradeSettings.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import BottomSheet from '@components/common/BottomSheet.tsx'
import FilterSelect from '@components/common/FilterSelect'
import { Button } from '@components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconSetting } from '@/components/icon/stroke/IconSetting'
import PriorityFeeSelector from './PriorityFeeSelector'
import PresetSelector from './PresetSelector'
import SlippageSelector from './SlippageSelector'
import SideSelector from './SideSelector'
import BriberySelector from './BriberySelector'
import MevSelector from './MevSelector'
import RpcCustomInput from './RpcCustomInput'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  type?: 1 | 2
  hiddenButtonToggle?: boolean
  selectType?: 'dropdown' | 'list'
  transactionType?: TransactionType
}

export type ErrorTradeSettingProps = {
  isSlippageError: boolean
  isPriorityFeeError: boolean
  isBriberyError: boolean
  isRpcError: boolean
}
const NewTradeSettings = ({
  open,
  setOpen,
  type = 1,
  hiddenButtonToggle = false,
  selectType = 'dropdown',
  transactionType,
}: Props) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeChain =
    (useAppSelector((state) => state.newWallet.activeChain) as keyof typeof initialTradeSettings) || TYPE_CHAIN.SOLANA
  const tradeSettings = useAppSelector((state) => state.tradeSettings.settings) || initialTradeSettings
  const selectedPresetKey = useAppSelector((state) => state.tradeSettings.selectedPreset[activeChain])
  const [openDialogConfirm, setOpenDialogConfirm] = useState(false)

  const [tradeSettingsByChain, setTradeSettingsByChain] = useState<TradeSetting[]>(initialTradeSettings[activeChain])
  const [presetSelected, setPresetSelected] = useState<TradeSetting>(tradeSettingsByChain?.[0])
  const [sideSelected, setSideSelected] = useState<TransactionType>(TransactionType.Buy)
  const [isShowError, setIsShowError] = useState(false)
  const [isError, setIsError] = useState<ErrorTradeSettingProps>({
    isSlippageError: false,
    isPriorityFeeError: false,
    isBriberyError: false,
    isRpcError: false,
  })

  const ref = useRef(0)
  const { isDesktop } = useResponsive()

  useEffect(() => {
    if (open && ref.current === 0) {
      setTradeSettingsByChain(tradeSettings[activeChain] || initialTradeSettings[activeChain])
      if (tradeSettings[activeChain] && transactionType) {
        setPresetSelected(tradeSettings[activeChain][selectedPresetKey?.[transactionType] - 1])
      }
      ref.current = 1
    } else {
      ref.current = 0
    }
    return () => {
      ref.current = 0
    }
  }, [open, activeChain])

  const transactionTypeRef = useRef(0)
  useEffect(() => {
    if (transactionTypeRef.current === 0) {
      if (!!transactionType) {
        setSideSelected(transactionType as TransactionType)
      } else {
        setSideSelected(TransactionType.Buy)
      }
      transactionTypeRef.current = 1
    }
    return () => {
      transactionTypeRef.current = 0
    }
  }, [transactionType])

  // Remove old key in redux-persist
  useEffect(() => {
    const OLD_KEY = 'persist:tradeSettings_v2'
    if (localStorage.getItem(OLD_KEY)) {
      localStorage.removeItem(OLD_KEY)
    }
  }, [])

  const resetTradeSettingsHandler = useCallback(() => {
    dispatch(resetTradeSettings(activeChain))
    dispatch(updateTradeSettings({ chain: activeChain, settings: initialTradeSettings[activeChain] }))

    setTradeSettingsByChain(initialTradeSettings[activeChain])
    setPresetSelected(tradeSettingsByChain?.[0])
    setSideSelected(TransactionType.Buy)
    setIsShowError(false) // Reset error state
  }, [dispatch, activeChain])

  const applyTradeSettings = useCallback(() => {
    dispatch(updateTradeSettings({ chain: activeChain, settings: tradeSettingsByChain }))
    setOpenDialogConfirm(false)
    setOpen(false)
  }, [dispatch, activeChain, tradeSettingsByChain, setOpen])

  if (activeChain === TYPE_CHAIN.ARB) {
    // TODO: Implement ARB chain settings when available
    return <></>
  }

  return (
    <>
      {type === 2 ? (
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-1">
            {tradeSettingsByChain?.map((preset) => (
              <div
                role="button"
                key={preset.key}
                className={`flex items-center justify-center font-[330] text-[11px] px-3 py-1 rounded-[5px] cursor-pointer ${
                  !!transactionType && selectedPresetKey?.[transactionType] === preset.key
                    ? 'bg-[#3E2761] text-[#C8A7FD]'
                    : 'bg-[#18171E] text-[#908E98]'
                }`}
                onClick={() => {
                  setPresetSelected(preset)
                  if (transactionType) {
                    dispatch(
                      setSelectedPreset({
                        chain: activeChain,
                        presetKey: preset.key,
                        transactionType: transactionType,
                      }),
                    )
                  }
                }}
              >
                P{preset.key}
              </div>
            ))}
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger type="button">
                <IconSetting stroke="#b9b9b9" onClick={() => setOpen(true)} aria-label="settings" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[360px]">
                <p className="text-xs leading-none">{t('tradeSettings.title')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : hiddenButtonToggle ? (
        <div className={cn('flex items-center justify-center gap-1 h-full w-full')} onClick={() => setOpen(true)}></div>
      ) : (
        <div className={cn('flex items-center justify-center gap-1')}>
          {/* <img
            src={getActiveChainLogo(activeChain)}
            alt="chain-logo"
            className="size-3 cursor-pointer"
            onClick={() => setOpen(true)}
          /> */}
          {selectType === 'list' ? (
            <div className="flex items-center gap-2">
              {tradeSettingsByChain?.map((preset) => (
                <button
                  key={preset.key}
                  className={cn(
                    'text-[calc(12rem/16)] leading-3',
                    !!transactionType && selectedPresetKey?.[transactionType] === preset.key
                      ? 'text-impartal font-semibold'
                      : 'text-[#FBFBFB] hover:text-white',
                  )}
                  onClick={() => {
                    setPresetSelected(preset)
                    if (transactionType) {
                      dispatch(
                        setSelectedPreset({
                          chain: activeChain,
                          presetKey: preset.key,
                          transactionType: transactionType,
                        }),
                      )
                    }
                  }}
                >
                  P{preset.key}
                </button>
              ))}
            </div>
          ) : (
            <FilterSelect
              options={tradeSettingsByChain?.map((preset) => ({
                value: preset.key.toString(),
                label: `P${preset.key}`,
              }))}
              value={presetSelected?.key.toString()}
              onValueChange={(value) => {
                const selectedPreset = tradeSettingsByChain.find((preset) => preset.key === Number(value))
                if (selectedPreset) {
                  setPresetSelected(selectedPreset)
                  if (transactionType) {
                    dispatch(
                      setSelectedPreset({
                        chain: activeChain,
                        presetKey: selectedPreset.key,
                        transactionType: transactionType,
                      }),
                    )
                  }
                }
              }}
              selectTriggerProps={{
                className:
                  'flex justify-center p-0 text-[11px] leading-4 text-white/80 font-normal border-none bg-transparent shadow-none',
              }}
              triggerIconClassname="ml-1 w-[8.67px] h-[6.3px] mt-0.5"
              triggerIcon="/images/icons/arrow-down-quick-buy.svg"
            />
          )}
        </div>
      )}

      <BottomSheet
        open={open}
        setOpen={setOpen}
        title={t('tradeSettings.title')}
        className="!bg-[#232329] pt-4"
        hiddenBgImg
        repositionInputs={false}
        classNameTitleHeader="font-[400]"
        classNameDrawerHeader="items-start border-b-[1px] border-[#79778c29]"
      >
        <div className={cn('overflow-y-auto no-scrollbar max-h-[calc(80vh-150px)]', isDesktop && 'max-w-[485px]')}>
          <SideSelector selected={sideSelected} onSelect={setSideSelected} />
          <p className="text-[15px] leading-none font-[400] mt-4 mb-3">{t('tradeSettings.preset', { preset: '' })}</p>
          <PresetSelector
            presets={tradeSettingsByChain}
            selectedKey={presetSelected?.key}
            onSelect={(preset) => {
              setPresetSelected(preset)
              if (transactionType) {
                dispatch(
                  setSelectedPreset({
                    chain: activeChain,
                    presetKey: preset.key,
                    transactionType: transactionType,
                  }),
                )
              }
            }}
          />
          <div className="border-[1px] border-[#79778c29] p-4 mt-4 rounded-[8px]">
            <SlippageSelector
              presetSelected={presetSelected}
              sideSelected={sideSelected}
              tradeSettingsByChain={tradeSettingsByChain}
              setTradeSettingsByChain={setTradeSettingsByChain}
              isError={isError}
              setIsError={setIsError}
            />
            <PriorityFeeSelector
              presetSelected={presetSelected}
              sideSelected={sideSelected}
              tradeSettingsByChain={tradeSettingsByChain}
              setTradeSettingsByChain={setTradeSettingsByChain}
              isError={isError}
              setIsError={setIsError}
            />
            {activeChain === TYPE_CHAIN.SOLANA && (
              <BriberySelector
                presetSelected={presetSelected}
                sideSelected={sideSelected}
                tradeSettingsByChain={tradeSettingsByChain}
                setTradeSettingsByChain={setTradeSettingsByChain}
                isError={isError}
                setIsError={setIsError}
              />
            )}
            <MevSelector
              presetSelected={presetSelected}
              sideSelected={sideSelected}
              tradeSettingsByChain={tradeSettingsByChain}
              setTradeSettingsByChain={setTradeSettingsByChain}
            />
            {activeChain === TYPE_CHAIN.SOLANA && (
              <RpcCustomInput
                presetSelected={presetSelected}
                sideSelected={sideSelected}
                tradeSettingsByChain={tradeSettingsByChain}
                setTradeSettingsByChain={setTradeSettingsByChain}
                isError={isError}
                setIsError={setIsError}
              />
            )}
          </div>
        </div>
        <div className="w-full mt-3 pt-3 border-t border-[#ECECED0A] flex gap-4 items-center">
          <Button variant="close" className="rounded-full flex-1 h-11" onClick={resetTradeSettingsHandler}>
            {t('tradeSettings.reset')}
          </Button>
          <Button
            variant="gradient"
            className="rounded-full flex-1 h-11"
            onClick={() => setOpenDialogConfirm(true)}
            disabled={
              isError.isBriberyError || isError.isPriorityFeeError || isError.isRpcError || isError.isSlippageError
            }
          >
            {t('tradeSettings.apply')}
          </Button>
        </div>
        <Dialog open={openDialogConfirm} onOpenChange={setOpenDialogConfirm}>
          <DialogContent className="w-[360px] bg-[#232329] rounded-2xl p-5">
            <DialogHeader>
              <DialogTitle>
                <p className="text-sm text-white leading-[1.5] pt-8">{t('orderForm.orderSetting.warning')}</p>
              </DialogTitle>
              <div className="flex justify-center items-center flex-row gap-2.5 mt-4">
                <Button type="button" variant="close" className="flex-1" onClick={() => setOpenDialogConfirm(false)}>
                  {t('button.cancel')}
                </Button>
                <Button
                  variant="gradient"
                  type="button"
                  className="text-[#261236] flex-1 rounded-[50px]"
                  onClick={applyTradeSettings}
                >
                  {t('button.confirm')}
                </Button>
              </div>
            </DialogHeader>
            <DialogDescription />
          </DialogContent>
        </Dialog>
      </BottomSheet>
    </>
  )
}

export default NewTradeSettings

export const NewTradeSettingsInForm = ({ transactionType }: Props) => {
  const activeChain =
    (useAppSelector((state) => state.newWallet.activeChain) as keyof typeof initialTradeSettings) || TYPE_CHAIN.SOLANA
  const tradeSettings = useAppSelector((state) => state.tradeSettings.settings) || initialTradeSettings
  const selectedPresetKey = useAppSelector((state) => state.tradeSettings.selectedPreset?.[activeChain])
  const [tradeSettingsByChain, setTradeSettingsByChain] = useState<TradeSetting[]>(initialTradeSettings?.[activeChain])
  const [presetSelected, setPresetSelected] = useState<TradeSetting>(tradeSettingsByChain?.[0])
  useEffect(() => {
    if (activeChain && selectedPresetKey && transactionType) {
      setTradeSettingsByChain(tradeSettings?.[activeChain] || initialTradeSettings?.[activeChain])
      setPresetSelected(tradeSettings?.[activeChain]?.[selectedPresetKey?.[transactionType] - 1])
    }
    return () => {}
  }, [transactionType, activeChain, selectedPresetKey, tradeSettings])

  return (
    <div>
      <SlippageSelector
        presetSelected={presetSelected}
        sideSelected={transactionType as TransactionType}
        tradeSettingsByChain={tradeSettingsByChain}
        setTradeSettingsByChain={setTradeSettingsByChain}
        isForm={true}
      />
      <PriorityFeeSelector
        presetSelected={presetSelected}
        sideSelected={transactionType as TransactionType}
        tradeSettingsByChain={tradeSettingsByChain}
        setTradeSettingsByChain={setTradeSettingsByChain}
        isForm={true}
      />
      {activeChain === TYPE_CHAIN.SOLANA && (
        <BriberySelector
          presetSelected={presetSelected}
          sideSelected={transactionType as TransactionType}
          tradeSettingsByChain={tradeSettingsByChain}
          setTradeSettingsByChain={setTradeSettingsByChain}
          isForm={true}
        />
      )}
      <MevSelector
        presetSelected={presetSelected}
        sideSelected={transactionType as TransactionType}
        tradeSettingsByChain={tradeSettingsByChain}
        setTradeSettingsByChain={setTradeSettingsByChain}
        isForm={true}
      />

      {activeChain === TYPE_CHAIN.SOLANA && (
        <RpcCustomInput
          presetSelected={presetSelected}
          sideSelected={transactionType as TransactionType}
          tradeSettingsByChain={tradeSettingsByChain}
          setTradeSettingsByChain={setTradeSettingsByChain}
          isForm={true}
        />
      )}
    </div>
  )
}
