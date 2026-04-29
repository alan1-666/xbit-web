import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { useTranslation } from 'react-i18next'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

export type ACCOUNT_TYPE = 'MEME' | 'CONTRACT' | 'PREDICTION'

export interface AccountTypeSelectProps {
  value?: string
  onValueChange?: (value: ACCOUNT_TYPE) => void
}

export const AccountTypeSelect = (props: AccountTypeSelectProps) => {
  const { value, onValueChange } = props
  const { t } = useTranslation()
  const isPredictionEnabled = useFeatureIsOn('enable_prediction')

  return (
    <Select defaultValue="MEME" value={value} onValueChange={onValueChange}>
      <SelectTrigger className="border border-[#79778C29] rounded-[8px] px-3 py-2.5 h-10">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent className="bg-[#212127]">
        <SelectGroup>
          <SelectItem value="MEME">
            <div className="flex items-center gap-2">{t('assets.transfers.memeAccount')}</div>
          </SelectItem>
          <SelectItem value="CONTRACT">
            <div className="flex items-center gap-2">{t('assets.transfers.contractAccount')}</div>
          </SelectItem>
          {isPredictionEnabled && (
            <SelectItem value="PREDICTION">
              <div className="flex items-center gap-2">{t('assets.transfers.predictionAccount')}</div>
            </SelectItem>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
