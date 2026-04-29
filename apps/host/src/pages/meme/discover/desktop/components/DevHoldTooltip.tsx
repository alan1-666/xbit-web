import { useTranslation } from 'react-i18next'
import { formatPercentage } from '@/utils/helpers.ts'
import { formatAddressWallet } from '@/lib/string.ts'
import dayjs from 'dayjs'
import { useDevHoldings } from '@pages/meme/discover/desktop/hooks/useDevHoldings.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { CHAIN_EXPLORER_ADDRESS_URLS, CHAIN_EXPLORER_IMAGES_PC } from '@/lib/constant.ts'
import { useNativeTokenSymbol } from '@hooks/useActiveChain.ts'
import { cn } from '@/lib/utils.ts'
import { ChainIds } from '@/types/enums.ts'

export interface DevHoldTooltipProps {
  devHoldPercent: number
  creatorAddress?: string
  createdAt?: string
  address: string
  chainId: number
}

export const DevHoldTooltip = (props: DevHoldTooltipProps) => {
  const { devHoldPercent, creatorAddress, chainId } = props
  const { t } = useTranslation()
  const { data } = useDevHoldings({ creator: creatorAddress || '', chainId })
  const nativeToken = useNativeTokenSymbol()
  return (
    <div className="w-[200px] py-1 space-y-1.5 text-[calc(12rem/16)] font-[330] text-[#908E98]">
      <div className="text-[calc(14rem/16)] font-[450] text-[#FBFBFB]">
        {devHoldPercent > 0 ? (
          <span>
            {t('listCoin.tooltip.devHoldBalance')}{' '}
            <span className="text-[#009C46]">{formatPercentage(devHoldPercent)}</span>
          </span>
        ) : (
          t('listCoin.tooltip.devSellAll')
        )}
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.devWallet')}</div>
        <div>{formatAddressWallet(creatorAddress)}</div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.devFundingSource')}</div>
        <div className="flex items-center gap-1">
          {data?.fundingAddress ? (
            <>
              <span>{formatAddressWallet(data.fundingAddress)}</span>
              <a
                href={`${CHAIN_EXPLORER_ADDRESS_URLS[chainId]}/${data.fundingAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'rounded-full',
                  chainId === ChainIds.Solana
                    ? 'bg-[linear-gradient(37.15deg,#00C583_13.23%,#00F7A5_93.06%)] p-[1px] block'
                    : '',
                )}
                onClick={(event) => {
                  event.stopPropagation()
                  event.preventDefault()
                  window.open(
                    `${CHAIN_EXPLORER_ADDRESS_URLS[chainId]}/${data.fundingAddress}`,
                    '_blank',
                    'noopener,noreferrer',
                  )
                }}
              >
                <img
                  src={
                    chainId === ChainIds.Solana
                      ? '/images/icons/chains/ic-solana2.png'
                      : CHAIN_EXPLORER_IMAGES_PC[chainId]
                  }
                  alt=""
                  className="size-3 rounded-full"
                />
              </a>
            </>
          ) : (
            '--'
          )}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.devBalance')}</div>
        <div>
          {data?.transferIn ? fShortenNumber(data?.transferIn) : 0} {nativeToken}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div>{t('listCoin.tooltip.devWalletCreatedAt')}</div>
        <div>{data?.time ? dayjs(data.time).format('YYYY/MM/DD HH:mm:ss') : '--'}</div>
      </div>
    </div>
  )
}
