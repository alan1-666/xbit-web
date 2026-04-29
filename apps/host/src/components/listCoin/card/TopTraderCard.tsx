import { CardBottom, CardWrapper, ConfirmCollectModal } from '@/components/common/Card/CurrencyListCard'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import { useNavigateWithLocation } from '@/hooks/useNavigateWithLocation'
import { useTimeAgoGlobalV2 } from '@/hooks/useTimeAgoGlobal'
import { APP_PATH } from '@/lib/constant'
import { formatPercent, formatVolume, getStyleRiseFall } from '@/lib/format'
import { fShortenNumber } from '@/lib/number'
import { cn } from '@/lib/utils'
import { PnLChart } from '@components/common/PnLChart.tsx'
import { useTranslation } from 'react-i18next'
import AliasCard from './AliasCard'

interface TimeAgoProps {
  time: number
}

function TimeAgo({ time }: TimeAgoProps) {
  const timeAgo = useTimeAgoGlobalV2(time)
  return (
    <span className={cn('text-[10px] leading-[10px] text-[rgba(0, 255, 180, 0.7)] text-[#00CE89]')}>{timeAgo}</span>
  )
}

export type TopTraderCardProps = {
  address: string
  name?: string
  avatar?: string
  tags: string[]
  lastActivityAt: number
  pnl7d: number
  pnl30d: number
  pnl1d: number
  winRate7d: number
  avgCost7d: number
  totalBuy1d: number
  totalBuy7d: number
  totalBuy30d: number
  chainIcon?: string //icon chain, TODO: change to select enums
  currencyIcon?: string //icon currency, TODO: change to select enums
  defaultCollect?: boolean
  dailyProfits: Record<string, number>[]
  classNameContainer?: string
  referrer?: 'topTalent' | 'monitoring'
  showFavoriteIcon?: boolean
  alias?: string
  walletName?: string
  twitterName?: string
  onRemoveSuccess?: () => void
  onAdded?: () => void
  onChangeNameSuccess?: (newName: string) => void
}

const TopTraderCard = (props: TopTraderCardProps) => {
  const {
    address,
    lastActivityAt,
    currencyIcon = '',
    winRate7d,
    totalBuy1d,
    totalBuy7d,
    totalBuy30d,
    defaultCollect = false,
    dailyProfits = [],
    pnl7d,
    pnl30d,
    pnl1d,
    avgCost7d,
    classNameContainer = '',
    referrer = 'topTalent',
    showFavoriteIcon = true,
    name = '',
    alias = '',
    walletName,
    twitterName,
    onRemoveSuccess,
    onAdded,
    onChangeNameSuccess,
  } = props
  const profitArr = dailyProfits.map((item) => item?.pnl)
  const { t } = useTranslation()
  const navigate = useNavigateWithLocation()

  const onDetails = () => {
    navigate(`${APP_PATH.MEME_WALLET}/${address}?tab=Summary&referrer=${referrer}`)
  }

  // function handleOnAdded() {
  // toast(<div className="flex justify-between">
  //   <span>{t('walletDetail.msg.flowtitle')}</span>
  //   <span className="flex items-center gap-2" onClick={() => {
  //     toast.dismiss()
  //     navigate(`${APP_PATH.MEME_MONITORING}?page=following`)
  //   }}>
  //     <span>{t('walletDetail.msg.flowlist')}</span>
  //     <IconBtn
  //       icon={<IconChevronRight className="size-3 text-[#B9B9B9]" />}
  //       className='size-[14px] flex hover:bg-none'
  //     />
  //   </span>
  // </div>, {
  //   position: 'bottom-center',
  //   classNames: {
  //     content: 'w-full',
  //   }
  // })
  // }

  const percentage = pnl7d && totalBuy7d ? (pnl7d / totalBuy7d) * 100 : 0

  return (
    <CardWrapper onClick={onDetails} className={classNameContainer}>
      <div className="p-0 rounded-tl-[6px] rounded-tr-[6px]">
        <div className="flex items-center justify-between py-[6px] rounded-tl-[6px] rounded-tr-[6px]">
          <div className="flex items-center">
            <div className="flex mr-2">
              <ChainCurrencyIcon
                currencyIcon={currencyIcon}
                avatarClassName="flex items-center justify-center w-[45px] h-[45px] rounded-lg"
                avatarImageClassName="w-full h-full absolute w-full"
                fallbackImageEnable
                fallbackNFT={address}
              />
            </div>
            <div className="pt-[7px] mb-[-2px]">
              <div className="mb-2 flex items-center gap-2">
                {/* <span className="font-medium text-[14px] leading-[14px] whitespace-nowrap">
                  {name && String(name).length && name !== address ? listCoinHelper.formatWalletNameWithEllipsis(name) : listCoinHelper.formatWalletName(address, 10)}
                </span> */}
                <AliasCard
                  address={address}
                  name={name}
                  walletName={walletName}
                  twitterName={twitterName}
                  useCopyButton
                  classNameWrapper="flex items-center"
                  onChangeNameSuccess={onChangeNameSuccess}
                />
                <TimeAgo time={lastActivityAt} />
              </div>
              <div className="flex items-center text-[11px]">
                <span className="text-(--text-tertiary) mr-[3px]">{t('listCoin.copyTrade.sevenDayWinRate')}</span>
                <span className={cn('font-regular', getStyleRiseFall(winRate7d * 100))}>
                  {formatPercent(winRate7d * 100)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-[80px] mr-[3px] mt-1.5 text-center">
              <p
                className={cn('mb-1 font-medium text-[12px] leading-[12px] text-center', getStyleRiseFall(percentage))}
              >
                <span className="hidden min-[414px]:inline">
                  {formatPercent(percentage, {
                    showSign: true,
                  })}
                </span>
                <span className="inline min-[414px]:hidden">
                  {percentage > 0 ? `+${fShortenNumber(percentage)}` : fShortenNumber(percentage)}%
                </span>
              </p>
              <p className="text-[11px] leading-[11px] text-[#FFFFFFB2]">{t('listCoin.copyTrade.sevenDayPnL')}</p>
            </div>
            <PnLChart data={profitArr} />
            {showFavoriteIcon && (
              <ConfirmCollectModal
                token={address}
                defaultCollect={defaultCollect}
                tokenSymbol={''}
                alias={alias}
                isFlow
                onAdded={onAdded}
                onRemoveSuccess={onRemoveSuccess}
              />
            )}
          </div>
        </div>
      </div>
      <CardBottom
        className="py-0 items-center"
        classNameItem="flex items-center py-[6px]"
        classNameItems={['flex-6', 'flex-7', 'flex-8 justify-end']}
        cols={3}
        tradeDetails={[
          {
            label: t('listCoin.copyTrade.oneDayPnL'),
            value: formatPercent(pnl1d & totalBuy1d ? (pnl1d / totalBuy1d) * 100 : 0, {
              showSign: true,
            }),
          },
          {
            label: t('listCoin.copyTrade.thirtyDayPnL'),
            value: formatPercent(pnl30d && totalBuy30d ? (pnl30d / totalBuy30d) * 100 : 0, {
              showSign: true,
            }),
          },
          {
            label: t('listCoin.copyTrade.sevenDayAvgBuyCost'),
            value: formatVolume(avgCost7d, {
              showCurrency: true,
            }),
          },
        ]}
      />
    </CardWrapper>
  )
}
export default TopTraderCard
