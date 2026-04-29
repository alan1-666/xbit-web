import { PortfolioCardFilter, PortfolioCardHeader } from '@pages/assets/overview/components/PortfolioCardHeader.tsx'
import { PortfolioTable } from '@pages/assets/overview/components/PortfolioTable.tsx'
import { useHoldingTokens } from '@pages/assets/overview/hooks/useHoldingTokens.ts'
import { useEffect, useState } from 'react'
import { useAppSelector } from '@/redux/store'
import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import { useWalletBalanceUpdated } from '@hooks/useWalletBalanceUpdated.ts'

export interface PortfolioCardProps {
  totalBalance?: number
}

export const PortfolioCard = (props: PortfolioCardProps) => {
  const { totalBalance = 0 } = props
  const [filter, setFilter] = useState<PortfolioCardFilter>({
    hideSellAll: false,
    hideSmallAmount: false,
    hideSmallLiquidityPool: false,
    searchText: '',
    walletAddresses: undefined,
  })

  const { assets, isLoading, loadMoreFn, refetch } = useHoldingTokens(filter)

  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])

  useEffect(() => {
    if (!filter.walletAddresses) {
      setFilter({
        ...filter,
        walletAddresses: listWalletsByChain,
      })
    }
  }, [filter, listWalletsByChain])

  useWalletBalanceUpdated({
    onWalletBalanceUpdated: refetch,
  })

  return (
    <div className="w-full bg-[#141418] border border-[#79778C29] rounded-[12px]">
      <PortfolioCardHeader filter={filter} onFilterChange={setFilter} />
      <PortfolioTable data={assets || []} isLoading={isLoading} onLoadMore={loadMoreFn} totalBalance={totalBalance} />
    </div>
  )
}
