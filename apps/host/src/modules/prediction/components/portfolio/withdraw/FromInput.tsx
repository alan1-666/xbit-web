import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { formatAmount } from '@/lib/format'
import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormContext, useWatch } from 'react-hook-form'
import { WithdrawFormData } from '../WithdrawForm'

const mockOriginToken = {
  symbol: 'USDC',
  name: 'USD Coin',
  image: '/images/icons/chains/ic-usdc.svg',
  tokenId: 'polymarket-usdc',
  decimals: 6,
}

interface FromInputProps {
  availableBalance: number
  error?: string
}

export const FromInput = ({ availableBalance, error }: FromInputProps) => {
  const { t } = useTranslation()
  const { setValue } = useFormContext<WithdrawFormData>()
  const value = useWatch<WithdrawFormData, 'amount'>({ name: 'amount' })
  const originTokenPrice = 1

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^0-9.,]/g, '')
    newValue = newValue.replace(/,/g, '.')
    if (newValue.includes('.')) {
      const parts = newValue.split('.')
      newValue = parts[0] + '.' + parts[1].slice(0, 6)
    }
    setValue('amount', newValue)
  }

  const amountValue = value ? parseFloat(value) : 0

  return (
    <div className="rounded-[8px] border border-[#79778C29] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <LogoWithChain logo={mockOriginToken.image} name={mockOriginToken.name} logoClassName="size-6 min-w-6" />
          <span className="text-[14px] leading-5 text-[#FBFBFB]">{mockOriginToken.symbol}</span>
        </div>
        <input
          className="flex-1 bg-transparent text-right text-[20px] leading-5 font-semibold text-white outline-none placeholder:text-[#5C5C66]"
          placeholder="0.0"
          inputMode="decimal"
          onChange={handleInputChange}
          value={value}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        {error ? (
          <span className="text-[12px] text-[#FF353C]">{error}</span>
        ) : (
          <span className="text-[12px] text-[#6C6A74]">
            ≈{' '}
            {formatAmount(amountValue * originTokenPrice, {
              showCurrency: true,
              roundMode: 'floor',
            })}
          </span>
        )}
        <div className="flex items-center gap-1">
          <span className="text-[12px] text-[#605E68]">
            {formatAmount(availableBalance, {
              roundMode: 'floor',
              unit: 'USDC',
            })}
          </span>
          <span
            className="cursor-pointer text-[12px] font-medium whitespace-nowrap text-[#843BEA] uppercase"
            onClick={() => setValue('amount', availableBalance.toString())}
          >
            {t('assets.transfers.max')}
          </span>
        </div>
      </div>
    </div>
  )
}
