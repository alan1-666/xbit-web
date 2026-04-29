import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useAppSelector } from '@/redux/store'
import { useNavigate, useParams } from 'react-router-dom'
import { OrderSortField, SearchOrderInput, SortDirection, TransactionType } from '@/@generated/gql/graphql-trading.ts'
import { APP_PATH } from '@/lib/constant'
import { tradingClient } from '@/lib/gql/apollo-client'
import { gqlClient } from '@/lib/gql/apollo-client.ts'
import { useSubscription } from '@/lib/mqtt'
import { getPath } from '@/lib/utils.ts'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { getTransactions } from '@/services/order.service'
import { getPortfolio } from '@/services/tokens.service'
import { ChainIds } from '@/types/enums.ts'
import { formatPercentage, getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import ButtonShare from '@components/myPositions/ButtonShare.tsx'
import useTokenPrice from '@hooks/useTokenPrice.ts'
import { PortfolioDTO } from '@/types/holding'
import useGetPrices from '@hooks/useGetPrices.ts'
import { getChainId } from '@/lib/blockchain'
import { useActiveChainId } from '@hooks/useActiveChain.ts'

const AssetsTokenDetailPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress
  const { address } = useParams()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)

  const [portfolioData, setPortfolioData] = useState<PortfolioDTO | null>(null)
  const [offset, setOffset] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])

  const [tokenStatistic, setTokenStatistic] = useState<any>(null)

  const priceMqtt = useTokenPrice(portfolioData?.token ?? '', (portfolioData?.price ?? 0)?.toString())
  const fallBackPrice = useGetPrices({
    tokens: portfolioData?.token ? [portfolioData?.token ?? ''] : [],
    chainId: portfolioData?.chainId ?? ChainIds.Solana,
  })?.data?.getPrices?.[0]?.price

  const price = priceMqtt != 0 ? priceMqtt : Number(fallBackPrice)
  const costPrice = !portfolioData?.avgPriceUsd || !portfolioData?.totalBuyUsd ? '--' : portfolioData?.avgPriceUsd
  const realized = portfolioData?.realizedPnL ? Number(portfolioData?.realizedPnL) : 0
  const unrealized =
    portfolioData?.totalBaseAmount && portfolioData.totalBaseAmount > 0
      ? (Number(price) - Number(portfolioData?.avgPriceUsd)) * portfolioData?.totalBaseAmount
      : 0
  const avgMC = portfolioData?.avgMarketCap ?? '--'
  const PnL = !portfolioData?.avgPriceUsd || !portfolioData?.totalBuyUsd ? '--' : Number(realized) + Number(unrealized)
  const holdingValue = (portfolioData?.totalBaseAmount ?? 0) * Number(price)
  const holdingQuantity = portfolioData?.totalBaseAmount ?? 0
  const returnRateValue = portfolioData?.totalBuyUsd
    ? ((Number(realized) + Number(unrealized)) * 100) / portfolioData.totalBuyUsd
    : 0
  const returnRate =
    !portfolioData?.avgPriceUsd || !portfolioData?.totalBuyUsd || !price || price === 0 ? '--' : returnRateValue
  const activeChainId = useActiveChainId()

  const { message: messageTokenStats } = useSubscription(`public/token_statistic/${activeChainId}/${address}`)

  useEffect(() => {
    if (!messageTokenStats) return
    try {
      const messageTokenStatsData = messageTokenStats?.message
      if (!messageTokenStatsData) return
      const data = JSON.parse(messageTokenStatsData?.toString() || '')
      setTokenStatistic(data)
    } catch (error) {
      console.warn('Error parsing token statistic message:', error)
    }
  }, [messageTokenStats])

  const fetchPortfolio = async () => {
    if (!userAddress) return
    const queryInput = {
      userAddress: userAddress,
      token: address,
      hideSmallBalance: false,
      hideSmallLiquidity: false,
      limit: 20,
      page: 0,
      chainId: getChainId(activeChain),
    }

    const response = await gqlClient.query({
      query: getPortfolio,
      variables: {
        input: queryInput,
      },
    })
    if (response.data.getPortfolio.data.length > 0) {
      setPortfolioData(response.data.getPortfolio.data[0])
    } else {
      setPortfolioData(null)
    }
  }

  const fetchTransactionHistory = async () => {
    if (!userAddress) return
    const queryInput: SearchOrderInput = {
      baseAddress: address,
      userAddress: userAddress,
      limit: 20,
      offset: offset,
      sortDir: SortDirection.Desc,
      sortField: OrderSortField.CreatedAt,
    }
    const response = await tradingClient.query({
      query: getTransactions,
      variables: {
        input: queryInput,
      },
    })

    const transactionsData = response?.data?.getTransactions ?? []

    if (offset > 0) {
      setTransactions((prev) => [...prev, ...transactionsData])
    } else {
      setTransactions(transactionsData)
    }
  }

  useEffect(() => {
    if (userAddress && address) {
      fetchPortfolio()
      fetchTransactionHistory()
    }
  }, [userAddress, address])

  useEffect(() => {
    fetchTransactionHistory()
  }, [offset])

  return (
    <div className=" relative">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-[#111111] p-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img
              src="/images/icons/arrow-left.svg"
              className="w-6 h-6 cursor-pointer"
              alt="arrow-left"
              onClick={() => {
                window.history.back()
              }}
            />
            <LogoWithChain
              logo={portfolioData?.logoUrl || getBlockChainLogo(portfolioData?.chainId, address)}
              chainLogo={getBlockchainLogo2(portfolioData?.chainId)}
              name={portfolioData ? portfolioData.symbol : ''}
              logoClassName="w-[32px] h-[32px]"
            />
          </div>
          <div>
            <div className="font-[380] text-[18px] text-white leading-none">
              {portfolioData?.symbol}
              <span className="font-normal text-[13px] text-white/50"> /USD</span>
            </div>
            <div
              className={`mt-1 font-medium text-[12px] leading-none flex gap-1 items-center ${Number(portfolioData?.price24hChange) > 0 ? 'text-rise' : Number(portfolioData?.price24hChange) < 0 ? 'text-fall' : 'text-white'}`}
            >
              <MoneyFormatted value={price} />
              <span>
                {tokenStatistic?.priceChange24h
                  ? formatPercentage(tokenStatistic?.priceChange24h, true)
                  : formatPercentage(portfolioData?.price24hChange, true)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[14px]">
          <img
            src="/images/futuresDetail/candle-icon.svg"
            alt="icon candle"
            className="cursor-pointer h-5 w-5 transition-all duration-100 hover:scale-[1.1]"
            onClick={() => {
              navigate(
                getPath(APP_PATH.MEME_TOKEN_DETAIL, {
                  address: address || '',
                  chain: activeChain,
                }),
                { state: { symbol: portfolioData?.symbol } },
              )
            }}
          />
          <ButtonShare
            costPrice={costPrice}
            returnRate={returnRate}
            tokenName={portfolioData?.symbol ?? ''}
            tokenAvatar={portfolioData?.logoUrl ?? ''}
            tokenLatestPrice={price || ''}
            avgMC={avgMC}
            holdingValue={holdingValue}
            holdingQuantity={holdingQuantity}
            PnL={PnL}
            realized={realized}
            unrealized={unrealized}
            chainId={portfolioData?.chainId ?? ChainIds.Solana}
            tokenAddress={address || ''}
            disabled={false}
            showTitle={false}
            totalBuy={portfolioData?.totalBuyUsd ?? '--'}
          />
        </div>
      </div>
      <div
        className="p-3 max-h-[calc(100vh-58px)] overflow-y-auto no-scrollbar"
        onScroll={(event) => {
          const target = event.currentTarget
          const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight

          if (scrollPercentage >= 0.75) {
            if (transactions.length < offset + 20) return
            setOffset((prev) => prev + 20)
          }
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="font-normal text-[14px] text-white/70 leading-none">
              {t('detail.myPositions.numberOfPosition')}
            </div>
            <div className="font-medium text-[14px] leading-none">
              <MoneyFormatted value={portfolioData?.totalBaseAmount} roundType="floor" showUnit={false} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-normal text-[14px] text-white/70 leading-none">{t('assets.token.pnl')}</div>
            <div
              className={`font-medium text-[14px] leading-none ${Number(PnL) > 0 ? 'text-rise' : Number(PnL) < 0 ? 'text-fall' : 'text-white'}`}
            >
              <MoneyFormatted value={PnL} roundType="floor" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-normal text-[14px] text-white/70 leading-none">{t('assets.token.averageCost')}</div>
            <div className="font-medium text-[14px] leading-none">
              <MoneyFormatted value={costPrice} roundType="ceil" className="text-rise font-[380] text-[13px]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-normal text-[14px] text-white/70 leading-none">
              {t('assets.token.averageMarketCap')}
            </div>
            <div className="font-medium text-[14px] leading-none">
              <MoneyFormatted value={avgMC} className="text-rise font-[380] text-[13px]" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {transactions.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="font-medium text-[16px] text-white leading-none">
                {t('assets.token.transactionHistory')}
              </div>
            </div>
          )}
          {transactions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-[20px] border-b-[0.5px] border-[#1E1E2F]"
            >
              <div className="flex items-center gap-2">
                {item.transactionType === TransactionType.Buy ? (
                  <img src="/images/icons/arrow-down.svg" className="w-7 h-7" alt="arrow-up" />
                ) : (
                  <img src="/images/icons/arrow-up.svg" className="w-7 h-7" alt="arrow-down" />
                )}
                <div>
                  <div className="font-medium text-[16px] text-white leading-none">
                    {item.transactionType === TransactionType.Buy ? t('assets.token.buy') : t('assets.token.sell')}{' '}
                    {portfolioData?.symbol}
                  </div>
                  <div className="mt-2 font-normal text-[12px] text-white/50 leading-none">
                    {dayjs(item.createdAt).format('YYYY/MM/DD HH:mm:ss')}
                  </div>
                </div>
              </div>
              <div
                className={`font-semibold text-[16px] ${item.transactionType === TransactionType.Buy ? 'text-rise' : 'text-fall'}`}
              >
                {item.transactionType === TransactionType.Buy ? '+' : '-'}{' '}
                <MoneyFormatted value={item?.baseAmount} showUnit={false} roundType="floor" /> {portfolioData?.symbol}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AssetsTokenDetailPage
