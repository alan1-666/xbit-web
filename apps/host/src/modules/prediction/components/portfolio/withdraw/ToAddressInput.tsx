import { useTranslation } from 'react-i18next'
import { useFormContext, useWatch } from 'react-hook-form'
import { WithdrawFormData } from '../WithdrawForm'

interface ToAddressInputProps {
  error?: string
}

export const ToAddressInput = ({ error }: ToAddressInputProps) => {
  const { t } = useTranslation()
  const { setValue } = useFormContext<WithdrawFormData>()
  const value = useWatch<WithdrawFormData, 'recipientAddress'>({ name: 'recipientAddress' })

  return (
    <div className="space-y-2">
      <input
        type="text"
        className="w-full rounded-[8px] border border-[#79778C29] bg-transparent px-3 py-2.5 text-[13px] leading-[100%] text-[#FBFBFB] placeholder:text-[#6C6A74]"
        placeholder={t('exchange.recipientAddress')}
        value={value}
        onChange={(e) => setValue('recipientAddress', e.target.value)}
      />
      {error && <div className="mt-1 text-[12px] leading-none font-normal text-[#FF353C]">{error}</div>}
    </div>
  )
}
