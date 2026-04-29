import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { eventCategoryTabs } from '@/modules/prediction/data/event-category-tabs'
import { cn } from '@/lib/utils'

const ELECTIONS_SUB_TAB_PARAM = 'tab'

export const ElectionsSidebar = ({ className }: { className?: string }) => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedValue = searchParams.get(ELECTIONS_SUB_TAB_PARAM) || eventCategoryTabs[0].value

  const handleTabClick = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set(ELECTIONS_SUB_TAB_PARAM, value)
    setSearchParams(next)
  }

  return (
    <div
      className={cn(
        'hidden xl:block w-57 shrink-0 mr-5 sticky top-15 self-start h-[calc(288px)]',
        className,
      )}
    >
      <h2 className="text-sm font-normal leading-none text-[#908E98] uppercase py-3">
        {t('prediction.election.dashboards')}
      </h2>
      <div className="flex flex-col gap-y-2 pb-6 overflow-y-auto scrollbar-hide [scrollbar-gutter:stable] xl:mt-1.5">
        {eventCategoryTabs.map((tab) => {
          const isActive = selectedValue === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabClick(tab.value)}
              className={cn(
                'rounded-[6px] border border-transparent px-2.5 py-3 w-full transition-colors',
                isActive
                  ? 'bg-[#230D43] border-[#2E1455] text-white'
                  : 'bg-transparent text-[#A1A1AA] hover:bg-[#18181B]',
              )}
            >
              <div className="flex justify-between items-center gap-x-2.5 flex-1">
                {tab.iconSrc ? (
                  <div className="shrink-0">
                    <img src={tab.iconSrc} alt="" className="size-5" loading="lazy" />
                  </div>
                ) : (
                  <div className="size-5 shrink-0" />
                )}
                <p className="text-sm font-semibold">
                  {t(`prediction.categories.${tab.value}`) || tab.label}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
