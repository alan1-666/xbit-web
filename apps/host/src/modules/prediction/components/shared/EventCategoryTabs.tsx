import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { eventCategoryTabs } from '@/modules/prediction/data/event-category-tabs'
import { cn } from '@/lib/utils'

const ELECTIONS_SUB_TAB_PARAM = 'tab'

export const EventCategoryTabs = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const selectedValue = searchParams.get(ELECTIONS_SUB_TAB_PARAM) || eventCategoryTabs[0].value

  const handleTabClick = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set(ELECTIONS_SUB_TAB_PARAM, value)
    setSearchParams(next)
  }

  return (
    <div className="flex flex-1 justify-between gap-2 pb-2 xl:hidden">
      {eventCategoryTabs.map((tab) => {
        const isActive = selectedValue === tab.value

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabClick(tab.value)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 transition-colors min-w-0 md:px-4',
              isActive ? 'bg-[#230D43] text-white' : 'text-[#908E98] hover:text-white',
            )}
          >
            {tab.iconSrc ? (
              <img src={tab.iconSrc} alt="" className="size-5 shrink-0 object-contain" />
            ) : (
              <div className="size-5 shrink-0" />
            )}
            <span className="text-center text-xs font-normal leading-3">
              {t(`prediction.categories.${tab.value}`) || tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
