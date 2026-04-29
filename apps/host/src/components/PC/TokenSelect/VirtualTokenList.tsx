import { SearchWalletData, TokenTrendingSearchBarData } from '@/@generated/gql/graphql-meme2'
import { IconEmpty } from '@/components/icon'
import { SkeletonList } from '@/components/ui/skeleton'
import { TokenTrending } from '@/types/token'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Dispatch, SetStateAction, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AddressCard from './AddressCard'
import TokenCard from './TokenCard'
import { EmptyList } from '@/components/discover/EmptyList'

interface IVirtualTokenListProps {
  data: TokenTrendingSearchBarData[]
  debounceValue: string
  isLoading?: boolean
  setOpen: (value: SetStateAction<boolean>) => void
  hasAddress?: boolean
  favoriteTokens?: TokenTrending[]
  setFavoriteTokens?: Dispatch<SetStateAction<TokenTrending[]>>
}

export const VirtualTokenList = ({
  data,
  debounceValue,
  isLoading,
  setOpen,
  hasAddress,
  favoriteTokens = [],
  setFavoriteTokens,
}: IVirtualTokenListProps) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (hasAddress ? 74 : 54),
    overscan: 5,
  })

  if (isLoading) {
    return (
      <div className="">
        <SkeletonList count={8} classNameItem="h-[54px]" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-1 justify-center flex-col items-center h-full">
          <EmptyList emptyText={t('history.nodata')} />
      </div>
    )
  }

  return (
    <div ref={parentRef} className="overflow-auto h-full _hidescrollbar">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item: any = data[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item.__typename === 'SearchWalletData' ? (
                <div className="">
                  {hasAddress && <span className="text-xs text-white/50">Wallet</span>}
                  <AddressCard
                    data={item as unknown as SearchWalletData}
                    debounceValue={debounceValue}
                    setOpen={setOpen}
                  />
                </div>
              ) : (
                <div className="">
                  {hasAddress && <span className="text-xs text-white/50">Token</span>}
                  <TokenCard
                    {...item}
                    debounceValue={debounceValue}
                    setOpen={setOpen}
                    favoriteTokens={favoriteTokens}
                    setFavoriteTokens={setFavoriteTokens}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
