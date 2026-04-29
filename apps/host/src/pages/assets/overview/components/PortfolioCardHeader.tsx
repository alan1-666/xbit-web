import { IconHeaderSearch } from '@components/icon'
import { Checkbox } from '@components/ui/checkbox.tsx'
import { useTranslation } from 'react-i18next'
import { ChangeEvent, useEffect, useState } from 'react'
import useDebounceValue from '@hooks/useDebounceValue.ts'
import { cn } from '@/lib/utils.ts'
import { OverviewWalletSelect } from '@pages/assets/overview/components/OverviewWalletSelect.tsx'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { IconInfo } from '@components/icon'

export interface PortfolioCardFilter {
  hideSmallAmount: boolean
  hideSellAll: boolean
  hideSmallLiquidityPool: boolean
  searchText?: string
  walletAddresses?: UserEmbeddedWalletDto[]
}

export interface PortfolioCardHeaderProps {
  filter: PortfolioCardFilter
  onFilterChange?: (filter: PortfolioCardFilter) => void
}

export const PortfolioCardHeader = (props: PortfolioCardHeaderProps) => {
  const { filter, onFilterChange } = props
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState(filter.searchText || '')
  const debounceSearchText = useDebounceValue(searchText, 300)

  const handleHideSellAllChange = (checked: boolean) => {
    onFilterChange?.({
      ...filter,
      hideSellAll: checked,
    })
  }

  const handleHideSmallAmountChange = (checked: boolean) => {
    onFilterChange?.({
      ...filter,
      hideSmallAmount: checked,
    })
  }

  const handleHideSmallLiquidityPoolChange = (checked: boolean) => {
    onFilterChange?.({
      ...filter,
      hideSmallLiquidityPool: checked,
    })
  }

  const handleSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.trim() || ''
    setSearchText(text)
  }

  const handleWalletChange = (walletAddresses: UserEmbeddedWalletDto[]) => {
    // Ensure at least one wallet is selected
    onFilterChange?.({
      ...filter,
      walletAddresses,
    })
  }

  useEffect(() => {
    onFilterChange?.({
      ...filter,
      searchText: debounceSearchText,
    })
  }, [debounceSearchText])

  return (
    <div className="w-full px-5 pt-5 pb-3 border-b border-[#79778C29] flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2">
          <OverviewWalletSelect
            wallets={filter.walletAddresses ? filter.walletAddresses : []}
            onWalletChange={handleWalletChange}
          />
          <div className="bg-[#79778C29] h-9 rounded-[8px] flex items-center w-[250px] p-2.5 gap-1">
            <IconHeaderSearch className="size-4 text-[#79778C]" />
            <input
              className="text-[calc(14rem/16)] flex-1"
              placeholder={t('assets.overview.searchToken')}
              value={searchText}
              onChange={handleSearchTextChange}
            />
          </div>
        </div>
        <div className="text-white text-[12px] flex items-center gap-1 mt-2">
          <IconInfo /> {t('assets.overview.tokenListNotice')}
        </div>
      </div>
      <div className="flex justify-start items-center gap-4">
        <div className="flex justify-start items-center gap-2">
          <div
            className={cn(
              'justify-center text-[calc(13rem/16)] leading-3 flex items-center gap-2 transition-colors duration-200',
              !filter.hideSellAll ? 'text-[#79778C]' : 'text-white',
            )}
          >
            <Checkbox
              className="size-3.5 border-[#79778C] [&_*_svg]:size-2.5 data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-transparent"
              onCheckedChange={handleHideSellAllChange}
              checked={filter.hideSellAll}
            />
            <span className="cursor-pointer" onClick={() => handleHideSellAllChange(!filter.hideSellAll)}>
              {t('assets.overview.hideSellAll')}
            </span>
          </div>
        </div>
        <div className="flex justify-start items-center gap-2">
          <div
            className={cn(
              'justify-center text-[calc(13rem/16)] leading-3 flex items-center gap-2 transition-colors duration-200',
              filter.hideSmallAmount ? 'text-white' : 'text-[#79778C]',
            )}
          >
            <Checkbox
              className="size-3.5 border-[#79778C] [&_*_svg]:size-2.5 data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-transparent"
              onCheckedChange={handleHideSmallAmountChange}
              checked={filter.hideSmallAmount}
            />
            <span className="cursor-pointer" onClick={() => handleHideSmallAmountChange(!filter.hideSmallAmount)}>
              {t('assets.overview.hideSmallAmount')}
            </span>
          </div>
        </div>
        <div className="flex justify-start items-center gap-2">
          <div
            className={cn(
              'justify-center text-[calc(13rem/16)] leading-3 flex items-center gap-2 data-[state=checked]:text-white',
              filter.hideSmallLiquidityPool ? 'text-white' : 'text-[#79778C]',
            )}
          >
            <Checkbox
              className="size-3.5 border-[#79778C] [&_*_svg]:size-2.5 data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-transparent"
              onCheckedChange={handleHideSmallLiquidityPoolChange}
              checked={filter.hideSmallLiquidityPool}
            />
            <span
              className="cursor-pointer"
              onClick={() => handleHideSmallLiquidityPoolChange(!filter.hideSmallLiquidityPool)}
            >
              {t('holding.filter.hideSmallLiquidityPool')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
