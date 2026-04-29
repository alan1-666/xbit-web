import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { cn, getPath } from '@/lib/utils.ts'
import { _activeWallet, mappedTypeChain } from '@/redux/modules/newWallet.slice.ts'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import { PortfolioDTO } from '@/types/holding.ts'
import { getBlockchainLogo2 } from '@/utils/helpers.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { IconWallet } from '@components/icon/stroke/IconWallet.tsx'
import ButtonShare from '@components/myPositions/ButtonShare.tsx'
import chainSymbolToId from '@components/myPositions/ChainSymbolToId.ts'
import { useNewTokenPrice } from '@hooks/useTokenPrice.ts'
import dayjs from 'dayjs'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import QuickSell from './QuickSell'
import { priceChain } from '@/redux/modules/price.slice'
import Decimal from 'decimal.js'
import { formatAmount, formatBalance, formatPercent } from '@/lib/format'
import { CurrencyUnit } from '@/types/currency'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import useHoldingSubscription from '../mqtt/HoldingSubscription'
import { useSelector } from 'react-redux'
import useWatchWalletTokenBalance from '@/hooks/useWatchWalletTokenBalance'
import { mapWalletTokenDataToPortfolio } from '@/utils/mappingType'
import { setData, setDataCurrentToken, updaShadowHolding, updateHolding } from '@/redux/modules/holding.slice'
import { PortfolioResponse } from '@/types/responses'
import { gqlClient } from '@/lib/gql/apollo-client'
import { getPortfolio } from '@/services/tokens.service'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

type PositionItemProps = {
  item: PortfolioDTO
  isProcessing?: boolean
  fallBackPrice?: number
  quickSellPercent: number | string
  unit?: CurrencyUnit
}

const handleTextColor = (value: string | number) => {
  if (value === '--' || value === '0' || value === '0.00' || !isFinite(+value) || value === 0) {
    return 'text-[#FFFFFFB2]'
  } else if (+value > 0) {
    return 'text-rise'
  } else {
    return 'text-fall'
  }
}

const PositionItem = ({ item, isProcessing, fallBackPrice, quickSellPercent, unit }: PositionItemProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const priceNativeToken = useAppSelector(priceChain(activeChain))
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain)
  const listWalletsByActiveChain = useMemo(() => {
    if (listWalletsByChain) {
      return listWalletsByChain?.filter((item: UserEmbeddedWalletDto) => item.chain === mappedTypeChain(activeChain))
    }
    return []
  }, [listWalletsByChain, activeChain])

  const chainUrl = getBlockchainLogo2(item?.chainId ?? chainSymbolToId['sol'])
  const symbol = item?.symbol || '--'
  const { logo: logoUrl } = useTokenInfo(item?.token, item?.chainId)
  // const tokenAddress = useMemo(() => location.pathname.split('/').filter(Boolean).at(-1) || '', [location.pathname])
  const priceMqtt = useNewTokenPrice(item?.token, item?.chainId)
  const price = item?.token && priceMqtt && +priceMqtt > 0 ? priceMqtt : fallBackPrice
  // Calculate the parameters
  const totalBaseEstimate = item?.estimateOrderValue
    ? // ? Number(item?.totalBaseAmount) + Number(item?.estimateOrderValue)
      new Decimal(item?.totalBaseAmount || 0).add(item?.estimateOrderValue || 0).toString()
    : new Decimal(item?.totalBaseAmount || 0).toString()
  const totalBase = +totalBaseEstimate >= 0 ? totalBaseEstimate : 0
  const balance = item?.isSellAll ? 0 : totalBase
  const realized = item?.realizedPnL ? Number(item?.realizedPnL) : 0
  const unrealized =
    +item?.avgPriceUsd === 0 && +item?.totalBuyQty === 0
      ? 0
      : +balance > 0
        ? (Number(price) - Number(item?.avgPriceUsd)) * +balance
        : 0
  const holdingValue = +balance * Number(price)
  const costPrice = !item?.avgPriceUsd || !item?.totalBuyUsd ? '--' : item?.avgPriceUsd
  const avgMC = item?.avgMarketCap
  const PnL =
    +item?.avgPriceUsd === 0 && +item?.totalBuyQty === 0
      ? 0
      : !item?.avgPriceUsd || !item?.totalBuyUsd
        ? '--'
        : Number(realized) + Number(unrealized)
  const returnRateUnrealized = item?.totalBuyUsd ? (Number(unrealized) * 100) / item?.totalBuyUsd : 0
  const returnRateValue = ((Number(realized) + Number(unrealized)) * 100) / item?.totalBuyUsd
  const returnRate = !item?.avgPriceUsd || !item?.totalBuyUsd || !price || price === 0 ? 0 : returnRateValue
  const totalBuyUsd = item?.totalBuyUsd || 0
  const totalBuyQty = item?.totalBuyQty || 0
  const totalSellUsd = item?.totalSellUsd || 0
  const totalSellQty = item?.totalSellQty || 0
  const isShowLoading = !price || price === 0 || isProcessing
  const activeWallet = useSelector(_activeWallet)
  const userAddress = activeWallet?.walletAddress
  const isXStock = item?.isXStock

  const queryGetCurrentPortfolio = useCallback(async () => {
    try {
      if (!userAddress) return

      const { data: res } = await gqlClient.query<PortfolioResponse>({
        query: getPortfolio,
        variables: {
          input: {
            chainId: activeWallet?.chainId,
            userAddress: userAddress,
            hideSmallLiquidity: false,
            hideModestBalance: false,
            hideZeroBalance: false,
            token: item?.token,
            tag: isXStock ? 'XStock' : 'meme',
          },
        },
        fetchPolicy: 'no-cache',
      })

      const fetched = res?.getPortfolio?.data ?? []
      dispatch(setDataCurrentToken(fetched?.[0]))
    } catch (err) {
      console.error(err)
    }
  }, [userAddress, gqlClient, activeWallet?.chainId, item?.token, isXStock, dispatch])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (item?.isProcessing) {
      timer = setTimeout(() => {
        queryGetCurrentPortfolio()
      }, 30000)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [item?.isProcessing, queryGetCurrentPortfolio])

  const handleClickItem = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    if (!item) return
    navigate(
      getPath(isXStock ? APP_PATH.X_STOCK_DETAIL : APP_PATH.MEME_TOKEN_DETAIL, {
        address: item.token,
        chain: CHAIN_SYMBOLS[+item.chainId],
      }),
      {
        state: { symbol: symbol },
      },
    )
  }

  const lastTxTime =
    item?.balanceUpdatedTime && item?.balanceUpdatedTime > 0
      // ? dayjs(item?.balanceUpdatedTime * 1000).format('YYYY-MM-DD HH:mm:ss')
      ? item?.balanceUpdatedTime * 1000
      : item?.lastTxTime
        ? item?.lastTxTime
        : ''
  const totalFee = item?.totalFee || 0
  const totalFeeUsd = item?.totalFeeUsd || 0
  const wallet = listWalletsByActiveChain?.find(
    (w: any) => w.walletAddress?.toLowerCase() === userAddress?.toLowerCase(),
  )

  const newPortfolio = useHoldingSubscription(userAddress, item?.token, activeWallet?.chainId)

  useEffect(() => {
    if (!newPortfolio) return
    const newItem = mapWalletTokenDataToPortfolio(newPortfolio)
    if (!newItem?.token) return
    if (item?.isShadow) {
      const holdingShadow: PortfolioDTO = {
        ...newItem,
        logoUrl: item?.logoUrl,
        symbol: item?.symbol,
        lastTxTime: item?.lastTxTime,
        price: item?.price,
        totalBaseAmount: item?.totalBaseAmount,
        userAddress: userAddress,
        completedTxs: newPortfolio.completedTxs,
      }
      dispatch(
        updaShadowHolding({
          tokenAddress: item?.token,
          updates: holdingShadow,
        }),
      )
      return
    }
    dispatch(
      updateHolding({
        tokenAddress: item?.token,
        updates: {
          avgMarketCap: newPortfolio.avgMarketCap,
          avgPriceUsd: newPortfolio.avgPriceUsd,
          totalBuyUsd: newPortfolio.totalBuyUsd,
          totalBuyQty: newPortfolio.totalBuyQty,
          totalSellUsd: newPortfolio.totalSellUsd,
          totalSellQty: newPortfolio.totalSellQty,
          realizedPnL: newPortfolio.realizedPnL,
          totalFeeUsd: newPortfolio.totalFeeUsd,
          totalFee: newPortfolio.totalFee,
          completedTxs: newPortfolio.completedTxs,
        },
      }),
    )
  }, [newPortfolio, dispatch])

  const msg = useWatchWalletTokenBalance({
    address: userAddress,
    token: item?.token,
    chainId: activeWallet?.chainId,
  })

  useEffect(() => {
    if (!msg?.token || !msg?.balance) return
    if (item?.isShadow) {
      dispatch(
        updaShadowHolding({
          tokenAddress: item?.token,
          updates: {
            totalBaseAmount: msg.balance,
            isLastUpdated: true,
            relatedTxHashes: msg.relatedTxHashes,
          },
        }),
      )
      return
    }
    dispatch(
      updateHolding({
        tokenAddress: item?.token,
        updates: {
          totalBaseAmount: msg.balance,
          isLastUpdated: true,
          relatedTxHashes: msg.relatedTxHashes,
        },
      }),
    )
  }, [msg, dispatch])

  const ChainIcon = () => <img src={getBlockchainLogo2(item?.chainId)} alt="" className="w-3 h-3" />

  return (
    <div
      className="leading-none grid grid-cols-[3fr_2fr_2fr_2fr_2fr_2fr_2fr_150px] items-center gap-2 px-4 py-3 hover:bg-[#FFFFFF0D] cursor-pointer"
      onClick={handleClickItem}
    >
      <div className="min-w-[180px] flex items-center gap-2">
        <LogoWithChain
          logo={logoUrl || ''}
          chainLogo={chainUrl}
          name={symbol || ''}
          logoContainerClassName="rounded-[8px]"
          logoClassName="w-9 h-9 min-w-9 rounded-[8px]"
        />
        <div>
          <div className="font-[450] text-[14px] text-[#FCFCFC] flex items-center">
            {symbol} {isXStock && <IconXStock className="ml-1.5" />}
            {+totalBuyUsd === 0 && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger type="button" className="ml-1.5">
                    <img src="/images/orderSetting/icon-info.svg" className="w-[14px] min-w-[14px]" alt="" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[360px]">
                    <p className="text-xs leading-[1.25]">{t('holding.tooltip.transferToken')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="font-[330] text-[12px] text-[#FCFCFC]">
              {lastTxTime ? dayjs(lastTxTime).locale('en').fromNow(true) : '--'}
            </span>
            <div className="flex items-center gap-1">
              <IconWallet />
              <span className="font-[380] text-[13px] text-[#878787]">{wallet?.name}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="min-w-[120px]">
        <div className="flex items-center gap-1 font-[380] text-[14px] text-[#FCFCFC]">
          {/* {unit === 'USD' ? (
            isShowLoading ? (
              <Loader />
            ) : (
              formatBalance(totalBuyUsd, {
                showCurrency: true,
                roundMode: 'floor',
              })
            )
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {isShowLoading ? (
                <Loader />
              ) : (
                formatAmount(totalBuyUsd / (priceNativeToken || 1), {
                  roundMode: 'floor',
                })
              )}
            </div>
          )} */}
          {unit === 'USD' ? (
            <>
              {totalBuyUsd &&
                formatBalance(totalBuyUsd, {
                  showCurrency: true,
                  roundMode: 'floor',
                })}
              {isShowLoading && <Loader />}
            </>
          ) : (
            <>
              <ChainIcon />
              {totalBuyUsd &&
                priceNativeToken &&
                formatAmount(totalBuyUsd / (priceNativeToken || 1), {
                  roundMode: 'floor',
                })}{' '}
              {isShowLoading && <Loader />}
            </>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1.5 font-[330] text-[14px] text-[#FCFCFC]">
          {formatAmount(totalBuyQty, {
            roundMode: 'floor',
          })}
          {isShowLoading && <Loader />}
        </div>
      </div>
      <div className="min-w-[120px]">
        <div className="flex items-center gap-1 font-[380] text-[14px] text-[#FCFCFC]">
          {unit === 'USD' ? (
            <>
              {formatBalance(totalSellUsd, {
                showCurrency: true,
                roundMode: 'floor',
              })}
              {isShowLoading && <Loader />}
            </>
          ) : (
            <>
              {' '}
              <ChainIcon />
              {formatAmount(totalSellUsd / (priceNativeToken || 1), {
                roundMode: 'floor',
              })}
              {isShowLoading && <Loader />}
            </>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1.5 font-[330] text-[14px] text-[#FCFCFC]">
          {formatAmount(totalSellQty, {
            roundMode: 'floor',
          })}
          {isShowLoading && <Loader />}
        </div>
      </div>
      <div className="min-w-[120px]">
        <div className="flex items-center gap-1 font-[380] text-[14px] text-[#FCFCFC]">
          {/* {unit === 'USD' ? (
            !price || price === 0 ? (
              <Loader />
            ) : (
              formatBalance(holdingValue, {
                showCurrency: true,
                roundMode: 'floor',
              })
            )
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {!price || price === 0 ? (
                <Loader />
              ) : (
                formatAmount(holdingValue / (priceNativeToken || 1), {
                  roundMode: 'floor',
                })
              )}
            </div>
          )} */}
          {unit === 'USD' ? (
            <>
              {formatBalance(holdingValue, {
                showCurrency: true,
                roundMode: 'floor',
              })}
              {isShowLoading && <Loader />}
            </>
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {formatAmount(holdingValue / (priceNativeToken || 1), {
                roundMode: 'floor',
              })}
              {isShowLoading && <Loader />}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1.5 font-[330] text-[14px] text-[#FCFCFC]">
          {/* {!price || price === 0 ? (
            <Loader />
          ) : (
            formatAmount(totalBase, {
              roundMode: 'floor',
            })
          )} */}
          {formatAmount(totalBase, {
            roundMode: 'floor',
          })}
          {isShowLoading && <Loader />}
        </div>
      </div>
      <div className="min-w-[120px]">
        <div
          className={cn(
            'flex items-center gap-1 font-[380] text-[14px]',
            handleTextColor(item?.avgPriceUsd && unrealized !== 0 ? unrealized : '--'),
          )}
        >
          {/* {unit === 'USD' ? (
            isShowLoading ? (
              <Loader />
            ) : (
              <MoneyFormatted
                value={item?.avgPriceUsd && item?.totalBuyUsd ? unrealized : '--'}
                loading={isShowLoading}
                roundType="floor"
              />
            )
          ) : (
            <div className="flex items-center gap-1">
              <ChainIcon />
              {isShowLoading ? (
                <Loader />
              ) : (
                <MoneyFormatted
                  className="truncate"
                  value={item?.avgPriceUsd && item?.totalBuyUsd ? unrealized / (priceNativeToken || 1) : '--'}
                  loading={isShowLoading}
                  roundType="floor"
                  showUnit={false}
                />
              )}
            </div>
          )} */}
          {unit === 'USD' ? (
            <>
              {unrealized === 0 || Number.isNaN(unrealized)
                ? 0
                : formatBalance(unrealized, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })}
              {isShowLoading && <Loader />}
            </>
          ) : (
            <>
              <ChainIcon />
              {item?.avgPriceUsd &&
                item?.totalBuyUsd &&
                formatBalance(unrealized / priceNativeToken, {
                  roundMode: 'floor',
                })}
              {isShowLoading && <Loader />}
            </>
          )}
          {/* {isShowLoading ? (
            <div className="mt-1.5 ">
              <Loader />
            </div>
          ) : (
            <div
              className={cn(
                'mt-1.5 font-[380] text-[13px]',
                Number(unrealized) === 0 || isProcessing || returnRateUnrealized === '--'
                  ? 'text-[#FFFFFFB2]'
                  : Number(unrealized) > 0
                    ? 'text-rise/80'
                    : 'text-fall/80',
              )}
            >
              {returnRateUnrealized === '--' ? '--' : formatPercentage(returnRateUnrealized)}
            </div>
          )} */}
        </div>
        <div
          className={cn(
            'flex items-center gap-1 mt-1.5 font-[380] text-[13px]',
            Number(unrealized) === 0 || Number.isNaN(unrealized)
              ? 'text-[#FFFFFFB2]'
              : Number(unrealized) > 0
                ? 'text-rise/80'
                : 'text-fall/80',
          )}
        >
          {formatPercent(returnRateUnrealized, {
            showSign: true,
          })}
          {isShowLoading && <Loader />}
        </div>
      </div>
      <div className="min-w-[140px]">
        <div className="flex items-center gap-1">
          <div
            className={cn(
              'flex items-center gap-1 font-[380] text-[14px]',
              Number(realized) + Number(unrealized) === 0 || isProcessing
                ? 'text-[#FFFFFFB2]'
                : Number(realized) + Number(unrealized) > 0
                  ? 'text-rise'
                  : 'text-fall',
            )}
          >
            {/* {unit === 'USD' ? (
              isShowLoading ? (
                <Loader />
              ) : (
                <MoneyFormatted value={PnL} loading={isShowLoading} roundType="floor" />
              )
            ) : (
              <div className="flex items-center gap-1">
                <ChainIcon />
                {isShowLoading ? (
                  <Loader />
                ) : (
                  formatBalance(typeof PnL === 'number' ? PnL / (priceNativeToken || 1) : null, {
                    roundMode: 'floor',
                  })
                )}
              </div>
            )} */}
            {unit === 'USD' ? (
              <>
                {PnL == '--'
                  ? 0
                  : formatBalance(PnL, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })}
                {isShowLoading && <Loader />}
              </>
            ) : (
              <>
                <ChainIcon />
                {PnL !== '--' &&
                  formatBalance(typeof PnL === 'number' ? PnL / (priceNativeToken || 1) : null, {
                    roundMode: 'floor',
                  })}
                {isShowLoading && <Loader />}
              </>
            )}
          </div>
          <ButtonShare
            showTitle={false}
            costPrice={costPrice}
            returnRate={item?.avgPriceUsd && item?.totalBuyUsd ? returnRate : '--'}
            tokenName={item?.symbol ?? ''}
            tokenAvatar={item?.avatarUrl ? item?.avatarUrl : (item?.logoUrl ?? '')}
            tokenLatestPrice={price ?? ''}
            tokenAddress={item?.token ?? ''}
            avgMC={avgMC}
            holdingValue={holdingValue}
            holdingQuantity={item?.totalBaseAmount ?? 0}
            PnL={item?.avgPriceUsd ? PnL : '--'}
            realized={item?.realizedPnL ? realized : '--'}
            unrealized={item?.avgPriceUsd ? unrealized : '--'}
            chainId={item?.chainId ?? ChainIds.Solana}
            disabled={isProcessing}
            isXStock={isXStock}
            totalBuy={item?.totalBuyUsd ?? '--'}
          />
        </div>
        <div
          className={cn(
            'flex items-center gap-1 mt-1.5 font-[330] text-[13px]',
            Number(realized) + Number(unrealized) === 0 || isProcessing
              ? 'text-[#FFFFFFB2]'
              : Number(realized) + Number(unrealized) > 0
                ? 'text-rise/80'
                : 'text-fall/80',
          )}
        >
          {/* {returnRate === '--' ? '--' : isProcessing ? <Loader /> : formatPercentage(returnRate)} */}
          {formatPercent(returnRate, {
            showSign: true,
          })}
          {isShowLoading && <Loader />}
        </div>
      </div>
      <div className="min-w-[120px] flex items-center gap-1 font-[380] text-[14px] text-[#FCFCFC]">
        {/* {unit === 'USD' ? (
          <MoneyFormatted value={totalFeeUsd} loading={isShowLoading} roundType="ceil" />
        ) : (
          <div className="flex items-center justify-end gap-1">
            <ChainIcon />
            <MoneyFormatted value={totalFee} loading={isShowLoading} roundType="ceil" showUnit={false} />
          </div>
        )} */}
        {unit === 'USD' ? (
          <>
            {formatBalance(totalFeeUsd, {
              showCurrency: true,
              roundMode: 'ceil',
            })}
            {isShowLoading && <Loader />}
          </>
        ) : (
          <>
            <ChainIcon />
            {formatBalance(totalFee, {
              roundMode: 'ceil',
            })}
            {isShowLoading && <Loader />}
          </>
        )}
      </div>
      <div className="w-[100px] flex items-center justify-end">
        <QuickSell
          symbol={item?.symbol ?? ''}
          baseAddress={item?.token ?? ''}
          holdingQuantity={totalBase ?? 0}
          quickSellPercent={quickSellPercent}
          price={price}
          portfolio={item}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  )
}

export default memo(PositionItem)
