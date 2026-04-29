import { MevProtectionType, TransactionType } from '@/@generated/gql/graphql-trading'
import { useTradeConfig } from '@/hooks/useTradeConfig'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { formatAmount, formatPercent } from '@/lib/format'
import { useAppSelector } from '@/redux/store'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { OrderFormType } from '../../useOrderForm'
import NewTradeSettings, { NewTradeSettingsInForm } from '@/components/common/tradeSetting'
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@components/ui/accordion'
import { cn } from '@/lib/utils'
import { IconCash } from '@/components/icon/stroke/IconCash'
import { IconShield } from '@/components/icon/stroke/IconShield'
import IconShield2 from '@/components/icon/stroke/IconShield2'
import { IconShield3 } from '@/components/icon/stroke/IconShield3'

export const getIonShieldByChainSolana = (mevProtect: MevProtectionType) => {
  if (mevProtect === MevProtectionType.Off) return <IconShield2 className="w-3 h-3 text-[#878787]" />
  if (mevProtect === MevProtectionType.Normal) return <IconShield className="w-3 h-3 text-[#878787]" />
  if (mevProtect === MevProtectionType.Secure) return <IconShield3 className="w-3 h-3 text-[#878787]" />
  return <IconShield3 className="w-3 h-3 text-[#878787]" />
}

export const getTextMevByChainSolana = (t: any, mevProtect: MevProtectionType) => {
  if (mevProtect === MevProtectionType.Off) return t('tradeSettings.MevClose')
  if (mevProtect === MevProtectionType.Normal) return t('tradeSettings.MevStandard')

  if (mevProtect === MevProtectionType.Secure) return t('tradeSettings.MevSecure')
  return <IconShield3 className="w-3 h-3 text-[#878787]" />
}

const TradeSetting = () => {
  const { t } = useTranslation()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  const { watch } = useFormContext<OrderFormType>()
  const transactionType = watch('transactionType') || TransactionType.Buy
  const { config, fee, briberyFee, slippage, isWarningMinPriorityFee, isWarningMinBriberyFee } = useTradeConfig({
    transactionType: transactionType as TransactionType,
  })
  const [openTradeSettings, setOpenTradeSettings] = useState(false)

  return (
    <>
      {/* <TradeSettingsBottomSheet
        open={openTradeSettings}
        setOpen={setOpenTradeSettings}
        type={2}
        transactionType={transactionType as TransactionType}
      /> */}
      <NewTradeSettings
        open={openTradeSettings}
        setOpen={setOpenTradeSettings}
        type={2}
        transactionType={transactionType as TransactionType}
      />
      <Accordion type="single" collapsible>
        <AccordionItem value="open" className="border-none">
          <AccordionTrigger className="pt-2.5 pb-0">
            <div className="w-full flex items-center mr-1">
              <div className="flex-1 overflow-x-auto no-scrollbar">
                <div
                  className={cn('w-full flex sm:grid item-center justify-between gap-1.5', {
                    'sm:grid-cols-4': activeChain === TYPE_CHAIN.SOLANA,
                    'sm:grid sm:grid-cols-3': activeChain !== TYPE_CHAIN.SOLANA,
                  })}
                >
                  <div className="flex items-center gap-[3px]">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <img src="/images/icons/slippage.svg" alt="slippage" className="h-3 w-3 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[360px]">
                          <p className="text-xs leading-none">{t('tradeSettings.slippage')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-[11px] sm:text-xs font-[330] whitespace-nowrap">
                      {formatPercent(slippage * 100)}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-[3px]">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <img src="/images/icons/gas-fee.svg" alt="gas-fee" className="h-3 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[360px]">
                          <p className="text-xs leading-none">{t('tradeSettings.priorityFee')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span
                      className={cn('text-[11px] sm:text-xs font-[330] whitespace-nowrap', {
                        'text-[#EA963A]': isWarningMinPriorityFee,
                      })}
                    >
                      {formatAmount(fee, {
                        roundMode: 'ceil',
                      })}
                    </span>
                  </div>
                  {activeChain === TYPE_CHAIN.SOLANA && (
                    <div className="flex items-center justify-center gap-[3px]">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <IconCash className="w-4 h-4 ml-3 text-[#878787]" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[360px]">
                            <p className="text-xs leading-none">{t('tradeSettings.priorityFee')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span
                        className={cn('text-[11px] sm:text-xs font-[330] whitespace-nowrap', {
                          'text-[#EA963A]': isWarningMinBriberyFee,
                        })}
                      >
                        {formatAmount(briberyFee, {
                          roundMode: 'ceil',
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-[3px] text-right">
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger type="button">
                          {activeChain !== TYPE_CHAIN.SOLANA &&
                            (config?.mevProtect ? (
                              <IconShield className="w-3 h-3 text-[#878787]" />
                            ) : (
                              <IconShield2 className="w-3 h-3 text-[#878787]" />
                            ))}
                          {activeChain === TYPE_CHAIN.SOLANA && getIonShieldByChainSolana(config?.mevProtectionType)}
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[360px]">
                          <p className="text-xs leading-none">{t('tradeSettings.antiClipping')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-[11px] sm:text-xs font-[330] whitespace-nowrap">
                      {activeChain !== TYPE_CHAIN.SOLANA &&
                        (config?.mevProtect ? t('tradeSettings.antiClippingOn') : t('tradeSettings.antiClippingOff'))}
                      {activeChain === TYPE_CHAIN.SOLANA && getTextMevByChainSolana(t, config?.mevProtectionType)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <NewTradeSettingsInForm
              open={openTradeSettings}
              setOpen={setOpenTradeSettings}
              transactionType={transactionType as TransactionType}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export default TradeSetting
