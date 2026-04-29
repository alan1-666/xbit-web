import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'
import { useDevTokens } from '@hooks/useDevTokens.ts'
import { ChainIds } from '@/types/enums.ts'
import { DevTokensTable } from '@components/memeDetail/DevTokensTable.tsx'
import { DevStats } from '@components/memeDetail/DevStats.tsx'
import { useEffect, useRef } from 'react'
import eventBus from '@/lib/eventBus.ts'
import { useMaxHeightInGridLayout } from '@hooks/useMaxHeightInGridLayout.ts'

export interface DevTokensProps {
  tokenData: TokenDetail | undefined
  tvChartHeight: number
}

export const DevTokens = (props: DevTokensProps) => {
  const { tokenData } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const maxHeight = useMaxHeightInGridLayout({ containerRef, padding: 110 })

  const devAddress = tokenData?.creator ? tokenData.creator : ''

  const { data, isLoading, hasNextPage, loadMore } = useDevTokens({
    chainId: tokenData?.chainId ? tokenData.chainId : ChainIds.Solana,
    devAddress: tokenData?.creator ? tokenData.creator : '',
  })

  useEffect(() => {
    if (!data || !data.totalMigrated) return
    const totalMigrated = data?.totalMigrated || 0
    eventBus.dispatch('devTotalMigratedUpdate', { data: { devAddress, totalMigrated } })
  }, [data])
  useEffect(() => {
    containerRef.current = document.getElementById('meme-bottom-tabs') as HTMLDivElement
  }, [])

  return (
    <div className="pl-1 flex h-full border-b" style={{ maxHeight: maxHeight }}>
      <div className="col-span-2 overflow-x-auto border-r flex-1 h-full relative">
        <DevTokensTable tokens={data.tokens} isLoading={isLoading} hasNextPage={hasNextPage} onLoadMore={loadMore} />
      </div>
      <div className="w-[420px]">
        <DevStats
          devAddress={devAddress}
          totalTokens={data.total || 0}
          totalRugged={data.totalRug || 0}
          totalActive={data.totalActive || 0}
          totalMigrated={data.totalMigrated || 0}
          lastCreatedToken={data.lastCreatedToken}
          lastCreatedAt={data.lastCreatedAt}
        />
      </div>
    </div>
  )
}
