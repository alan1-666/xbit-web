import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn, getPath } from '@/lib/utils'
import Text from '@/components/common/Text'
import { IconSpinner } from '@/components/icon'
import { toast } from 'sonner'
import { useXStockTokens } from '@/components/xstocks/hooks/useXStockTokens'
import { ChainIds } from '@/types/enums'
import { TokenSortFields } from '@/@generated/gql/graphql-meme2'
import { futureClient } from '@/lib/gql/apollo-client'
import { addTokenToFavorite } from '@services/tokens.service'
import { useActiveWallet } from '@/hooks/useActiveWallet'
import { ChainType } from '@/@generated/gql/graphql-future'
import { IconXStock } from '@components/common/tags/IconXStock.tsx'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'

const onIconError: React.ReactEventHandler<HTMLImageElement> = (e) => {
  const target = e.currentTarget
  if (!target || target.dataset.fallbackApplied === 'true') return
  target.dataset.fallbackApplied = 'true'
}

const TickSquareIcon = ({ checked }: { checked: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" stroke="#605E68" fill="transparent" />
    )}
  </svg>
)

interface RecommendedXStocksProps {
  onAddSuccess?: () => void
}

const RecommendedXStocks = ({ onAddSuccess }: RecommendedXStocksProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set())
  const activeWallet = useActiveWallet()
  const initializedRef = useRef(false)

  // 获取美股数据,按池子金额排序
  const { tokens, isLoading } = useXStockTokens({ chainId: ChainIds.Solana, sortBy: TokenSortFields.Liquidity })

  // 取前8个数据
  const xstocks = useMemo(() => {
    return (tokens || []).slice(0, 8)
  }, [tokens])

  // 只在首次加载时初始化选中所有代币
  useEffect(() => {
    if (!initializedRef.current && xstocks.length > 0) {
      setSelectedTokens(new Set(xstocks.map((s) => s.address || '')))
      initializedRef.current = true
    }
  }, [xstocks])

  // 每小时自动更新数据(通过 useXStockTokens 的 refetch)
  // 注意:useXStockTokens 已经有缓存机制,这里不需要额外的定时器

  const handleToggleToken = useCallback((address: string) => {
    setSelectedTokens((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(address)) {
        newSet.delete(address)
      } else {
        newSet.add(address)
      }
      return newSet
    })
  }, [])

  const handleNavigateToXStock = useCallback(
    (xstock: any, e: React.MouseEvent) => {
      e.stopPropagation()
      const chainId = xstock.chainId ? +xstock.chainId : ChainIds.Solana
      navigate(getPath(APP_PATH.X_STOCK_DETAIL, { address: xstock.address ?? '', chain: CHAIN_SYMBOLS[chainId] }), {
        state: {
          symbol: xstock.symbol,
          tokenLogo: xstock.logoUrl,
          tokenName: xstock.name,
          createdTime: xstock.createdTime,
          address: xstock.address,
          chainId: xstock.chainId,
          isXStock: true,
        },
      })
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
              chain: ChainType.Solana,
            },
          }),
        ),
      )

      toast.success(t('toast.addFavoriteSuccess'))
      onAddSuccess?.()
    } catch (err: any) {
      console.error('Add to favorites error:', err)
      toast.error(err[0]?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [selectedTokens, onAddSuccess, t, activeWallet.isConnected])

  if (isLoading || xstocks.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-[40px] py-0 w-full mt-3">
      {/* 2列网格布局 */}
      <div className="flex flex-col gap-[12px] w-full">
        {Array.from({ length: Math.ceil(xstocks.length / 2) }).map((_, rowIndex) => {
          const startIndex = rowIndex * 2
          const rowXStocks = xstocks.slice(startIndex, startIndex + 2)

          return (
            <div key={rowIndex} className="flex gap-[12px] w-full">
              {rowXStocks.map((xstock) => {
                const isSelected = selectedTokens.has(xstock.address || '')
                const iconUrl = xstock.logoUrl

                return (
                  <div
                    key={xstock.address}
                    onClick={() => handleToggleToken(xstock.address || '')}
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
                        onClick={(e) => handleNavigateToXStock(xstock, e)}
                      >
                        <div className="relative">
                          <img
                            src={iconUrl}
                            alt={xstock.symbol}
                            className="w-[24px] h-[24px] rounded-full bg-[#EDF0F4] object-contain"
                            onError={onIconError}
                          />
                          {/* 美股标识 */}
                          <div className="p-[1px] z-10 bg-[linear-gradient(37.15deg,#E149F8_13.23%,#9945FF_37.52%,#00F3AB_93.06%)] rounded-full absolute -bottom-0.5 -right-0.5">
                            <div className="w-[11px] h-[11px] bg-[#101114] p-[2px] rounded-full">
                              <IconXStock className="w-full h-full" />
                            </div>
                          </div>
                        </div>
                        <Text
                          text={xstock.symbol}
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
                      text={t('header.xstocks')}
                      fontSize={12}
                      fontWeight="regular"
                      color="#605E68"
                      className="leading-[12px]"
                    />
                  </div>
                )
              })}
              {/* 如果是奇数个，最后一行填充空白 */}
              {rowXStocks.length === 1 && <div className="flex-1" />}
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

export default RecommendedXStocks
