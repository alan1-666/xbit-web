import SelectAccountType from '@/components/assets/overview/SelectAccountType'
import Loader from '@/components/common/Loader'
import { APP_PATH } from '@/lib/constant'
import { formatBalance, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import ExchangeActions from '@components/assets/overview/ExchangeActions.tsx'
import IconClock from '@components/icon/stroke/IconClock.tsx'
import { useNavigateWithLocation } from '@hooks/useNavigateWithLocation.ts'
import { useContext, useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { FeatureFlags } from '@const/featureFlags.ts'
import { ARB_NATIVE_TOKENS, BSC_NATIVE_TOKENS, ETH_NATIVE_TOKENS, SOL_NATIVE_TOKENS } from '@/lib/constant.ts'
import { getBlockChainLogo, getBlockchainLogo2 } from '@/utils/helpers.ts'
import { useHoldingTokens } from '@pages/assets/overview/hooks/useHoldingTokens.ts'
import { ChainIds } from '@/types/enums.ts'
import { NativeTokenIcon } from '@pages/assets/overview/components/NativeTokenIcon.tsx'
import ChainCurrencyIcon from '@components/common/ChainCurrencyIcon.tsx'
import { NativeTokenPriceCell } from '@pages/assets/overview/components/NativeTokenPriceCell.tsx'
import { MemeTokenPriceCell } from '@pages/assets/overview/components/MemeTokenPriceCell.tsx'
import { MemeTokenBalanceCell } from '@pages/assets/overview/components/MemeTokenBalanceCell.tsx'
import { NativeTokenBalanceCell } from '@pages/assets/overview/components/NativeTokenBalanceCell.tsx'

const checkIsNativeToken = (chainId: ChainIds, tokenAddress: string) => {
  if (chainId === ChainIds.Solana) {
    return SOL_NATIVE_TOKENS.includes(tokenAddress)
  }
  if (chainId === ChainIds.Ethereum) {
    return ETH_NATIVE_TOKENS.includes(tokenAddress.toLowerCase())
  }
  if (chainId === ChainIds.Arbitrum) {
    return ARB_NATIVE_TOKENS.includes(tokenAddress.toLowerCase())
  }
  if (chainId === ChainIds.Bsc) {
    return BSC_NATIVE_TOKENS.includes(tokenAddress.toLowerCase())
  }
}

type ModuleKey = 'futures' | 'funding' | 'prediction'

type Section = {
  key: ModuleKey
  title: string
  value: number | string
  onClick?: () => void
  isLoading?: boolean
}

type UseModulesConfigsReturn = {
  [key in ModuleKey]: boolean
}

const useModulesConfigs = (): UseModulesConfigsReturn => {
  const predictionEnabled = useFeatureIsOn(FeatureFlags.ENABLE_PREDICTION_MODULE)
  const futuresEnabled = true // Should be configurable via growthbook when we have more modules
  const memeEnabled = true // Should be configurable via growthbook when we have more modules
  return {
    futures: futuresEnabled,
    funding: memeEnabled,
    prediction: predictionEnabled,
  }
}

export const Overview = ({
  walletBalances,
  predictionBalance,
  loadingPredictionBalance,
}: {
  walletBalances: any
  predictionBalance?: number
  loadingPredictionBalance?: boolean
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const navigateWithLocation = useNavigateWithLocation()
  const {
    hideBalance,
    toggleHideBalance,
    totalBalance,
    changeAmount = 0,
    changePercentage = 0,
    walletBalanceData,
    futuresBalance,
    loadingFundingBalance,
    loadingFuturesBalance,
  } = useContext(AssetOverviewContext)

  const { assets, isLoading, loadMoreFn } = useHoldingTokens({
    hideSellAll: false,
    hideSmallAmount: false,
    hideSmallLiquidityPool: false,
    searchText: '',
    walletAddresses: undefined,
  })

  const [openSelectAccountDeposit, setOpenSelectAccountDeposit] = useState(false)
  const [openSelectAccountWithdraw, setOpenSelectAccountWithdraw] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const body = document.body
      const doc = document.documentElement
      const scrollTop = body.scrollTop || doc.scrollTop
      const scrollHeight = body.scrollHeight || doc.scrollHeight
      const clientHeight = window.innerHeight
      if (!scrollHeight) return

      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrollPercentage >= 0.75 && !isLoading) {
        loadMoreFn?.()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoading, loadMoreFn])

  const toggle = () => {
    toggleHideBalance(!hideBalance)
  }

  const fundingBalance = useMemo(() => {
    if (!walletBalanceData) return 0
    return walletBalanceData.funding?.reduce((acc, cur) => {
      return acc + parseFloat(cur.usdBalance || '0')
    }, 0)
  }, [walletBalanceData])

  const fututresBalance = useMemo(() => {
    if (!walletBalanceData && !futuresBalance) return 0
    if (!walletBalanceData && futuresBalance) {
      return futuresBalance
    }
    return futuresBalance
      ? futuresBalance
      : walletBalanceData?.futures?.reduce((acc, cur) => {
          return acc + parseFloat(cur.usdBalance || '0')
        }, 0)
  }, [walletBalanceData, futuresBalance])

  const modulesConfigs = useModulesConfigs()

  const allSections: Section[] = useMemo(() => {
    return [
      {
        key: 'futures',
        title: t('assets.futures.title'),
        value: Number(fututresBalance),
        onClick: () => {
          navigate(APP_PATH.ASSETS + '/perps')
        },
        isLoading: loadingFuturesBalance,
      },
      {
        key: 'funding',
        title: t('assets.funding.title'),
        value: Number(fundingBalance),
        onClick: () => {
          navigate(APP_PATH.ASSETS + '/meme')
        },
        isLoading: loadingFundingBalance,
      },
      {
        key: 'prediction',
        title: 'Prediction',
        value: Number(predictionBalance || 0),
        onClick: () => {
          navigate(APP_PATH.PREDICTION_ASSETS)
        },
        isLoading: loadingPredictionBalance,
      },
    ]
  }, [
    fundingBalance,
    fututresBalance,
    loadingFundingBalance,
    loadingFuturesBalance,
    predictionBalance,
    loadingPredictionBalance,
  ])

  const sections = useMemo(() => {
    return allSections.filter((section) => modulesConfigs[section.key])
  }, [allSections, modulesConfigs])

  // const loadingBalance = loadingFundingBalance || loadingFuturesBalance || loadingPredictionBalance
  const loadingBalance = useMemo(() => {
    return sections.every((section) => section.isLoading)
  }, [sections])

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-[240px] flex-col items-center justify-between bg-transparent">
        <div className="flex-1 flex flex-col items-center space-y-2 justify-center">
          <div className="font-semi-bold cursor-pointer text-[32px] leading-8" onClick={toggle}>
            {loadingBalance ? (
              <Loader />
            ) : hideBalance ? (
              '*****'
            ) : (
              formatBalance(Number(totalBalance || 0), {
                showCurrency: true,
                roundMode: 'floor',
              })
            )}
          </div>
          <div
            className={cn(
              'text-[16px] leading-4 flex items-center gap-2',
              changeAmount > 0 ? 'text-rise' : changeAmount < 0 ? 'text-fall' : 'text-white',
            )}
          >
            <span>
              {loadingBalance ? (
                <Loader />
              ) : hideBalance ? (
                '*****'
              ) : (
                formatBalance(changeAmount, {
                  showSign: true,
                  showCurrency: true,
                  roundMode: 'floor',
                })
              )}
            </span>
            <span
              className={cn(
                'px-2 py-[2.5px] rounded-[4px]',
                changePercentage > 0 ? 'bg-rise/15' : changePercentage < 0 ? 'bg-fall/15' : 'bg-white/15',
              )}
            >
              {loadingBalance ? (
                <Loader />
              ) : (
                formatPercent(changePercentage, {
                  showSign: true,
                })
              )}
            </span>
          </div>
        </div>
        <ExchangeActions
          onDepositClick={() => setOpenSelectAccountDeposit(true)}
          onWithdrawClick={() => setOpenSelectAccountWithdraw(true)}
          onTransferClick={() => navigateWithLocation(`${APP_PATH.CRYPTO_DEPOSIT}?source=futures`, { walletBalances })}
        />
      </div>
      <div className="mt-5 min-h-[300px] flex-1 rounded-t-2xl bg-[#0A0A0A] pt-3">
        <div className="sticky top-0 z-20 flex items-center justify-between bg-[#0A0A0A] px-4 py-1">
          <div className="text-[18px] font-medium text-white">{t('bottomNav.assets')}</div>
          <IconClock
            className="size-4 text-[#908E98] hover:text-white cursor-pointer"
            onClick={() => {
              navigate(APP_PATH.ASSET_HISTORY)
            }}
          />
        </div>
        <div className="no-scrollbar mt-1 space-y-2 overflow-auto px-4 pt-2.5 pb-[80px]">
          {/* {sections.map((section, index) => (
            <div
              key={index}
              className="rounded-[10px] p-3.5 cursor-pointer bg-[#18181B] transition-colors duration-200 flex items-center justify-between"
              onClick={section.onClick}
            >
              <div>
                <div className="font-semibold text-[16px] leading-5.5 text-white">{section.title}</div>
                <div className="font-normal text-[12px] leading-5.5 text-[#908E98]">
                  {section?.isLoading ? (
                    <Loader />
                  ) : hideBalance ? (
                    '******'
                  ) : typeof section.value === 'number' ? (
                    formatBalance(section.value, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })
                  ) : (
                    section.value
                  )}
                </div>
              </div>
              <img className="-rotate-90 size-6" src="/images/assets/arrow-down.svg" alt="" />
            </div>
          ))} */}
          {assets.map((token, index) => {
            const chainId = token.chainId ? (+token.chainId as ChainIds) : ChainIds.Solana
            const isNativeToken = checkIsNativeToken(chainId, token.token)
            const tokenLogo =
              token.symbol === 'USDC'
                ? '/images/icons/chains/ic-usdc.svg'
                : (token.logoUrl ?? getBlockChainLogo(chainId, token.token, token?.symbol))
            return (
              <div key={index} className="relative w-full overflow-hidden rounded-[20px]">
                <img className="absolute inset-0 h-[68px] w-[68px] object-cover blur-3xl" src={tokenLogo} alt="" />
                <div className="relative z-10 flex items-center justify-between rounded-[20px] border border-[#2F2A4680] bg-linear-to-r from-[#FFFFFF05] to-[#FFFFFF0A] px-3.75 py-3 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    {isNativeToken ? (
                      <NativeTokenIcon
                        address={token.token}
                        chainId={token.chainId}
                        fallbackUrl={
                          token.symbol === 'USDC'
                            ? '/images/icons/chains/ic-usdc.svg'
                            : (token.logoUrl ?? getBlockChainLogo(chainId, token.token, token?.symbol))
                        }
                        avatarClassName="size-11"
                        avatarImageClassName="size-11"
                        fallbackClassName="size-11"
                      />
                    ) : (
                      <ChainCurrencyIcon
                        currencyIcon={token.logoUrl ?? getBlockChainLogo(chainId, token.token, token?.symbol)}
                        name={token.symbol}
                        chainIcon={getBlockchainLogo2(chainId)}
                        avatarClassName="size-11"
                        avatarImageClassName="size-11"
                        fallbackClassName="size-11"
                      />
                    )}
                    <div>
                      <span className="text-[14px] leading-[14px]">{token.symbol}</span>
                      {isNativeToken ? <NativeTokenPriceCell token={token} /> : <MemeTokenPriceCell token={token} />}
                    </div>
                  </div>
                  <div>
                    {isNativeToken ? <NativeTokenBalanceCell token={token} /> : <MemeTokenBalanceCell token={token} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <SelectAccountType
        open={openSelectAccountDeposit}
        setOpen={setOpenSelectAccountDeposit}
        title={t('assets.deposit.title')}
        onAccountSelected={(accType) => {
          if (accType === 'PERPS') {
            navigate(APP_PATH.PERPS_DEPOSIT)
          } else if (accType === 'PREDICTION') {
            navigate(APP_PATH.PREDICTION_DEPOSIT)
          } else {
            navigate(APP_PATH.DEPOSIT)
          }
        }}
      />
      <SelectAccountType
        open={openSelectAccountWithdraw}
        setOpen={setOpenSelectAccountWithdraw}
        title={t('assets.withdraw.withdrawLabel')}
        onAccountSelected={(accType) => {
          if (accType === 'PERPS') {
            navigate(APP_PATH.PERPS_WITHDRAW)
          } else if (accType === 'PREDICTION') {
            navigate(APP_PATH.PREDICTION_WITHDRAW)
          } else {
            navigate(APP_PATH.WITHDRAWAL)
          }
        }}
      />
    </div>
  )
}
