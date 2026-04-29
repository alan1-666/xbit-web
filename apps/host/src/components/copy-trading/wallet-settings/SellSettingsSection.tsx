import { ConfigSellType } from '@/@generated/gql/graphql-trading'
import { Radio } from '@/components/ui/Radio'
import XTooltip from '@/components/ui/XTooltip'
import { cn } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import BatchSellSettings from './BatchSellSettings'
import { WalletSettingsFormData } from './schema'
import SingleSellSettings from './SingleSellSettings'
import { useCopyTradeContextFields } from './CopyTradeContext'

const SellSettingsSection: React.FC = () => {
  const pcMode = Boolean(useCopyTradeContextFields(['pcMode']).pcMode.get);
  const { control, watch } = useFormContext<WalletSettingsFormData>()
  const { t } = useTranslation()
  const [currentHint, setCurrentHint] = useState<keyof typeof descriptionList>(ConfigSellType.Auto)

  const sellType = watch('sellType')
  useEffect(() => {
    setCurrentHint(sellType as keyof typeof descriptionList)
  }, [sellType])


  const customSellType = watch('customSellType')
  const descriptionList = {
    [ConfigSellType.Auto]: [t('listCoin.copyTrade.hint.sellSettings.intro1')],
    [ConfigSellType.NoCopy]: [t('listCoin.copyTrade.hint.sellSettings.intro2')],
    'custom': [t('listCoin.copyTrade.hint.batch.intro')],
  }
  return (
    <div className="mt-[30px]">
      <label className="justify-start text-primary text-base font-normal inline-flex items-center gap-1">
        {t('walletCopy.settings.sellSettings')}{' '}
        <XTooltip
          description={t('listCoin.copyTrade.hint.sellSettings.intro')}
          title={t('walletCopy.settings.sellSettings')}
          descriptionClassName='whitespace-pre-line'
        />
      </label>

      <div className="flex flex-row mt-3.5 space-x-6 gap-[10px]">
        <Controller
          name="sellType"
          control={control}
          render={({ field }) => (
            <>
              <Radio
                id="auto-sell"
                name={field.name}
                value={ConfigSellType.Auto}
                checked={field.value === ConfigSellType.Auto}
                onChange={() => field.onChange(ConfigSellType.Auto)}
                label={t('walletCopy.settings.autoFollow')}
                className={cn(pcMode ? "flex-1 mr-0" : "flex-6 gap-[6px] mr-0")}
                labelClassName={cn(pcMode ? "block w-full h-[29px] text-center flex items-center justify-center rounded-[4px] text-[#908E98] border-[#2A2839] border bg-[#2A2839] h-[32px] leading-[32px]" : "text-[#FFFFFFCC]")}
                labelClassNameActive={cn(pcMode ? "text-[#C8A7FD] border-[#3E2761] bg-[#3E2761]" : "")}
                pcMode={pcMode}
              />
              <Radio
                id="no-sell"
                name={field.name}
                value={ConfigSellType.NoCopy}
                checked={field.value === ConfigSellType.NoCopy}
                onChange={() => field.onChange(ConfigSellType.NoCopy)}
                label={t('walletCopy.settings.noSell')}
                className={cn(pcMode ? "flex-1 mr-0" : "flex-6 gap-[6px] mr-0")}
                labelClassName={cn(pcMode ? "block w-full h-[29px] text-center flex items-center justify-center rounded-[4px] text-[#908E98] border-[#2A2839] border bg-[#2A2839] h-[32px] leading-[32px]" : "text-[#FFFFFFCC]")}
                labelClassNameActive={cn(pcMode ? "text-[#C8A7FD] border-[#3E2761] bg-[#3E2761]" : "")}
                pcMode={pcMode}
              />
              <Radio
                id="custom-sell"
                name={field.name}
                value="custom"
                checked={field.value === 'custom'}
                onChange={() => field.onChange('custom')}
                label={t('walletCopy.settings.customTPSL')}
                className={cn(pcMode ? "flex-1 mr-0" : "flex-7 gap-[6px] mr-0")}
                labelClassName={cn(pcMode ? "block w-full h-[29px] text-center flex items-center justify-center rounded-[4px] text-[#908E98] border-[#2A2839] border bg-[#2A2839] h-[32px] leading-[32px]" : "text-[#FFFFFFCC]")}
                labelClassNameActive={cn(pcMode ? "text-[#C8A7FD] border-[#3E2761] bg-[#3E2761]" : "")}
                pcMode={pcMode}
              />
            </>
          )}
        />
      </div>

      {sellType === 'custom' && (
        <div className="mt-5 bg-[#D3D5E60A] rounded-lg pl-3 pr-1.5 py-2.5">
          <div className="flex flex-row items-center justify-start mb-4 gap-2.5">
            <span className="min-w-[88px]">
              <Controller
                name="customSellType"
                control={control}
                render={({ field }) => (
                  <>
                    <Radio
                      id="single"
                      name={field.name}
                      value={ConfigSellType.SingleTpsl}
                      checked={field.value === ConfigSellType.SingleTpsl}
                      onChange={() => field.onChange(ConfigSellType.SingleTpsl)}
                      label={t('walletCopy.settings.single')}
                      labelClassName="text-[#FFFFFFCC]"
                    />
                  </>
                )}
              />
            </span>
            <span className="inline-flex items-center gap-1">
              <Controller
                name="customSellType"
                control={control}
                render={({ field }) => (
                  <Radio
                    id="batch"
                    name={field.name}
                    value={ConfigSellType.MultiTpsl}
                    checked={field.value === ConfigSellType.MultiTpsl}
                    onChange={() => field.onChange(ConfigSellType.MultiTpsl)}
                    label={t('walletCopy.settings.batch')}
                    labelClassName="text-[#FFFFFFCC]"
                  />
                )}
              />
              <XTooltip description={descriptionList[currentHint]} title={t('walletCopy.settings.customTPSL')} descriptionClassName='whitespace-pre-line' />
            </span>
          </div>

          {customSellType === ConfigSellType.SingleTpsl ? <SingleSellSettings /> : <BatchSellSettings />}
        </div>
      )}
    </div>
  )
}

export default SellSettingsSection
