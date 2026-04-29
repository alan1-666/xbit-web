import useStateSearchParam from '@/hooks/useStateSearchParam'
import { APP_PATH } from '@/lib/constant'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Container from '../common/Container'
import { IconArrowRight } from '../icon'
import { Button, ButtonProps } from '../ui/button'
import TopTraders from './TopTraders'
import { WalletCopyTrade } from './WalletCopyTrade'

type FilterTagProps = {
  tags: { label: string; value: string }[]
  defaultSelected?: string
  onTagClick?: (tag: string) => any
  className?: string
}

type ButtonTagProps = ButtonProps & {
  isActive?: boolean
}

const ButtonTag = ({ className, isActive, children, ...rest }: ButtonTagProps) => {
  return (
    <Button
      className={cn(
        'px-[10px] py-[4px] bg-[#ECECED14] h-auto text-[calc(1rem*(12/16))] text-[#FFFFFF99] font-normal rounded-[4px] leading-[calc(1rem*(14/16))] relative transition-all duration-100 ease-in-out',
        isActive && 'text-[#FFFFFF] text-[calc(1rem*(14/16))] app-font-medium',
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          'bg-[linear-gradient(45deg,#E149F8,#9945FF,#00F3AB)] absolute inset-0 rounded-[4px] leading-[1] transition-all duration-100 ease-in-out opacity-0 scale-95',
          isActive && 'opacity-100 scale-100',
        )}
      />
      <span
        className={cn(
          'relative transition-all duration-100 ease-in-out leading-[calc(1rem*(14/16))]',
          isActive && 'transform',
        )}
      >
        {children}
      </span>
    </Button>
  )
}

const FilterTag = ({ tags, defaultSelected = tags[0].value, onTagClick, className }: FilterTagProps) => {
  const [selectedTag, setSelectedTag] = useState(defaultSelected)

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag)
    if (onTagClick) {
      onTagClick(tag)
    }
  }

  return (
    <div className={cn('flex align-middle gap-[6px]', className)}>
      {tags.map((tag) => (
        <ButtonTag isActive={selectedTag === tag.value} key={tag.value} onClick={() => handleTagClick(tag.value)}>
          {tag.label}
        </ButtonTag>
      ))}
    </div>
  )
}

const TabCopyTrade = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const tagFilters: { label: string; value: string }[] = [
    {
      label: t('listCoin.filters.topTraders'),
      value: 'topTraders',
    },
    {
      label: t('listCoin.filters.walletCopyTrade'),
      value: 'walletCopyTrade',
    },
  ]

  const [currentTag, setCurrentTag] = useStateSearchParam<string>('tag', tagFilters[0].value)

  const onWalletSetting = () => {
    navigate(APP_PATH.COPY_TRADING_WALLET_SETTINGS)
  }

  const handleClickFilter = (tag: string) => {
    setCurrentTag(tag)
  }

  return (
    <Container className="bg-[#111111] w-full max-h-full flex-1 flex flex-col relative">
      <div className="sticky top-9 flex justify-between items-center gap-4 bg-[#111111] z-20 pt-2 overflow-auto no-scrollbar">
        <FilterTag tags={tagFilters} onTagClick={handleClickFilter} defaultSelected={currentTag} />
        <Button
          className="gap-0 h-6 px-2 bg-[linear-gradient(45deg,#E149F8,#9945FF,#00F3AB)] rounded-[12px] relative transition-all duration-100 hover:scale-[1]"
          onClick={onWalletSetting}
        >
          <span className="text-[calc(1rem*(12/16))] font-[400] text-[#FFFFFF]">
            {t('listCoin.copyTrade.createCopyTrade')}
          </span>
          <IconArrowRight className="!size-3" />
        </Button>
      </div>
      {currentTag === 'topTraders' && <TopTraders />}
      {currentTag === 'walletCopyTrade' && <WalletCopyTrade />}
    </Container>
  )
}

TabCopyTrade.TopTraders = TopTraders
TabCopyTrade.WalletCopyTrade = ({ isPC, onRefetch }: { isPC?: boolean, onRefetch?: React.MutableRefObject<(() => void) | null> }) => (
  <WalletCopyTrade isPC={isPC} onRefetch={onRefetch} />
)

export default TabCopyTrade
