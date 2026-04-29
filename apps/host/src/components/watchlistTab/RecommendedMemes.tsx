import { useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn, getPath } from '@/lib/utils'
import Text from '@/components/common/Text'
import { IconSpinner } from '@/components/icon'
import { toast } from 'sonner'
import { useMemeTokens } from '@pages/futures-market/hooks/useMemeTokens'
import { TokenDirection } from '@/@generated/gql/graphql-future'
import { ChainIds } from '@/types/enums'
import { futureClient } from '@/lib/gql/apollo-client'
import { addTokenToFavorite } from '@services/tokens.service'
import { useActiveChainType } from '@/hooks/useActiveChain'
import { useActiveWallet } from '@/hooks/useActiveWallet'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'

const MEME_COINS_ICON = import.meta.env.VITE_FUTURES_COINS_ICON

const getCoinIconUrl = (token: string) => {
  if (!token) return ''
  if (!MEME_COINS_ICON) return ''
  return `${MEME_COINS_ICON}/${token.toUpperCase()}.svg`
}

const onCoinIconError: React.ReactEventHandler<HTMLImageElement> = (e) => {
  const target = e.currentTarget
  if (!target || target.dataset.fallbackApplied === 'true') return
  target.dataset.fallbackApplied = 'true'
  
  // 创建 fallback 元素
  const fallback = document.createElement('div')
  fallback.className = 'w-[24px] h-[24px] rounded-full bg-[#111111] flex items-center justify-center text-[10px] text-white font-medium border-[0.8px] border-[#23292F] capitalize select-none'
  fallback.textContent = (target.alt || '').slice(0, 2).toLowerCase()
  
  // 替换图片
  target.style.display = 'none'
  target.parentElement?.appendChild(fallback)
}

const getChainIcon = (chainId: number) => {
  const chainIconMap: Record<number, string> = {
    [ChainIds.Solana]: '/images/icons/icon-sol.svg',
    [ChainIds.Ethereum]: '/images/ether.svg',
    [ChainIds.Arbitrum]: '/images/icons/chains/ic-arbitrum.svg',
    [ChainIds.Bsc]: '/images/bsc.svg',
    [ChainIds.Mon]: '/images/icons/chains/ic-monad.svg',
  }
  return chainIconMap[chainId] || '/images/icons/icon-sol.svg'
}

const TickSquareIcon = ({ checked }: { checked: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {checked ? (
      <>
        <rect width="16" height="16" rx="4" fill="#843BEA" />
        <path
          d="M11.3334 5.5L6.75002 10.0833L4.66669 8"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <rect
        x="0.5"
        y="0.5"
        width="15"
        height="15"
        rx="3.5"
        stroke="#605E68"
        fill="transparent"
      />
    )}
  </svg>
)

interface RecommendedMemesProps {
  onAddSuccess?: () => void
}

const RecommendedMemes = ({ onAddSuccess }: RecommendedMemesProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set())
  const activeChainType = useActiveChainType()
  const activeWallet = useActiveWallet()

  // 获取 Meme 数据
  const { data, refetch } = useMemeTokens({
    direction: TokenDirection.Popular,
  })

  // 取前8个数据
  const memes = useMemo(() => {
    return (data || []).slice(0, 8)
  }, [data])

  // 初始化选中所有代币(仅首次)
  const [isInitialized, setIsInitialized] = useState(false)
  useEffect(() => {
    if (memes.length > 0 && !isInitialized) {
      setSelectedTokens(new Set(memes.map((m) => m.token)))
      setIsInitialized(true)
    }
  }, [memes, isInitialized])

  // 每小时自动更新数据
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 60 * 60 * 1000) // 1小时

    return () => clearInterval(interval)
  }, [refetch])

  const handleToggleToken = useCallback((token: string) => {
    setSelectedTokens((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(token)) {
        newSet.delete(token)
      } else {
        newSet.add(token)
      }
      return newSet
    })
  }, [])

  const handleNavigateToMeme = useCallback(
    (token: string, chainId: number, e: React.MouseEvent) => {
      e.stopPropagation()
      navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: token, chain: CHAIN_SYMBOLS[chainId] }))
    },
    [navigate],
  )

  const handleAddToFavorites = useCallback(async () => {
    if (!activeWallet.isConnected) {
      return toast.error(t('appSettings.loginRequired'))
    }

    if (selectedTokens.size === 0) {
      return
    }

    try {
      setLoading(true)
      const tokensArray = Array.from(selectedTokens)

      // 批量添加到自选
      await Promise.all(
        tokensArray.map((token) =>
          futureClient.mutate({
            mutation: addTokenToFavorite,
            variables: {
              token,
              chain: activeChainType,
            },
          })
        )
      )

      toast.success(t('toast.addFavoriteSuccess'))
      onAddSuccess?.()
    } catch (err: any) {
      console.error('Add to favorites error:', err)
      toast.error(err[0]?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [selectedTokens, onAddSuccess, t, activeChainType, activeWallet.isConnected])

  if (memes.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-[40px] py-0 w-full mt-3">
      {/* 2列网格布局 */}
      <div className="flex flex-col gap-[12px] w-full">
        {Array.from({ length: Math.ceil(memes.length / 2) }).map((_, rowIndex) => {
          const startIndex = rowIndex * 2
          const rowMemes = memes.slice(startIndex, startIndex + 2)

          return (
            <div key={rowIndex} className="flex gap-[12px] w-full">
              {rowMemes.map((meme) => {
                const isSelected = selectedTokens.has(meme.token)
                const iconUrl = meme.avatarUrl || meme.image || getCoinIconUrl(meme.symbol)
                const chainIcon = getChainIcon(meme.chainId)

                return (
                  <div
                    key={meme.token}
                    onClick={() => handleToggleToken(meme.token)}
                    className={cn(
                      'bg-[#101114] flex flex-1 flex-col gap-[4px] h-[56px]',
                      'items-start justify-center overflow-clip px-[12px] py-[16px]',
                      'rounded-[8px] cursor-pointer transition-all',
                      'hover:bg-[#18181d]',
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="flex items-center gap-[8px] cursor-pointer"
                        onClick={(e) => handleNavigateToMeme(meme.token, meme.chainId, e)}
                      >
                        <div className="relative">
                          <img
                            src={iconUrl}
                            alt={meme.symbol}
                            className="w-[24px] h-[24px] rounded-full bg-[#EDF0F4] object-contain"
                            onError={onCoinIconError}
                          />
                          {chainIcon && (
                            <div className="p-[1px] z-10 bg-[linear-gradient(37.15deg,#E149F8_13.23%,#9945FF_37.52%,#00F3AB_93.06%)] rounded-full absolute -bottom-0.5 -right-0.5">
                              <img
                                src={chainIcon}
                                className={`${meme.chainId === ChainIds.Solana ? 'p-[2px]' : ''} size-3 rounded-full bg-[#000000]`}
                                alt="chain logo"
                              />
                            </div>
                          )}
                        </div>
                        <Text
                          text={meme.symbol}
                          fontSize={14}
                          fontWeight="semibold"
                          color="#FFFFFF"
                          className="leading-[14px]"
                        />
                      </div>
                      <div className="shrink-0">
                        <TickSquareIcon checked={isSelected} />
                      </div>
                    </div>
                    <Text
                      text={t('header.meme')}
                      fontSize={12}
                      fontWeight="regular"
                      color="#605E68"
                      className="leading-[12px]"
                    />
                  </div>
                )
              })}
              {/* 如果是奇数个，最后一行填充空白 */}
              {rowMemes.length === 1 && <div className="flex-1" />}
            </div>
          )
        })}
      </div>

      {/* 一键添加按钮 */}
      <button
        onClick={handleAddToFavorites}
        disabled={loading || selectedTokens.size === 0}
        className={cn(
          'bg-[#843bea] flex h-[44px] items-center justify-center',
          'px-[24px] py-[11px] rounded-[200px] w-full',
          'transition-all duration-300',
          'hover:opacity-90 active:scale-[0.98]',
          loading && 'opacity-70 cursor-not-allowed',
          selectedTokens.size === 0 && 'opacity-30 cursor-not-allowed',
        )}
      >
        {loading ? (
          <IconSpinner className="size-5 animate-spin" />
        ) : (
          <Text
            text={t('futuresMarket.addAll')}
            fontSize={16}
            fontWeight="regular"
            color="#FFFFFF"
            className="leading-none"
          />
        )}
      </button>
    </div>
  )
}

export default RecommendedMemes
