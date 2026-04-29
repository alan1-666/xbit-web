import { useEffect, useMemo } from 'react'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { Category } from '@/types/category.ts'
import { useNavigate, useParams } from 'react-router-dom'

interface CategoryTabsProps {
  allCategories: Category[]
  defaultTab?: string
  className?: string
  onCategoryChange?: (category: Category) => void
}

const Tab = (props: { hot: boolean; name: string | null }) => {
  const { hot, name } = props
  return (
    <div className="mb-1 flex items-center w-max">
      {hot && <img src="/images/icons/ic-framer.webp" className="size-3.5 mr-0.5" alt="" />}
      <span className="">{name || '--'}</span>
    </div>
  )
}

/**
 * Component for the category tabs at the top of the category detail page
 * Uses CustomMovingLineTabs for styled tab navigation
 */
export const CategoryTabs = ({ onCategoryChange, defaultTab, className = '', allCategories }: CategoryTabsProps) => {
  const navigate = useNavigate()
  const params = useParams()
  const tabsArray =
    allCategories?.map((category, index) => ({
      value: category.categoryId?.toLowerCase() ?? '',
      label: <Tab hot={index < 3} name={category.name} key={category.name} />,
    })) || []

  const handleTabChange = (tab: string) => {
    const selectedCategory = allCategories?.find((category) => category.categoryId?.toLowerCase() === tab)
    if (selectedCategory) {
      navigate(`/category/${selectedCategory?.categoryId.toLowerCase()}`, { replace: true })
    }
  }

  const currentTab = useMemo(() => {
    const currentCategory = allCategories?.find((category) => category.categoryId?.toLowerCase() === params.category)
    return currentCategory ? currentCategory.categoryId?.toLowerCase() : defaultTab || tabsArray[0]?.value
  }, [tabsArray, allCategories, params.category])

  useEffect(() => {
    const currentCategory = allCategories?.find((category) => category.categoryId.toLowerCase() === params.category)
    if (currentCategory) {
      onCategoryChange?.(currentCategory)
    }
  }, [params.category, allCategories])

  return (
    <div className={className}>
      <MovingLineTabs
        containerClassName="w-full bg-transparent justify-start"
        tabs={tabsArray}
        defaultTab={currentTab ?? ''}
        onTabChange={handleTabChange}
      />
    </div>
  )
}

export default CategoryTabs
