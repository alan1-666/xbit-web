import { useAllCategories } from '@pages/meme/discover/desktop/hooks/useAllCategories.ts'
import { cn } from '@/lib/utils.ts'
import { useTranslation } from 'react-i18next'

export interface CategoriesBarProps {
  activeTab: string
  onChangeTab: (tab: string) => void
}

export const CategoriesBar = (props: CategoriesBarProps) => {
  const { activeTab, onChangeTab } = props
  const { data: categories } = useAllCategories()
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-3 text-[calc(14rem/16)] overflow-x-auto no-scrollbar">
      <div
        key="all"
        className={cn(
          'px-3 py-1 rounded-[6px] cursor-pointer transition-colors',
          activeTab === 'all' ? 'bg-[#3E2761] text-[#C8A7FD]' : 'text-[#FFFFFF80]',
        )}
        onClick={() => onChangeTab('all')}
      >
        {t('categories.allCategories')}
      </div>
      {categories?.map((category) => (
        <div
          key={category.categoryId}
          className={cn(
            'px-3 py-1 rounded-[6px] cursor-pointer transition-colors',
            activeTab === category.categoryId ? 'bg-[#3E2761] text-[#C8A7FD]' : 'text-[#FFFFFF80]',
          )}
          onClick={() => onChangeTab(category.categoryId)}
        >
          {category.name}
        </div>
      ))}
    </div>
  )
}
