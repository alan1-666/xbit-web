import { MouseEvent, useMemo } from 'react'
import { getBlockChainLogo, getLaunchpad } from '@/utils/helpers.ts'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { TokenAge } from '@components/listCoin/TokenAge.tsx'
import { IconsGroup } from '@components/discover/IconsGroup.tsx'
import AiIcon from '@components/common/Card/AiIcon.tsx'
import { TokenStatisticRow } from '@pages/meme/discover/desktop/components/TokenStatisticRow.tsx'
import { MemeDto } from '@/@generated/gql/graphql-future.ts'
import { IconWithValue } from '@pages/meme/discover/desktop/components/IconWithValue.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { cn } from '@/lib/utils.ts'
import { IconCrown } from '@components/v2/ui-shared/icons/IconCrown.tsx'
import { HoverableTokenAvatar } from '@pages/meme/discover/desktop/components/HoverableTokenAvatar.tsx'
import { useAllBacklistAddresses } from '@pages/meme/discover/desktop/hooks/useBlacklistAddress.ts'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { DevMigratedTooltip } from '@pages/meme/discover/desktop/components/DevMigratedTooltip.tsx'
import { TrendingScoreExplanation } from '@components/discover/cards/TrendingScoreExplanation.tsx'
import { IconBot } from '@components/icon/stroke/IconBot.tsx'
import { getDexLogo } from '@/utils/lauchpad'

export interface TrendingTokenCellProps {
  token: MemeDto
  onAiClick?: (tokenAddress: string) => void
  showDebug?: boolean
}

export const TrendingTokenCell = (props: TrendingTokenCellProps) => {
  const { token, onAiClick, showDebug = false } = props
  const { addTokens, addDevs } = useAllBacklistAddresses()
  const { t } = useTranslation()

  const launchpad = token.dexes ? getLaunchpad(token.dexes) : ''
  const launchpadLogo = launchpad ? getDexLogo(launchpad) : undefined
  const tokenLogo = useMemo(() => {
    if (token.avatarUrl) return token.avatarUrl
    if (token.image) return token.image
    return getBlockChainLogo(token.chainId, token.token)
  }, [token])

  const handleAiClick = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    onAiClick?.(token.token)
  }

  const handleAddBlacklistToken = () => {
    addTokens([token.token])
  }

  const handleAddBlacklistDev = () => {
    addDevs([token.creator || ''])
  }

  return (
    <TooltipProvider>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <HoverableTokenAvatar
            tokenAvatar={tokenLogo}
            className="size-12"
            progress={0}
            showProgress={false}
            onHideToken={handleAddBlacklistToken}
            onHideDEV={handleAddBlacklistDev}
            address={token.token}
            chainId={token.chainId}
            name={token.symbol}
            avatarClassName="size-12"
            chainLogo={launchpadLogo}
          />
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-1.5">
              <div className="flex items-baseline gap-1">
                <SimpleTooltip content={token.name}>
                  <span className="text-[calc(16rem/16)] font-medium text-white">{token.symbol} </span>
                </SimpleTooltip>
                <SimpleTooltip content={t('listCoin.tooltip.tokenAddress', { token: token.token })}>
                  <div className="text-[calc(12rem/16)] leading-3 font-[330] text-[#FFFFFF80] max-w-[120px] truncate">
                    {token.name}
                  </div>
                </SimpleTooltip>
                {showDebug && <TrendingScoreExplanation token={token} />}
              </div>
              <SimpleTooltip content={t('listCoin.tooltip.copyAddress')}>
                <div>
                  <CopyButton icon="/images/icons/ic-copy2.svg" className="self-center" text={token.token} type="tokenAddress" />
                </div>
              </SimpleTooltip>
              <SimpleTooltip content={t('ai.onchainTextTitle')}>
                <button className="cursor-pointer size-4" onClick={handleAiClick}>
                  <AiIcon />
                </button>
              </SimpleTooltip>
            </div>
            <div className="flex items-center gap-1.5">
              <SimpleTooltip content={dayjs(token.createdTime).format('DD/MM HH:mm')}>
                <div>
                  <TokenAge createdTime={token.createdTime} />
                </div>
              </SimpleTooltip>
              <IconsGroup
                tokenAddress={token.token}
                twitterUrl={token.twitterUrl || ''}
                websiteUrl={token.website || ''}
                twitterChangeCount={token.twitterNameChangeCount ? +token.twitterNameChangeCount : 0}
                twitterPostId={token.tweetId || ''}
                advertisesOnDex={token.advertisesOnDex ?? false}
              />
              <div className="flex items-center gap-2 text-[calc(12rem/16)] text-[#FBFBFB] font-[380] border-l pl-2 leading-3">
                <SimpleTooltip content={t('listCoin.tooltip.holders')}>
                  <IconWithValue
                    icon={<img src="/images/discover/ic-holder.svg" className="size-4" alt="" />}
                    value={fShortenNumber(token.numberOfHolder)}
                  />
                </SimpleTooltip>
                <SimpleTooltip content={t('listCoin.tooltip.smartMoneyPC')}>
                  <IconWithValue
                    icon={<img src="/images/discover/ic-sm2.svg" className="size-4" alt="" />}
                    value={fShortenNumber(token.smartMoneyHolder || 0)}
                  />
                </SimpleTooltip>
                <SimpleTooltip
                  content={
                    <DevMigratedTooltip
                      devMigratedCount={token.devMigrated ? token.devMigrated : 0}
                      devLaunched={token.devLaunched ? +token.devLaunched : 1}
                    />
                  }
                >
                  <IconWithValue
                    icon={
                      <IconCrown
                        className={cn(
                          'size-4',
                          token.devMigrated && token.devMigrated >= 2 ? 'text-[#FACC14]' : 'text-[#878787]',
                        )}
                      />
                    }
                    value={fShortenNumber(token.devMigrated || 0)}
                  />
                </SimpleTooltip>
                <SimpleTooltip content={t('listCoin.tooltip.botTx')}>
                  <IconWithValue
                    icon={<IconBot className="text-[#878787]" />}
                    value={fShortenNumber(token.botHolder || 0)}
                  />
                </SimpleTooltip>
              </div>
            </div>
          </div>
        </div>
        <TokenStatisticRow
          devHold={token.devHold ?? 0}
          top10={token.top10Holder}
          sniper={token.sniperHoldPct ?? 0}
          insider={token.insider ?? 0}
          bundler={token.sameSourceWallet ? +token.sameSourceWallet : 0}
          address={token.token}
          chainId={token.chainId}
          creator={token.creator ?? ''}
          itemClassName={'border-[0.6px]'}
        />
      </div>
    </TooltipProvider>
  )
}
