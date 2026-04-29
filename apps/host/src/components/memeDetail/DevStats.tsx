import { useMemo } from 'react'
import { fShortenNumber } from '@/lib/number.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import { useDevHoldings } from '@pages/meme/discover/desktop/hooks/useDevHoldings.ts'
import { useActiveChainId, useNativeTokenSymbol } from '@hooks/useActiveChain.ts'
import { ChainIds } from '@/types/enums.ts'
import { APP_PATH, CHAIN_EXPLORER_ADDRESS_URLS } from '@/lib/constant.ts'
import { useTranslation } from 'react-i18next'
import { CopyButton } from '@components/common/copy-button.tsx'
import { IconSearch2 } from '@components/icon/stroke/IconSearch2.tsx'
import { IconTransferIn } from '@components/icon/stroke/IconTransferIn.tsx'
import { IconEtherscan, IconSolanaExplorer } from '@components/icon/brands/IconExplorers.tsx'
import { PieChart } from '@components/memeDetail/PieChart.tsx'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'

export interface DevStatsProps {
  devAddress: string
  totalTokens: number
  totalRugged: number
  totalActive: number
  totalMigrated: number
  athMCToken?: string
  athMCTokenAddress?: string
  lastCreatedToken?: string
  lastCreatedAt?: string
}

const formatPercentage = (value: number) => {
  return `${value.toFixed(0)}%`
}

export const DevStats = (props: DevStatsProps) => {
  const { devAddress, totalTokens, totalMigrated, lastCreatedAt } = props
  const activeChainId = useActiveChainId() || ChainIds.Solana
  const nativeToken = useNativeTokenSymbol()
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    return [
      { label: t('detail.devProjects.migrated'), value: +totalMigrated, color: '#00FF73' },
      { label: t('detail.devProjects.nonMigrated'), value: +totalTokens - +totalMigrated, color: '#FF0004' },
    ]
  }, [totalMigrated, totalTokens, t])

  const { data: devHoldingsData } = useDevHoldings({
    creator: devAddress,
    chainId: activeChainId || ChainIds.Solana,
  })

  const migrationRate = useMemo(() => {
    if (totalTokens === 0) return 0
    return (totalMigrated / totalTokens) * 100
  }, [totalMigrated, totalTokens])

  const total = useMemo(() => {
    if (totalTokens < totalMigrated) return totalMigrated
    return totalTokens
  }, [totalMigrated, totalTokens])

  return (
    <div className="p-4 relative">
      <div className="flex-1 flex flex-col justify-center gap-3">
        <h2 className="text-[calc(12rem/16)] font-[380] text-[#A9A9B3]">{t('detail.devProjects.tokenStats')}</h2>
        <div className="text-[calc(12rem/16)] mb-2 [&>div>span]:text-[#A9A9B3] space-y-3 font-[330] text-[#A9A9B3]">
          <div className="flex items-center gap-1 text-[#A9A9B3]">
            <div>
              <span>{t('detail.devProjects.dev')}</span>{' '}
              <a
                className="underline font-[380] text-[#A9A9B3]"
                href={`${APP_PATH.MEME_WALLET}/${devAddress}?tab=Summary`}
                target="_blank"
              >
                {formatAddressWallet(devAddress)} (
                {devHoldingsData?.transferIn ? fShortenNumber(devHoldingsData?.transferIn) : 0} {nativeToken})
              </a>
            </div>
            <CopyButton icon="/images/icons/ic-copy3.svg" className="self-center" text={devAddress} />
            <a
              href={`https://x.com/search?q=${devAddress}`}
              className="flex items-center gap-0.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconSearch2 className="size-4" />
            </a>
            <a
              href={`${CHAIN_EXPLORER_ADDRESS_URLS[activeChainId]}/${devAddress}`}
              className="underline flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {activeChainId === ChainIds.Solana ? (
                <IconSolanaExplorer className="size-3.5" />
              ) : (
                <IconEtherscan className="size-3.5" />
              )}
            </a>
          </div>
          <div className="flex items-center gap-1">
            <span>{t('detail.devProjects.devFundingSource')}:</span>
            {devHoldingsData?.fundingAddress ? (
              <div className="underline flex items-center gap-1">
                <IconTransferIn />
                <a href={`${APP_PATH.MEME_WALLET}/${devHoldingsData.fundingAddress}?tab=Summary`} target="_blank">
                  <span>{formatAddressWallet(devHoldingsData.fundingAddress)}</span>
                </a>
                <a
                  href={`${CHAIN_EXPLORER_ADDRESS_URLS[activeChainId]}/${devHoldingsData.fundingAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activeChainId === ChainIds.Solana ? (
                    <IconSolanaExplorer className="size-3.5" />
                  ) : (
                    <IconEtherscan className="size-3.5" />
                  )}
                </a>
              </div>
            ) : (
              '--'
            )}
          </div>
          <div>
            <span>{t('detail.devProjects.totalTokens')}:</span> {fShortenNumber(total)}
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-[#00FF73] size-4 rounded-full" />
            <div className="">
              {t('detail.devProjects.migrated')}: {fShortenNumber(+totalMigrated)}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <div className="bg-[#FF0004] size-4 rounded-full" />
            <div>
              {t('detail.devProjects.nonMigrated')}: {fShortenNumber(+totalTokens - +totalMigrated)}
            </div>
          </div>
          {/*<div>{t('detail.devProjects.highlights')}</div>*/}
          {/*<div>{t('detail.devProjects.athMC')}: --</div>*/}
          <div className="flex items-baseline gap-1">
            {t('detail.devProjects.latestToken')}:
            {lastCreatedAt ? (
              <TokenAge createdTime={lastCreatedAt} className="text-[#A9A9B3]" allowOverrideStyle={false} />
            ) : (
              '--'
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-end p-4 pointer-events-none">
        <div className="size-[155px] relative">
          <PieChart data={chartData} />
          <div className="absolute inset-0">
            <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[calc(42rem/16)] leading-[42px] font-bold text-white">
                {formatPercentage(migrationRate)}
              </div>
              <div className="text-[calc(16rem/16)] font-[380] text-white">{t('detail.devProjects.migrated')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
