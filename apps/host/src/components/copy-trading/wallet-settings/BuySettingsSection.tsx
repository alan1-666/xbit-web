import { ConfigBuyType } from '@/@generated/gql/graphql-trading'
import { Radio } from '@/components/ui/Radio'
import XTooltip from '@/components/ui/XTooltip'
import { formatCurrency } from '@/lib/number'
import { cn } from '@/lib/utils'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { FC } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useCopyTradeContextFields } from './CopyTradeContext'
import { handleOnInput, WalletSettingsFormData } from './schema'
import { useNativeTokenPrice } from '@/hooks/useNativeTokenPrice'
import { useNativeTokenSymbol } from '@/hooks/useActiveChain'

const MAX_DECIMAL_PART = 6
const BuySettingsSection: FC = () => {
  const pcMode = Boolean(useCopyTradeContextFields(['pcMode']).pcMode.get)
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<WalletSettingsFormData>()
  const { t } = useTranslation()
  const buyType = watch('buyType')
  const configAmount = watch('configAmount')
  const activeWallet = useSelector(_activeWallet)
  const nativeTokenPrice = useNativeTokenPrice()
  const nativeTokenSymbol = useNativeTokenSymbol()
  const balance = activeWallet?.balance?.formatted

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof WalletSettingsFormData) => {
    let value = e.target.value.replace(/[^0-9.]/g, '')
    if (value.includes('.')) {
      const parts = value.split('.')
      value = parts[0] + '.' + parts[1]
    }
    setValue(fieldName, value)
  }
  return (
    <div className="mt-[16px]">
      <label className="justify-start text-primary text-base font-normal inline-flex items-center gap-1">
        {t('walletCopy.settings.buySettings')}{' '}
        <XTooltip
          descriptionClassName='whitespace-pre-line'
          description={t(
            'listCoin.copyTrade.hint.buySettings.intro'
          )}
          title={t('walletCopy.settings.buySettings')}
        />
      </label>

      <div className="flex flex-row mt-3.5 space-x-6">
        <Controller
          name="buyType"
          control={control}
          render={({ field }) => (
            <>
              <Radio
                id="max-amount"
                name={field.name}
                value={ConfigBuyType.MaxAmount}
                checked={field.value === ConfigBuyType.MaxAmount}
                onChange={() => field.onChange(ConfigBuyType.MaxAmount)}
                label={t('walletCopy.settings.maxFollow')}
                labelClassName={cn("text-[#FFFFFFCC]", pcMode ? "block w-full text-center h-[29px] rounded-[4px] leading-[29px]" : "")}
                labelClassNameActive={cn(pcMode ? "bg-[#3E2761] text-[#C8A7FD]" : "")}
                className={cn(pcMode ? "flex-1 mr-[8px]" : "mr-[32px]")}
                pcMode={pcMode}
              />
              <Radio
                id="fixed-amount"
                name={field.name}
                value={ConfigBuyType.FixedAmount}
                checked={field.value === ConfigBuyType.FixedAmount}
                onChange={() => field.onChange(ConfigBuyType.FixedAmount)}
                label={t('walletCopy.settings.fixedBuy')}
                labelClassName={cn("text-[#FFFFFFCC]", pcMode ? "block w-full text-center h-[29px] rounded-[4px] leading-[29px]" : "")}
                labelClassNameActive={cn(pcMode ? "bg-[#3E2761] text-[#C8A7FD]" : "")}
                className={cn(pcMode ? "flex-1" : "")}
                pcMode={pcMode}
              />
            </>
          )}
        />
      </div>

      <div className="mt-[10px]">
        <div
          className={cn('w-full relative rounded-md bg-[#79778C29] border-solid border-[1px] box-border h-11 flex flex-row items-center justify-between p-1 gap-0 text-center text-sm text-white/70', errors.configAmount?.message
            ? 'border-red-500'
            : 'border-[#222224]')}
        >
          {/* {buyType === ConfigBuyType.MaxAmount ? (
            <span
              className="rounded bg-[#141414] h-9 inline-flex flex-row items-center justify-center py-0 px-2 box-border text-center
              text-[14px] text-[#9B9B9B] "
            >
              {t('walletCopy.settings.quantity')}
            </span>
          ) : (
            <span
              className="rounded bg-[#141414] h-9 inline-flex flex-row items-center justify-center py-0 px-2 box-border text-center
            text-[14px] text-[#9B9B9B] "
            >
              {t('walletCopy.settings.amount')}
            </span>
          )} */}
          <span className="rounded bg-[#141414] flex items-center justify-center py-0 px-2 box-border text-center text-[14px] text-[rgba(255, 255, 255, 0.7)] whitespace-nowrap block min-w-[44px] h-full">
            {t('walletCopy.settings.amount')}
          </span>
          <input
            type="text"
            className={cn('flex-grow text-sm bg-transparent outline-none px-2 text-center font-semibold text-white')}
            autoComplete="off"
            value={configAmount}
            {...register('configAmount')}
            onKeyDown={(e) => handleOnInput(e, MAX_DECIMAL_PART, false, false)}
            onChange={(e) => handleOnChange(e, 'configAmount')}
          />
          <span
            className="rounded bg-[#141414] h-9 inline-flex flex-row items-center justify-center py-0 px-1.5 box-border text-center
            text-[14px] text-[#9B9B9B]"
          >
            {nativeTokenSymbol}
          </span>
        </div>

        <div className="text-xs text-[#9B9B9B] font-normal mt-2.5 flex flex-row items-center justify-between">
          <span>≈${formatCurrency(parseFloat(`${configAmount}` || '0') * nativeTokenPrice)}</span>
          <span>
            {t('walletCopy.settings.balanceWithUnit')}
            {balance} {nativeTokenSymbol}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BuySettingsSection
