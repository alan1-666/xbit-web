import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import Text from '@/components/common/Text'
import { IconSpinner } from '@/components/icon'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { UPSERT_FAVORITE_SYMBOL } from '@/services/symbol.dex.service'
import { ServiceConfig } from '@/lib/gql/service-config'
import { toast } from 'sonner'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { ButtonConnectWallet } from '../common/ButtonConnectWallet'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'

interface RecommendedContractsProps {
  contracts: ISymbolList[]
  onAddSuccess?: () => void
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

const RecommendedContracts = ({ contracts, onAddSuccess }: RecommendedContractsProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedSymbols, setSelectedSymbols] = useState<Set<string>>(() => new Set(contracts.map((c) => c.symbol)))
  const activeWallet = useSelector(_activeWallet)

  const handleToggleSymbol = useCallback((symbol: string) => {
    setSelectedSymbols((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(symbol)) {
        newSet.delete(symbol)
      } else {
        newSet.add(symbol)
      }
      return newSet
    })
  }, [])

  const handleNavigateToTrade = useCallback(
    (symbol: string, e: React.MouseEvent) => {
      e.stopPropagation()
      navigate(`/futures/${symbol}`)
    },
    [navigate],
  )

  const handleAddToFavorites = useCallback(async () => {
    if (!ServiceConfig.token) {
      return toast.error(t('appSettings.loginRequired'))
    }

    if (selectedSymbols.size === 0) {
      return
    }

    try {
      setLoading(true)
      const symbolsArray = Array.from(selectedSymbols)

      const { data } = await symbolDexClient.mutate({
        mutation: UPSERT_FAVORITE_SYMBOL,
        variables: {
          input: {
            symbol: symbolsArray,
            isFavorite: true,
          },
        },
      })

      if (data?.upsertFavoriteSymbol?.status === 'success') {
        toast.success(t('toast.addFavoriteSuccess'))
        onAddSuccess?.()
      } else {
        toast.error(t('common.error'))
      }
    } catch (err: any) {
      console.error('Add to favorites error:', err)
      toast.error(err[0]?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [selectedSymbols, onAddSuccess, t])

  if (!activeWallet.isConnected)
    return (
      <div className="mt-[124px]">
        <ButtonConnectWallet />
      </div>
    )

  if (contracts.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-[40px] py-0 w-full mt-3 h-full overflow-auto">
      {/* 2列网格布局 */}
      <div className="flex flex-col gap-[12px] w-full">
        {/* 每行2个卡片 */}
        {Array.from({ length: Math.ceil(contracts.length / 2) }).map((_, rowIndex) => {
          const startIndex = rowIndex * 2
          const rowContracts = contracts.slice(startIndex, startIndex + 2)

          return (
            <div key={rowIndex} className="flex gap-[12px] w-full">
              {rowContracts.map((contract) => {
                const isSelected = selectedSymbols.has(contract.symbol)

                return (
                  <div
                    key={contract.symbol}
                    onClick={() => handleToggleSymbol(contract.symbol)}
                    className={cn(
                      'bg-[#101114] flex flex-1 flex-col gap-[4px] h-[56px]',
                      'items-start justify-center overflow-clip px-[12px] py-[16px]',
                      'rounded-[8px] cursor-pointer transition-all',
                      'hover:bg-[#18181d]',
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="flex items-end cursor-pointer"
                        onClick={(e) => handleNavigateToTrade(contract.symbol, e)}
                      >
                        <Text
                          text={`${contract.symbol}USDC`}
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
                      text={t('futuresDetails.common.perp')}
                      fontSize={12}
                      fontWeight="regular"
                      color="#605E68"
                      className="leading-[12px]"
                    />
                  </div>
                )
              })}
              {/* 如果是奇数个，最后一行填充空白 */}
              {rowContracts.length === 1 && <div className="flex-1" />}
            </div>
          )
        })}
      </div>

      {/* 一键添加按钮 */}
      <button
        onClick={handleAddToFavorites}
        disabled={loading || selectedSymbols.size === 0}
        className={cn(
          'bg-[#843bea] flex h-[44px] items-center justify-center',
          'px-[24px] py-[11px] rounded-[200px] w-full',
          'transition-all duration-300',
          'hover:opacity-90 active:scale-[0.98]',
          loading && 'opacity-70 cursor-not-allowed',
          selectedSymbols.size === 0 && 'opacity-30 cursor-not-allowed',
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

export default RecommendedContracts
