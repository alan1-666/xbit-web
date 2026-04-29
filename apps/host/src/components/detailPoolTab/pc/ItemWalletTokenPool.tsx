import ButtonFollowToken from '@components/detailTokenTabs/ButtonFollowToken.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { useGetTotalFollowings } from '@hooks/useGetTotalFollowings.ts'
import { useMemo } from 'react'
import eventBus from '@/lib/eventBus.ts'
import { EDITING_ALIAS_POOL } from '@const/tokenDetail.ts'
import { RootState, useAppDispatch, useAppSelector } from '@/redux/store'
import { setFollowedPoolFilter, setPoolFilter, TradeTabState } from '@/redux/modules/tradeTab.slice.ts'
import { cn } from '@/lib/utils.ts'
import { CHAIN_EXPLORER_ADDRESS_URLS } from '@/lib/constant.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'

type ItemWalletTokenPoolProps = {
  address: string
  alias?: string
  isFollowed?: boolean
}

const ItemWalletTokenPool = ({ address, alias, isFollowed = false }: ItemWalletTokenPoolProps) => {
  const { data, refetch } = useGetTotalFollowings()
  const activeChainId = useActiveChainId() ?? ChainIds.Solana

  const dispatch = useAppDispatch()
  const { poolFilter, followedPoolFilter } = useAppSelector((state: RootState) => state.tradeTab as TradeTabState)
  const currentFilter = useMemo(
    () => (isFollowed ? followedPoolFilter : poolFilter),
    [isFollowed, poolFilter, followedPoolFilter],
  )

  const listFollowings = useMemo(() => data?.map((item) => item?.address), [data])
  const isFavorite = useMemo(() => listFollowings?.some((item) => item === address), [listFollowings, address])
  const shortAddress = address ? `${address.slice(0, 5)}...${address.slice(-5)}` : ''

  const handleClickFilter = () => {
    const newFilter = { ...currentFilter, holder: currentFilter?.holder === address ? '' : address }
    dispatch(isFollowed ? setFollowedPoolFilter(newFilter) : setPoolFilter(newFilter))
  }

  return (
    <div className="text-white flex items-center gap-1 min-w-[200px] justify-end pr-6">
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`${CHAIN_EXPLORER_ADDRESS_URLS[activeChainId]}/${address}`}
        className={cn('text-[14px] leading-[1] underline underline-offset-1 text-end', alias ? 'truncate' : '')}
      >
        {alias ? alias : shortAddress}
      </a>
      <ButtonFollowToken address={address} isFollowing={isFavorite} reFetchFn={refetch} isStarBottomTabs />
      <img
        src={
          currentFilter?.holder === address ? '/images/icons/icon-filter-solid.svg' : '/images/icons/icon-filter.svg'
        }
        onClick={handleClickFilter}
        className="w-[14px] h-[14px] !pointer-events-auto"
        alt="icon filter"
      />
      <CopyButton icon="/images/icons/ic-copy2.svg" text={address} className="size-4" />
      {isFavorite && (
        <img
          src={'/images/icons/edit.svg'}
          className="w-[14px] h-[14px] !pointer-events-auto cursor-pointer"
          alt="icon filter"
          onClick={() => {
            eventBus.dispatch(EDITING_ALIAS_POOL, { data: { address, alias } })
          }}
        />
      )}
    </div>
  )
}

export default ItemWalletTokenPool
