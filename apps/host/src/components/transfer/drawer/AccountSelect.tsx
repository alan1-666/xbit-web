import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'
import { useTranslation } from 'react-i18next'

export interface AccountSelectProps {
  value?: string
  onValueChange?: (value: string) => void
}

export const AccountSelect = (props: AccountSelectProps) => {
  const { value, onValueChange } = props
  const { t } = useTranslation()
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="bg-transparent p-0 border-none shadow-none h-[18px] gap-1 justify-start max-w-[125px]">
        <SelectValue placeholder="Select account" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="MEME">{t('assets.transfers.memeAccount')}</SelectItem>
          <SelectItem value="CONTRACT">{t('assets.transfers.contractAccount')}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default AccountSelect
