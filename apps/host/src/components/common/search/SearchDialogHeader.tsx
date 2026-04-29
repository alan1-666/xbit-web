import { useTranslation } from 'react-i18next'
import { IconChevronLeft } from '@components/icon'
import { useEffect, useRef } from 'react'

interface SearchDialogHeaderProps {
  value: string
  setValue: (value: string) => void
  closeDialog: () => void
  open: boolean
}

export const SearchDialogHeader = (props: SearchDialogHeaderProps) => {
  const { value, setValue, closeDialog, open } = props
  const { t } = useTranslation()
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open) {
      ref.current?.focus()
    } else {
      ref.current?.blur()
    }
  }, [open, ref.current])
  return (
    <div className="flex items-center gap-2">
      <button
        className="text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))] text-[#FFFFFF99] break-keep"
        onClick={closeDialog}
      >
        <IconChevronLeft className="text-white" />
      </button>
      <div className="flex items-center justify-between w-full pl-[calc(1rem*(15/16))] pr-[calc(1rem*(19/16))] py-[calc(1rem*(13/16))] bg-(--bg-secondary) border border-solid border-(--bg-secondary) rounded-[200px]">
        <img alt="" className="size-[calc(1rem*(16/16))] mr-1 translate-y-[1px]" src="/images/icons/search-icon.svg" />
        <input
          ref={ref}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t('search.placeholder')}
          type="input"
          className="w-full flex-1 outline-none text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))]"
        />
        {value.length > 0 && (
          <img
            className="size-[calc(1rem*(18/16))] cursor-pointer"
            src="/images/icons/icon-x.svg"
            alt=""
            onClick={() => setValue('')}
          />
        )}
      </div>
    </div>
  )
}
