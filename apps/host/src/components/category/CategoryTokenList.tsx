import { useTranslation } from 'react-i18next'
import CategoryTokenCard from './CategoryTokenCard'
import { cn } from '@/lib/utils'
import { CategoryToken } from '@/types/category.ts'
import { IconEmpty } from '@components/icon'

interface CategoryTokenListProps {
  tokens: CategoryToken[]
  onTokenClick?: (token: CategoryToken) => void
  className?: string
}

const getTop = (index: number) => {
  switch (index) {
    case 0:
      return 'top1'
    case 1:
      return 'top2'
    case 2:
      return 'top3'
    default:
      return undefined
  }
}

/**
 * Component for displaying a list of tokens in the category detail page
 * Renders a collection of CategoryTokenCard components
 */
export const CategoryTokenList = ({ tokens, onTokenClick, className = '' }: CategoryTokenListProps) => {
  const { t } = useTranslation()

  if (!tokens.length) {
    return (
      <div className={`p-4 text-center text-[#ffffff70] text-[12px] flex flex-col items-center ${className}`}>
        <IconEmpty />
        {t('categoryDetail.noData')}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {tokens.map((token, index) => (
        <CategoryTokenCard key={token.address} token={token} onClick={onTokenClick} top={getTop(index)} />
      ))}
    </div>
  )
}

export default CategoryTokenList
