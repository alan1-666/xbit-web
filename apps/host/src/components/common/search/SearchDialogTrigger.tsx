import { DialogTrigger } from '@components/ui/dialog.tsx'
import { useTranslation } from 'react-i18next'

export const SearchDialogTrigger = () => {
  const { t } = useTranslation()
  return (
    <DialogTrigger asChild>
      <div className="w-full flex items-center justify-between pl-[calc(1rem*(15/16))] pr-[calc(1rem*(19/16))] py-[calc(1rem*(9/16))] bg-(--bg-secondary) border border-solid border-(--bg-secondary) rounded-[200px] cursor-text">
        <div className="w-full flex-1 outline-none text-[calc(1rem*(14/16))] text-[#FFFFFFB2] leading-[calc(1rem*(14/16))] line-clamp-1">
          {t('search.placeholder')}
        </div>
        <img alt="" className="size-[calc(1rem*(18/16))]" src="/images/icons/search-icon.svg" />
      </div>
    </DialogTrigger>
  )
}
