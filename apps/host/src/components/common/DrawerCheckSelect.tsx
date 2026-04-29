import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils.ts'
import { UITab } from '@/types/uiTabs.ts'
import { ReactNode, useState, useRef, useMemo } from 'react'
import Text from './Text'
import { IconHeaderSearch } from '@/components/icon'
import { useTranslation } from 'react-i18next'

type DrawerCheckSelectProps = {
  options: UITab[]
  childrenTrigger: string | ReactNode
  value: string
  title?: string
  titleClassName?: string
  optionClassName?: string
  drawerContentClassName?: string
  onChange?: (value: string) => void
  isClose?: boolean
  headerClassName?: string
  optionsListClassName?: string
  search?: boolean
  searchPlaceholder?: string
  maxLabelWidth?: string
}

const DrawerCheckSelect = ({
  childrenTrigger,
  options,
  value,
  optionClassName,
  drawerContentClassName,
  onChange,
  title,
  titleClassName,
  isClose = true,
  headerClassName,
  optionsListClassName,
  search = false,
  searchPlaceholder = '',
  maxLabelWidth
}: DrawerCheckSelectProps) => {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  
  const [keyword, setKeyword] = useState<string>('')
  
  const handleClickChange = (value: string) => {
    if (onChange) {
      onChange(value)
    }
    setTimeout(() => {
      setOpen(false)
    }, 200)
  }

  const handleClearSearch = () => {
    setKeyword('')
  }

  const filterOptions = useMemo(() => {
  if (!keyword) return options || []

  const lowerKeyword = keyword.toLowerCase()

  return options.filter(item =>
    item?.value?.toLowerCase()?.includes(lowerKeyword)
  )
}, [options, keyword])


  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{childrenTrigger}</DrawerTrigger>
        <DrawerContent
          className={cn(
            'w-full bg-[#212127]  max-w-[768px]  mx-auto',
            drawerContentClassName,
          )}
        >
          <div className={cn('flex justify-between items-center relative h-[52px]', headerClassName)}>
            {title && (
              <Text className={cn('px-3 ', titleClassName)} text={title} fontSize={15} fontWeight="medium" />
            )}
            {isClose && (
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer absolute right-0 top-3.5 right-3"
                onClick={() => setOpen(false)}
                alt="icon-x"
              />
            )}
          </div>
          {
            search && <div className="group w-full flex items-cente px-3">
            <div
              className={`p-[1px] rounded-full mb-3 w-full`}
            >
              <div
                className={cn(
                  'rounded-full py-2 px-[15px] inline-flex items-center w-full transition-all duration-300 border border-[#2B2B33]',
                )}
              >
                <IconHeaderSearch className="mr-1.5 text-white" />
                <input
                  ref={ref}
                  type="text"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value)
                  
                  }}
                  className="w-full h-full bg-transparent outline-none text-[14px] text-white placeholder:text-[#FFFFFF80]"
                  placeholder={searchPlaceholder}
                  inputMode="search"
                />
                {keyword.length > 0 && (
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
          }
          <div className={cn("px-3 pb-5 max-h-[65vh] overflow-auto", optionsListClassName)}>
            {filterOptions.map((item, index) => {
              const isLast = index === filterOptions.length - 1
              return (
                <div
                  className={cn('flex justify-between items-center px-4 py-5 rounded-[10px] border border-[#2B2B33] bg-[#2B2B33] py-[18px]  cursor-pointer', 
                    !isLast && 'mb-[10px]',
                    optionClassName
                  )}
                  key={item.value}
                  onClick={() => {
                    handleClickChange(item.value)
                  }}
                >
                  <div className={cn('flex-1', maxLabelWidth ? `max-w-[${maxLabelWidth}] truncate` : 'max-w-[calc(1rem*(305/16))]')}>
                    <p className="text-[calc(1rem*(16/16))] leading-[calc(1rem*(16/16))]"> {item.label}</p>
                    {item?.desc && (
                      <p className="text-[#FFFFFFCC] text-[calc(1rem*(14/16))] leading-[calc(1rem*(21/16))] mt-2">
                        {item?.desc}
                      </p>
                    )}
                  </div>
                  {
                    value === item.value ? 
                    <img
                    className={cn(
                      'transition-opacity duration-300',
                    )}
                    src="/images/futuresDetail/selected-icon2.svg"
                    alt="icon selected"
                    /> : <div className='w-6 h-6 border border-[#37363D] rounded-full'></div>
                  }
                </div>
              )
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default DrawerCheckSelect
