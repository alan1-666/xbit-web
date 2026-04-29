import { IconHeaderSearch } from '@/components/icon'
import useDebounceValue from '@/hooks/useDebounceValue'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const TokenSearch = ({
  open,
  setSearch,
}: {
  setSearch: Dispatch<SetStateAction<string>>
  open: boolean
}) => {
  const { t } = useTranslation()
  const ref = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState<string>('')
  const debounceValue = useDebounceValue(value, 700)

  useEffect(() => {
    setSearch(debounceValue)
  }, [debounceValue, setSearch])

  useEffect(() => {
    if (open && ref.current) {
      setTimeout(() => {
        ref.current?.focus()
        ref.current?.click()
      }, 100)
    }
  }, [open])

  // Handle clear search
  const handleClearSearch = () => {
    setValue('')
  }

  return (
    <div className="flex justify-center sticky top-0 z-10">
      <div className="group w-full flex items-center">
        <div className={`rounded-full transition-all duration-300 flex-1`}>
          <div className="bg-[#ECECED]/8 rounded-full py-2 px-[15px] inline-flex items-center w-full transition-all duration-300">
            <IconHeaderSearch className="mr-1.5 text-white" />
            <input
              ref={ref}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
              }}
              className="w-full h-full bg-transparent outline-none text-[14px] text-white placeholder:text-[#FFFFFF80]"
              placeholder={t('search.titlePc')}
              inputMode="search"
              autoFocus={true}
            />
            {value.length > 0 && (
              <img
                className="size-[calc(1rem*(14/16))] cursor-pointer"
                src="/images/icons/circle-cancel.svg"
                alt=""
                onClick={handleClearSearch}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
