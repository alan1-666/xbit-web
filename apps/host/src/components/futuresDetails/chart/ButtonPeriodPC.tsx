import { Button } from '@/components/ui/button'
import { IntervalItem, intervalMap } from '../datafeeds'
import { useClickOutside } from '@/hooks/useClickOutside.ts'
import { cn } from '@/lib/utils.ts'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'

type ButtonPeriodProps = {
  currentPeriodList: IntervalItem[]
  handlePeriodListChange: (value: IntervalItem[]) => any
  activePeriod: string
  onPeriodChange?: (item: IntervalItem) => any
  onResetPeriodList?: (value: IntervalItem[]) => any
}

const ButtonPeriod = ({
  currentPeriodList,
  handlePeriodListChange,
  activePeriod,
  onPeriodChange,
  onResetPeriodList,
}: ButtonPeriodProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeShowPeriodList, setActiveShowPeriodList] = useState<IntervalItem[]>(currentPeriodList)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)

  const onTogglePeriodItem = (item: IntervalItem) => {
    if (!isEditing) {
      if (onPeriodChange) {
        onPeriodChange(item)
        setOpen(false)
      }
      return
    }

    const arr = activeShowPeriodList.map((periodItem) => {
      return {
        ...periodItem,
      }
    })
    const index = arr.findIndex((periodItem) => {
      return periodItem.value === item.value
    })
    if (index === -1) {
      return
    }
    arr[index].show = !arr[index].show

    setActiveShowPeriodList(arr)
  }

  const onResetDefault = () => {
    setOpen(false)
    if (onResetPeriodList) {
      onResetPeriodList(intervalMap)
      return
    }
    handlePeriodListChange(intervalMap)
  }

  const onSave = () => {
    setOpen(false)
    handlePeriodListChange(activeShowPeriodList)
  }

  useEffect(() => {
    setActiveShowPeriodList(currentPeriodList)
  }, [currentPeriodList, open])

  useEffect(() => {
    if (!open) {
      return
    }

    setIsEditing(false)
  }, [open])

  useClickOutside([dropdownRef, buttonRef], () => {
    setOpen(false)
  })

  return (
    <div ref={containerRef} className="relative p-0.5 min-h-[34px] rounded-[4px] flex items-center">
      {currentPeriodList
        .filter((item) => item.show)
        .filter((item) => item.label !== '分时')
        .map((item) => (
          <div
            className={cn(
              'px-3 py-1.5 cursor-pointer text-[12px] font-[380] rounded-[2px] hover:text-primary',
              activePeriod === item.label ? 'bg-[#ECECED14] text-primary' : 'text-white/50',
            )}
            key={item.value + item.label}
            onClick={() => {
              if (onPeriodChange) {
                onPeriodChange(item)
              }
            }}
          >
            {item.label}
          </div>
        ))}
      {(currentPeriodList.filter((item) => item.show).filter((item) => item.label === activePeriod).length === 0) && (
        <div className="px-3 py-1.5 cursor-pointer text-[12px] font-[380] rounded-[2px] bg-[#ECECED14] text-primary">
          {activePeriod}
        </div>
      )}
      <div
        ref={buttonRef}
        className="px-2 h-[30px] flex items-center gap-1 rounded-[2px] cursor-pointer"
        onClick={() => {
          setOpen((prev) => {
            const next = !prev
            if (!next) {
              return next
            }
            if (buttonRef.current) {
              const buttonRect = buttonRef.current.getBoundingClientRect()
              const containerRect = containerRef.current?.getBoundingClientRect()
              setMenuPosition({
                top: buttonRect.bottom + 4,
                left: containerRect ? containerRect.left : buttonRect.left,
              })
            }
            return next
          })
        }}
      >
        <img
          className={`transition-transform duration-200 min-w-[6px] min-h-[6px] ${open ? 'rotate-180' : ''}`}
          src="/images/icons/icon-chevron-down.svg"
          alt="icon arrow down"
        />
      </div>
      {open &&
        menuPosition &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9999]"
              onClick={() => {
                setOpen(false)
              }}
            />
            <div
              ref={dropdownRef}
              className="fixed w-max bg-[var(--dropdown-bg)] rounded shadow-lg z-[10000] p-3 text-[12px] font-[380] leading-[12px]"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
              }}
            >
              <div className="grid grid-cols-4 gap-2">
                {activeShowPeriodList
                  .filter((item) => item.label !== '分时')
                  .map((item) => (
                    <div
                      key={item.value + item.label}
                      onClick={() => {
                        onTogglePeriodItem(item)
                      }}
                      className={cn(
                        `bg-[var(--btn-bg)] min-w-[64px] border-solid text-[var(--dropdown-text)] border cursor-pointer rounded-[8px] h-10 flex items-center justify-center relative  hover:text-primary`,
                        item.show
                          ? `border-gradient-toolbar-klineStyle bg-btn-active-bg border-[var(--highlight)] bg-[var(--dropdown-bg)] after:content-[''] after:absolute after:right-0 after:top-0 after:w-[23px] after:h-[12px] text-primary hover:text-primary`
                          : ``,
                      )}
                    >
                      {item.label}
                    </div>
                  ))}
              </div>
              <div
                className={cn(
                  'mt-3 pt-1 grid gap-2',
                  isEditing ? 'grid-cols-2' : 'grid-cols-1',
                )}
              >
                {isEditing ? (
                  <>
                    <Button
                      className="text-white w-full rounded-[50px] h-[calc(1rem*(44/16))] bg-[var(--btn-bg)]"
                      onClick={() => {
                        onResetDefault()
                      }}
                    >
                      {t('button.reset')}
                    </Button>
                    <Button
                      variant="gradient"
                      className="text-tertiary w-full rounded-[50px] h-[calc(1rem*(44/16))]"
                      onClick={() => {
                        onSave()
                      }}
                    >
                      {t('button.save')}
                    </Button>
                  </>
                ) : (
                  <Button
                    className="text-white w-full rounded-[50px] h-[calc(1rem*(44/16))] bg-[var(--btn-bg)]"
                    onClick={() => {
                      setIsEditing(true)
                    }}
                  >
                    {t('google.auth.whitelist.edit')}
                  </Button>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  )
}

export default ButtonPeriod
