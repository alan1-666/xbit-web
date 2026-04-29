import { TransactionType } from '@/@generated/gql/graphql-trading'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useNetworkFee } from '@/hooks'
import { useGetNetworkFee } from '@/hooks/useGetNetWorkFee'
import { useResponsive } from '@/hooks/useResponsive'
import { BASIC_FEE, TYPE_CHAIN } from '@/lib/blockchain'
import { formatAmount, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { priceChain } from '@/redux/modules/price.slice'
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
import { IconChevronUp } from '@components/icon'
import { Button } from '@components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { OrderFormType } from '@pages/detail/orderForm/useOrderForm.ts'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IconSetting } from '../icon/stroke/IconSetting'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import XTooltip from '../ui/XTooltip'
import AntiClipModeExplained from './AntiClipModeExplained'
import GasFeeExplainend from './GasFeeExplainend'
import PriorityFeeToolExplained from './PriorityFeeToolExplained'
import SlippageExplained from './SlippageExplained'
import { Switch } from '@components/ui/switch.tsx'
import {
  selectFuturesTradePreferences,
  futuresTradePreferencesActions,
} from '@/redux/modules/futuresTradePreferences.slice'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  type?: 1 | 2
  hiddenButtonToggle?: boolean
  selectType?: 'dropdown' | 'list'
  transactionType?: TransactionType
}

const TooltipWithInfo = ({ tooltipKey }: { tooltipKey: string }) => {
  const { t } = useTranslation()
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger type="button">
          <img src="/images/icons/info.svg" alt="info" className="h-4 w-4 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[360px]">
          <p className="text-xs leading-none">{t(tooltipKey)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const PresetSelector = ({
  presets,
  selectedKey,
  onSelect,
}: {
  presets: TradeSetting[]
  selectedKey: number
  onSelect: (preset: TradeSetting) => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="relative grid grid-cols-3 gap-0.5 bg-[#1B1B1E] rounded-md p-1 border-[0.5px] border-[#343339]">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute top-1 bottom-1 rounded-sm bg-white"
        style={{
          left: selectedKey - 1 === 0 ? '4px' : `calc((100% / ${presets.length}) * (${selectedKey - 1}))`,
          width: `calc((100% / ${presets.length}) - 4px)`,
        }}
      />
      {presets.map((preset) => (
        <div
          key={preset.key}
          className="relative z-10 flex items-center justify-center py-[5.5px] rounded-sm cursor-pointer"
          onClick={() => onSelect(preset)}
        >
          <span
            className={`font-[330] text-[14px] leading-none transition-colors duration-200 ${
              selectedKey === preset.key ? 'text-black' : 'text-[#908E98]'
            }`}
          >
            {t('tradeSettings.preset', { preset: preset.key })}
          </span>
        </div>
      ))}
    </div>
  )
}

const SideSelector = ({
  selected,
  onSelect,
}: {
  selected: TransactionType
  onSelect: (side: TransactionType) => void
}) => {
  const { t } = useTranslation()
  return (
    <div className="relative mt-[15px] bg-[#1A1A20] rounded-full grid grid-cols-2 p-[2px]">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`absolute top-0 bottom-0 w-1/2 rounded-full ${selected === TransactionType.Buy ? 'bg-[#00a85c] shadow-inset-green' : 'bg-[#EA3B4F] shadow-inset-red'}`}
        animate={{
          left: selected === TransactionType.Buy ? '0px' : '50%',
        }}
      />
      <div
        className={`relative z-10 flex items-center justify-center cursor-pointer py-2 font-[330] text-[14px] leading-none ${
          selected === TransactionType.Buy ? 'text-white' : 'text-[#A6A4B3]'
        }`}
        onClick={() => onSelect(TransactionType.Buy)}
      >
        {t('transaction.buy')}
      </div>
      <div
        className={`relative z-10 flex items-center justify-center cursor-pointer py-2 font-[330] text-[14px] leading-none ${
          selected === TransactionType.Sell ? 'text-white' : 'text-[#A6A4B3]'
        }`}
        onClick={() => onSelect(TransactionType.Sell)}
      >
        {t('transaction.sell')}
      </div>
    </div>
  )
}

const SlippageSelector = ({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (value: string) => void
  error?: string
}) => {
  const { t } = useTranslation()
  const slippageOptions = ['20', '10', '15', '50']

  return (
    <div className="mt-4">
      <div className="flex items-center gap-1">
        <span className="font-[330] text-[15px] text-white leading-none">{t('tradeSettings.slippage')}</span>
        <SlippageExplained />
      </div>
      <div className="mt-3 flex gap-2">
        {slippageOptions.map((option) => (
          <Button
            type="button"
            key={option}
            className={cn(
              'flex-1 py-[6.5px] rounded-md transition-colors duration-200 text-[14px] font-normal text-white',
              value === option ? 'bg-[#3E2761]' : 'bg-transparent',
            )}
            onClick={() => onChange(option)}
          >
            {option === '20' ? t('tradeSettings.auto') : option + '%'}
          </Button>
        ))}
      </div>
      <InputGroup className="mt-3">
        <InputGroupInput
          name="slippagePercentage"
          className="w-full bg-transparent outline-none placeholder:text-[#6C6A74] text-sm"
          placeholder={t('tradeSettings.custom') + ' (1 ~ 50)'}
          value={value}
          inputMode="decimal"
          onChange={(e) => {
            let newValue = e.target.value.replace(/[^0-9.,]/g, '')
            newValue = newValue.replace(/,/g, '.')
            if (newValue.includes('.')) {
              const parts = newValue.split('.')
              newValue = parts[0] + '.' + parts[1]
            }
            onChange(newValue)
          }}
        />
        <InputGroupAddon align="inline-end">
          <span className="absolute top-1/2 right-[14px] -translate-y-1/2 text-[14px] text-white-[#908E98] font-[330]">
            %
          </span>
        </InputGroupAddon>
      </InputGroup>
      {error && <div className="mt-1 text-[14px] text-red-500 font-[350] leading-none">{error}</div>}
    </div>
  )
}

const FeeSelector = ({
  presetSelected,
  sideSelected,
  onChange,
  networkFee,
  activeChain,
  priorityFeePriceKeyToLabel,
  isFeeError,
  setIsFeeError,
}: {
  presetSelected: TradeSetting
  sideSelected: TransactionType
  onChange: (type: string, value?: string) => void
  networkFee: any
  activeChain: string
  priorityFeePriceKeyToLabel: (key: string) => string
  isFeeError: boolean
  setIsFeeError: (value: boolean) => void
}) => {
  const { t } = useTranslation()

  const getNativeToken = useMemo(() => {
    if (activeChain === TYPE_CHAIN.SOLANA) return 'SOL'
    if (activeChain === TYPE_CHAIN.ETH) return 'ETH'
    if (activeChain === TYPE_CHAIN.BSC) return 'BNB'
    return 'SOL'
  }, [activeChain])

  const priceNativeToken = useAppSelector(priceChain(getNativeToken))
  const getFeeSol = useCallback(
    (sol: number) => {
      if (sol) return (sol * networkFee?.maxComputeUnits) / Math.pow(10, 15)
      return 0
    },
    [networkFee],
  )

  if (activeChain === TYPE_CHAIN.SOLANA) {
    const minFee = getFeeSol(networkFee?.priorityFeePrice?.medium) || 0
    const maxFee = 2
    return (
      <div className="mt-5">
        <div className="flex items-center gap-1">
          <span className="font-[330] text-[15px] text-white leading-none">{t('tradeSettings.priorityFee')}</span>
          <PriorityFeeToolExplained />
        </div>
        <div className="mt-3 flex gap-2">
          {networkFee &&
            networkFee.priorityFeePrice &&
            Object?.keys(networkFee.priorityFeePrice).map((key) => {
              const fee = networkFee.priorityFeePrice[key]
              return (
                <Button
                  key={key}
                  type="button"
                  className={cn(
                    'flex-1 flex items-center justify-center py-3 rounded-md cursor-pointer font-[330] text-[13px] leading-none text-white transition-colors duration-200 h-auto',
                    key === presetSelected[sideSelected].fee.type ? 'bg-[#3E2761]' : 'bg-transparent',
                  )}
                  onClick={() => {
                    onChange(key)
                    setIsFeeError(false)
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>{priorityFeePriceKeyToLabel(key)}</span>
                    <span>
                      {formatAmount(getFeeSol(fee), {
                        roundMode: 'ceil',
                        unit: 'SOL',
                      })}
                    </span>
                    <div>
                      {'≈ '}
                      {formatAmount(+getFeeSol(fee) * priceNativeToken, {
                        showCurrency: true,
                        roundMode: 'ceil',
                      })}
                    </div>
                  </div>
                </Button>
              )
            })}
        </div>
        <div className="mt-4 font-[330] text-[15px] text-white leading-none">
          {t('tradeSettings.custom') + ' ' + t('tradeSettings.priorityFee')}
          <span className="ml-1 text-white/65">
            (
            {formatAmount(getFeeSol(networkFee?.priorityFeePrice.medium), {
              roundMode: 'ceil',
            })}{' '}
            ~ 2)
          </span>
        </div>
        <InputGroup className="mt-3">
          <InputGroupInput
            name="priorityFee"
            className=""
            placeholder={`${formatAmount(getFeeSol(networkFee?.priorityFeePrice.medium), {
              roundMode: 'ceil',
            })} ~ 2`}
            value={presetSelected[sideSelected].fee.value || ''}
            inputMode="decimal"
            onChange={(e) => {
              let newValue = e.target.value.replace(/[^0-9.,]/g, '')
              newValue = newValue.replace(/,/g, '.')
              if (newValue.includes('.')) {
                const parts = newValue.split('.')
                newValue = parts[0] + '.' + parts[1]
              }
              const feeValue = Number(newValue)
              if (feeValue < Number(minFee) || feeValue > Number(maxFee) || isNaN(feeValue)) {
                setIsFeeError(true)
              } else {
                setIsFeeError(false)
              }
              onChange('custom', newValue)
            }}
          />
          <InputGroupAddon align="inline-end">
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[14px] text-white/70 font-[350]">SOL</span>
          </InputGroupAddon>
        </InputGroup>
        {isFeeError && (
          <div className="mt-1 text-[14px] text-[#EA963A] font-[350] leading-none">
            {t('tradeSettings.customPriorityFeeError', { min: minFee })}
          </div>
        )}
      </div>
    )
  }

  const gasFees = [
    {
      key: 'low',
      label: t('tradeSettings.marketPrice'),
    },
    {
      key: 'medium',
      label: t('tradeSettings.quick'),
    },
    {
      key: 'high',
      label: t('tradeSettings.fastest'),
    },
  ]

  if (activeChain === TYPE_CHAIN.BSC) {
    const minFee = networkFee?.low?.suggestedMaxFeePerGas || 0
    return (
      <div className="mt-5">
        <div className="flex items-center gap-1">
          <span className="font-normal text-[14px] text-white/80 leading-none">{t('tradeSettings.gasFee')}</span>
          {<GasFeeExplainend />}
        </div>
        <div className="mt-3 flex gap-2">
          {networkFee &&
            gasFees.map((fee) => (
              <div
                key={fee.key}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-sm text-[12px] font-normal leading-none cursor-pointer ${
                  fee.key === presetSelected[sideSelected].fee.type ? 'bg-[#584487]' : 'bg-[#2B2B33]'
                }`}
                onClick={() => {
                  onChange(fee.key)
                  setIsFeeError(false)
                }}
              >
                <div className="flex flex-col items-center gap-2 py-3">
                  <span>{fee.label}</span>
                  <span>
                    {formatAmount(networkFee?.[fee.key]?.suggestedMaxFeePerGas || 0, {
                      roundMode: 'ceil',
                      unit: 'Gwei',
                    })}
                  </span>
                  <div>
                    {'≈ '}
                    {formatAmount(
                      (networkFee?.[fee.key]?.suggestedMaxFeePerGas * 500000 * priceNativeToken) / Math.pow(10, 9),
                      {
                        showCurrency: true,
                        roundMode: 'ceil',
                      },
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="mt-4 font-[350] text-[14px] text-white leading-none">
          {t('tradeSettings.custom') + ' ' + t('tradeSettings.gasFee')}
          <span className="ml-1 text-white/65">
            (
            {formatAmount(networkFee?.low?.suggestedMaxFeePerGas || 0, {
              roundMode: 'ceil',
            })}{' '}
            ~ ∞)
          </span>
        </div>
        <div className="mt-3 relative">
          <input
            className="w-full h-10 bg-[#2B2B33] border border-[#2B2B33] focus:bg-[#212127] focus:border-[#444455] rounded-md pl-[14px] pr-10 text-[14px] font-[350] text-white/80 placeholder:text-[#908E98]"
            placeholder={`${formatAmount(networkFee?.low?.suggestedMaxFeePerGas || 0, {
              roundMode: 'ceil',
            })} ~ ∞`}
            value={presetSelected[sideSelected].fee.value || ''}
            inputMode="decimal"
            onChange={(e) => {
              let newValue = e.target.value.replace(/[^0-9.,]/g, '')
              newValue = newValue.replace(/,/g, '.')
              if (newValue.includes('.')) {
                const parts = newValue.split('.')
                newValue = parts[0] + '.' + parts[1]
              }
              const feeValue = Number(newValue)
              if (feeValue < Number(minFee) || isNaN(feeValue)) {
                setIsFeeError(true)
              } else {
                setIsFeeError(false)
              }
              onChange('custom', newValue)
            }}
          />
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[14px] text-white/70 font-[350]">Gwei</span>
        </div>
        {isFeeError && (
          <div className="mt-1 text-[14px] text-red-500 font-[350] leading-none">
            {t('tradeSettings.customGasFeeError', { min: minFee })}
          </div>
        )}
      </div>
    )
  }

  if (activeChain === TYPE_CHAIN.ETH) {
    const minFee = networkFee?.low?.suggestedMaxFeePerGas || 0
    return (
      <div className="mt-5">
        <div className="flex items-center gap-1">
          <span className="font-[330] text-[15px] text-white leading-none">{t('tradeSettings.gasFee')}</span>
          <TooltipWithInfo tooltipKey="tradeSettings.gasFeeTooltip" />
        </div>
        <div className="mt-3 flex gap-2">
          {networkFee &&
            gasFees.map((fee) => (
              <div
                key={fee.key}
                className={`flex-1 flex items-center justify-center py-[6.5px] rounded-md cursor-pointer text-white ${
                  fee.key === presetSelected[sideSelected].fee.type ? 'bg-[#584487]' : 'bg-[#2B2B33]'
                }`}
                onClick={() => {
                  onChange(fee.key)
                  setIsFeeError(false)
                }}
              >
                <div className="flex flex-col items-center gap-2 py-3">
                  <span>{fee.label}</span>
                  <span>
                    {formatAmount(networkFee?.[fee.key]?.suggestedMaxFeePerGas || 0, {
                      roundMode: 'ceil',
                      unit: 'Gwei',
                    })}
                  </span>
                  <div>
                    {'≈ '}
                    {formatAmount(
                      (networkFee?.[fee.key]?.suggestedMaxFeePerGas * 200000 * priceNativeToken) / Math.pow(10, 9),
                      {
                        showCurrency: true,
                        roundMode: 'ceil',
                      },
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="mt-4 font-[330] text-[15px] text-white leading-none">
          {t('tradeSettings.custom') + ' ' + t('tradeSettings.gasFee')}
          <span className="ml-1 text-white/65">
            (
            {formatAmount(networkFee?.low?.suggestedMaxFeePerGas || 0, {
              roundMode: 'ceil',
            })}{' '}
            ~ ∞)
          </span>
        </div>
        <div className="mt-3 relative">
          <input
            className="w-full h-10 bg-[#2B2B33] border border-[#2B2B33] focus:bg-[#212127] focus:border-[#444455] rounded-md pl-[14px] pr-10 text-[14px] font-[350] text-white/80 placeholder:text-[#908E98]"
            placeholder={`${formatAmount(networkFee?.low?.suggestedMaxFeePerGas || 0, {
              roundMode: 'ceil',
            })} ~ ∞`}
            value={presetSelected[sideSelected].fee.value || ''}
            inputMode="decimal"
            onChange={(e) => {
              let newValue = e.target.value.replace(/[^0-9.,]/g, '')
              newValue = newValue.replace(/,/g, '.')
              if (newValue.includes('.')) {
                const parts = newValue.split('.')
                newValue = parts[0] + '.' + parts[1]
              }
              const feeValue = Number(newValue)
              if (feeValue < Number(minFee) || isNaN(feeValue)) {
                setIsFeeError(true)
              } else {
                setIsFeeError(false)
              }
              onChange('custom', newValue)
            }}
          />
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[14px] text-white/70 font-[350]">Gwei</span>
        </div>
        {isFeeError && (
          <div className="mt-1 text-[14px] text-red-500 font-[350] leading-none">
            {t('tradeSettings.customGasFeeError', { min: minFee })}
          </div>
        )}
      </div>
    )
  }
}

const CostSummary = ({
  activeChain,
  presetSelected,
  sideSelected,
  networkFee,
}: {
  activeChain: string
  presetSelected: TradeSetting
  sideSelected: TransactionType
  networkFee: any
}) => {
  const { t } = useTranslation()

  const getNativeToken = useMemo(() => {
    if (activeChain === TYPE_CHAIN.SOLANA) return 'SOL'
    if (activeChain === TYPE_CHAIN.ETH) return 'ETH'
    if (activeChain === TYPE_CHAIN.BSC) return 'BNB'
    return 'SOL'
  }, [activeChain])

  const priceNativeToken = useAppSelector(priceChain(getNativeToken))

  const getFeeSol = useCallback(
    (sol: number) => {
      if (sol) return (sol * networkFee?.maxComputeUnits) / Math.pow(10, 15)

      return 0
    },
    [networkFee],
  )

  if (activeChain === TYPE_CHAIN.SOLANA) {
    return (
      <div className="min-h-[70px]">
        <div className="mt-4 flex items-center justify-between font-[350] text-[14px] text-white leading-none">
          <div>{t('tradeSettings.totalCost')}:</div>
          <div>
            {'≈ '}
            {formatAmount(
              ((presetSelected[sideSelected].fee.value
                ? Number(presetSelected[sideSelected].fee.value)
                : Number(getFeeSol(networkFee?.priorityFeePrice[presetSelected[sideSelected].fee.type]) || 0)) +
                BASIC_FEE) *
                priceNativeToken,
              {
                showCurrency: true,
                roundMode: 'ceil',
              },
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between font-[350] text-[12px] text-[#908E98] leading-none">
          <div>{t('tradeSettings.basicFee')}:</div>
          <div>
            {'≈ '}
            {formatAmount(BASIC_FEE * priceNativeToken, {
              roundMode: 'ceil',
              showCurrency: true,
            })}{' '}
            ({formatAmount(BASIC_FEE, { roundMode: 'ceil', unit: 'SOL' })})
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between font-[350] text-[12px] text-[#908E98] leading-none">
          <div>{t('tradeSettings.priorityFee')}:</div>
          <div>
            {'≈ '}
            {formatAmount(
              presetSelected?.[sideSelected]?.fee?.value
                ? Number(presetSelected?.[sideSelected]?.fee?.value) * priceNativeToken
                : Number(getFeeSol(networkFee?.priorityFeePrice?.[presetSelected?.[sideSelected]?.fee?.type])) *
                    priceNativeToken,
              {
                showCurrency: true,
                roundMode: 'ceil',
              },
            )}{' '}
            (
            {formatAmount(
              presetSelected?.[sideSelected]?.fee?.value
                ? Number(presetSelected?.[sideSelected]?.fee?.value)
                : Number(getFeeSol(networkFee?.priorityFeePrice?.[presetSelected?.[sideSelected]?.fee?.type])),
              { unit: 'SOL', roundMode: 'ceil' },
            )}
            )
          </div>
        </div>
      </div>
    )
  }

  if (activeChain === TYPE_CHAIN.ETH) {
    return (
      <div className="mt-4 flex items-center justify-between font-[350] text-[14px] text-white leading-none">
        <div>{t('tradeSettings.totalCost')}:</div>
        <div>
          {'≈ '}
          {formatAmount(
            presetSelected?.[sideSelected]?.fee?.value
              ? (Number(presetSelected?.[sideSelected]?.fee?.value) * priceNativeToken * 200000) / Math.pow(10, 9)
              : (networkFee?.[presetSelected?.[sideSelected]?.fee?.type]?.suggestedMaxFeePerGas *
                  priceNativeToken *
                  200000 || 0) / Math.pow(10, 9),
            {
              showCurrency: true,
              roundMode: 'ceil',
            },
          )}
        </div>
      </div>
    )
  }
  if (activeChain === TYPE_CHAIN.BSC) {
    return (
      <div className="mt-4 flex items-center justify-between font-[350] text-[14px] text-white leading-none min-h-[14px]">
        <div>{t('tradeSettings.totalCost')}:</div>
        <div>
          {'≈ '}
          {formatAmount(
            presetSelected?.[sideSelected]?.fee?.value
              ? (Number(presetSelected?.[sideSelected]?.fee?.value) * priceNativeToken * 500000) / Math.pow(10, 9)
              : (networkFee?.[presetSelected?.[sideSelected]?.fee?.type]?.suggestedMaxFeePerGas *
                  priceNativeToken *
                  500000 || 0) / Math.pow(10, 9),
            {
              showCurrency: true,
              roundMode: 'ceil',
            },
          )}
        </div>
      </div>
    )
  }
}

const TradeSettingsBottomSheet = ({
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
  const networkFee = useGetNetworkFee(activeChain as TYPE_CHAIN)
  const [openDialogConfirm, setOpenDialogConfirm] = useState(false)

  const [tradeSettingsByChain, setTradeSettingsByChain] = useState<TradeSetting[]>(initialTradeSettings[activeChain])
  const [presetSelected, setPresetSelected] = useState<TradeSetting>(tradeSettingsByChain?.[0])
  const [sideSelected, setSideSelected] = useState<TransactionType>(TransactionType.Buy)
  const [isFeeError, setIsFeeError] = useState(false)
  const { isShowOrderConfirm } = useAppSelector(selectFuturesTradePreferences)
  
  const ref = useRef(0)
  const { isDesktop } = useResponsive()

  useEffect(() => {
    if (open && ref.current === 0) {
      setTradeSettingsByChain(tradeSettings[activeChain] || initialTradeSettings[activeChain])
      if (tradeSettings[activeChain] && transactionType) {
        setPresetSelected(tradeSettings[activeChain][selectedPresetKey[transactionType] - 1])
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

  useEffect(() => {
    const newPresetSelected = tradeSettingsByChain.find((preset) => preset.key === presetSelected.key)
    if (newPresetSelected) {
      setPresetSelected(newPresetSelected)
    }
  }, [tradeSettingsByChain, selectedPresetKey, sideSelected])

  //Remove old key in redux-persist
  useEffect(() => {
    const OLD_KEY = 'persist:tradeSettings'
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
    setIsFeeError(false) // Reset error state
  }, [dispatch, activeChain])

  const applyTradeSettings = useCallback(() => {
    dispatch(updateTradeSettings({ chain: activeChain, settings: tradeSettingsByChain }))
    setOpenDialogConfirm(false)
    setOpen(false)
  }, [dispatch, activeChain, tradeSettingsByChain, setOpen])

  const priorityFeePriceKeyToLabel = useCallback(
    (key: string) => {
      switch (key) {
        case 'medium':
          return t('tradeSettings.marketPrice')
        case 'high':
          return t('tradeSettings.quick')
        case 'veryHigh':
          return t('tradeSettings.fastest')
        default:
          return key
      }
    },
    [t],
  )

  const handleFeeChange = useCallback(
    (type: string, value?: string) => {
      setTradeSettingsByChain((prev) => {
        const updatedTradeSettings = prev.map((item) => {
          if (item.key === presetSelected.key) {
            return {
              ...item,
              [sideSelected]: {
                ...item[sideSelected],
                fee: {
                  type,
                  value,
                },
              },
            }
          }
          return item
        })
        return updatedTradeSettings
      })
    },
    [presetSelected.key, sideSelected],
  )

  const handleSlippageChange = useCallback(
    (value: string) => {
      setTradeSettingsByChain((prev) => {
        const updatedTradeSettings = prev.map((item) => {
          if (item.key === presetSelected.key) {
            return {
              ...item,
              [sideSelected]: {
                ...item[sideSelected],
                slippage: value,
              },
            }
          }
          return item
        })
        return updatedTradeSettings
      })
    },
    [presetSelected.key, sideSelected],
  )

  const handleMevProtectToggle = useCallback(() => {
    setTradeSettingsByChain((prev) => {
      const updatedTradeSettings = prev.map((item) => {
        if (item.key === presetSelected.key) {
          return {
            ...item,
            [sideSelected]: {
              ...item[sideSelected],
              mevProtect: !item[sideSelected].mevProtect,
            },
          }
        }
        return item
      })
      return updatedTradeSettings
    })
  }, [presetSelected.key, sideSelected])

  if (activeChain === TYPE_CHAIN.ARB) {
    // TODO: Implement ARB chain settings when available
    return <></>
  }

  return (
    <>
      {type === 2 ? (
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-1">
            {tradeSettingsByChain.map((preset) => (
              <div
                role="button"
                key={preset.key}
                className={`flex items-center justify-center font-[330] text-[11px] px-3 py-1 rounded-[5px] cursor-pointer ${
                  !!transactionType && selectedPresetKey[transactionType] === preset.key
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
                {/* <img
                  src="/images/icons/ic-settings.svg"
                  alt="settings"
                  className="w-[16px] h-[16px] rounded-full cursor-pointer hover:scale-110 transition-transform duration-200"
                  onClick={() => setOpen(true)}
                /> */}
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
              {tradeSettingsByChain.map((preset) => (
                <button
                  key={preset.key}
                  className={cn(
                    'text-[calc(12rem/16)] leading-3',
                    !!transactionType && selectedPresetKey[transactionType] === preset.key
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
              options={tradeSettingsByChain.map((preset) => ({
                value: preset.key.toString(),
                label: `P${preset.key}`,
              }))}
              value={presetSelected.key.toString()}
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
        className="!bg-[#232329]"
        hiddenBgImg
        repositionInputs={false}
      >
        <div className={cn('overflow-y-auto no-scrollbar max-h-[calc(80vh-150px)]', isDesktop && 'max-w-[485px]')}>
          <PresetSelector
            presets={tradeSettingsByChain}
            selectedKey={presetSelected.key}
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
          <SideSelector selected={sideSelected} onSelect={setSideSelected} />
          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-[330] text-[15px] text-white leading-none">{t('tradeSettings.antiClipMode')}</span>
              {/* <TooltipWithInfo tooltipKey="tradeSettings.antiClipModeTooltip" /> */}
              <AntiClipModeExplained />
            </div>
            <div
              className={`flex items-center w-11 h-[24px] px-[3px] rounded-full cursor-pointer ${
                presetSelected[sideSelected].mevProtect ? 'justify-end bg-[#843BEA]' : 'justify-start bg-[#ECECED1F]'
              }`}
              onClick={handleMevProtectToggle}
            >
              <div className=" w-[18px] h-[18px] bg-white rounded-full transition-all duration-300 ease-in-out"></div>
            </div>
          </div>
          <SlippageSelector
            value={presetSelected[sideSelected].slippage}
            onChange={handleSlippageChange}
            error={
              presetSelected[sideSelected].slippage &&
              (Number(presetSelected[sideSelected].slippage) < 1 || Number(presetSelected[sideSelected].slippage) > 50)
                ? t('tradeSettings.customSlippageError')
                : undefined
            }
          />
          <FeeSelector
            presetSelected={presetSelected}
            sideSelected={sideSelected}
            onChange={handleFeeChange}
            networkFee={networkFee}
            activeChain={activeChain}
            priorityFeePriceKeyToLabel={priorityFeePriceKeyToLabel}
            isFeeError={isFeeError}
            setIsFeeError={setIsFeeError}
          />
          <CostSummary
            activeChain={activeChain}
            presetSelected={presetSelected}
            sideSelected={sideSelected}
            networkFee={networkFee}
          />

          <div className="mt-4 p-1/5 flex items-center gap-2">
            <img src="/images/icons/danger_2.svg" alt="danger" className="w-5 h-5" />
            <div className="font-[350] text-[11px] text-[#605E68] leading-[1.5]">{t('tradeSettings.danggerNote')}</div>
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
              !presetSelected[sideSelected].slippage ||
              isNaN(Number(presetSelected[sideSelected].slippage)) ||
              Number(presetSelected[sideSelected].slippage) < 1 ||
              Number(presetSelected[sideSelected].slippage) > 50 ||
              isFeeError
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

export const TradeSettingsConfirm = () => {
  const { t } = useTranslation()
  const { watch } = useFormContext<OrderFormType>()
  const [isOpen, setIsOpen] = useState(false)
  const activeChain =
    (useAppSelector((state) => state.newWallet.activeChain) as keyof typeof initialTradeSettings) || TYPE_CHAIN.SOLANA
  const tradeSettings = useAppSelector((state) => state.tradeSettings.settings) || initialTradeSettings
  const selectedPresetKey = useAppSelector((state) => state.tradeSettings.selectedPreset[activeChain])
  const networkFee = useGetNetworkFee(activeChain as TYPE_CHAIN)
  const newConfigs = useAppSelector((state) => state.tradeSettings.settings)?.[activeChain]?.[
    selectedPresetKey?.Buy - 1
  ]
  const transactionType = TransactionType.Buy
  const { priorityFeePrice } = useNetworkFee()

  const [tradeSettingsByChain, setTradeSettingsByChain] = useState<TradeSetting[]>(initialTradeSettings[activeChain])
  const [presetSelected, setPresetSelected] = useState<TradeSetting>(tradeSettingsByChain[0])
  const [sideSelected, setSideSelected] = useState<TransactionType>(TransactionType.Buy)
  const [isFeeError, setIsFeeError] = useState(false)

  useEffect(() => {
    setTradeSettingsByChain(tradeSettings[activeChain] || initialTradeSettings[activeChain])
  }, [activeChain, tradeSettings])

  useEffect(() => {
    setSideSelected(TransactionType.Buy)
  }, [selectedPresetKey])

  useEffect(() => {
    const newPresetSelected = tradeSettingsByChain.find((preset) => preset.key === selectedPresetKey.Buy)
    if (newPresetSelected) {
      setPresetSelected(newPresetSelected)
    }
  }, [tradeSettingsByChain, selectedPresetKey])

  const handleDetailsToggle = (e: React.SyntheticEvent<HTMLDetailsElement, Event>) => {
    setIsOpen(e.currentTarget.open)
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
  const priorityFeePriceKeyToLabel = useCallback(
    (key: string) => {
      switch (key) {
        case 'medium':
          return t('tradeSettings.marketPrice')
        case 'high':
          return t('tradeSettings.quick')
        case 'veryHigh':
          return t('tradeSettings.fastest')
        default:
          return key
      }
    },
    [t],
  )

  const handleFeeChange = useCallback(
    (type: string, value?: string) => {
      setTradeSettingsByChain((prev) => {
        const updatedTradeSettings = prev.map((item) => {
          if (item.key === presetSelected.key) {
            return {
              ...item,
              [sideSelected]: {
                ...item[sideSelected],
                fee: {
                  type,
                  value,
                },
              },
            }
          }
          return item
        })
        return updatedTradeSettings
      })
    },
    [presetSelected.key, sideSelected],
  )

  const handleSlippageChange = useCallback(
    (value: string) => {
      setTradeSettingsByChain((prev) => {
        const updatedTradeSettings = prev.map((item) => {
          if (item.key === presetSelected.key) {
            return {
              ...item,
              [sideSelected]: {
                ...item[sideSelected],
                slippage: value,
              },
            }
          }
          return item
        })
        return updatedTradeSettings
      })
    },
    [presetSelected.key, sideSelected],
  )

  if (activeChain === TYPE_CHAIN.ARB) {
    // TODO: Implement ARB chain settings when available
    return <></>
  }
  return (
    <div className="block">
      <details className="group" onToggle={handleDetailsToggle}>
        <summary className="flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex justify-between overflow-x-auto no-scrollbar py-[13px]">
            <div className="flex items-center gap-[3px] text-[13px] font-normal text-[#6C6A74]">
              <span>{t('orderSettings.setGlobalSettings')}</span>
            </div>
            <div className="flex item-center gap-3 mr-2">
              <div className="flex items-center gap-[3px]">
                <XTooltip.Details
                  title={<img src="/images/icons/slippage.svg" alt="slippage" className="h-3 w-3 cursor-pointer" />}
                  children={t('tradeSettings.slippage')}
                />
                <span className="font-[400] text-[12px] text-[#908E98] whitespace-nowrap">
                  {formatPercent(
                    transactionType === TransactionType.Buy
                      ? presetSelected?.Buy?.slippage
                      : presetSelected?.Sell?.slippage,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-center gap-[3px]">
                <XTooltip.Details
                  title={<img src="/images/icons/gas-fee.svg" alt="gas-fee" className="h-3 cursor-pointer" />}
                  children={t('tradeSettings.priorityFee')}
                />
                <span className="font-[400] text-[12px] text-[#908E98] whitespace-nowrap">
                  {formatAmount(
                    transactionType === TransactionType.Buy
                      ? priorityFeePrice[presetSelected?.Buy?.fee?.type]
                      : priorityFeePrice[presetSelected?.Sell?.fee?.type],
                    {
                      roundMode: 'ceil',
                      unit: 'SOL',
                    },
                  )}
                </span>
              </div>
              <div className="flex items-center justify-end gap-[3px] text-right">
                <XTooltip.Details
                  title={<img src="/images/icons/mev.svg" alt="mev" className="h-3 cursor-pointer" />}
                  children={t('tradeSettings.antiClipping')}
                />
                <span className="font-[400] text-[12px] text-[#908E98] whitespace-nowrap">
                  {transactionType === TransactionType.Buy
                    ? presetSelected?.Buy?.mevProtect
                      ? t('tradeSettings.antiClippingOn')
                      : t('tradeSettings.antiClippingOff')
                    : presetSelected?.Sell?.mevProtect
                      ? t('tradeSettings.antiClippingOn')
                      : t('tradeSettings.antiClippingOff')}
                </span>
              </div>
            </div>
          </div>
          <button type="button" className="size-[16px] flex items-center justify-center pointer-events-none">
            <IconChevronUp className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
          </button>
        </summary>
        <div className="block">
          <SlippageSelector
            value={presetSelected[sideSelected].slippage}
            onChange={handleSlippageChange}
            error={
              presetSelected[sideSelected].slippage &&
              (Number(presetSelected[sideSelected].slippage) < 1 || Number(presetSelected[sideSelected].slippage) > 50)
                ? t('tradeSettings.customSlippageError')
                : undefined
            }
          />
          <FeeSelector
            presetSelected={presetSelected}
            sideSelected={sideSelected}
            onChange={handleFeeChange}
            networkFee={networkFee}
            activeChain={activeChain}
            priorityFeePriceKeyToLabel={priorityFeePriceKeyToLabel}
            isFeeError={isFeeError}
            setIsFeeError={setIsFeeError}
          />
          <CostSummary
            activeChain={activeChain}
            presetSelected={presetSelected}
            sideSelected={sideSelected}
            networkFee={networkFee}
          />

          <div className="mt-6 bg-[#ECECED0A] p-2 rounded-lg flex items-center gap-2">
            <img src="/images/icons/danger.svg" alt="danger" className="w-5 h-5" />
            <div className="font-[350] text-[11px] text-white/70 leading-[1.5]">{t('tradeSettings.danggerNote')}</div>
          </div>
        </div>
      </details>
    </div>
  )
}

export default TradeSettingsBottomSheet
