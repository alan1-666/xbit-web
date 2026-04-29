import Text from '@/components/common/Text'
import { IconEmpty, IconSpinner } from '@/components/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { ServiceConfig } from '@/lib/gql/service-config'
import { cn } from '@/lib/utils'
import { UPSERT_FAVORITE_SYMBOL } from '@/services/symbol.dex.service'
import { formatPercentage } from '@/utils/helpers'
import { t } from 'i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { IPRadioItem, RadioItem } from '../feature-toggles'
import { ISymbolList } from '../list-coin-crypto'
import '../style.css'
interface IPItemOptional extends IPRadioItem {
  symbolCoid: string
  presentChange: string
}

const ItemOptional = ({ symbolCoid, presentChange, ...props }: IPItemOptional) => {
  const navigate = useNavigate()
  const handleToTrade = (symbolCoid: string) => {
    navigate(`/futures/${symbolCoid}`)
  }
  const color = presentChange.includes('-') ? 'text-fall' : 'text-rise'
  return (
    <div className="cursor-pointer bg-[#ECECED14] rounded-[8px]" 
         onClick={(e) => {
            e.stopPropagation()
            props?.handleToggle?.(props.option.id)
          }}>
      <div className="p-2.5 relative z-2 size-full flex justify-between items-center">
        <div className="flex flex-col space-y-1.5">
            <div className="flex gap-0.5 items-end" onClick={(e) => {
              e.stopPropagation()
              handleToTrade(symbolCoid)
            }}>
            <Text text={symbolCoid} fontSize={15} fontWeight="medium" className="leading-[calc(15rem/16)]" />
            <Text text={'/'} fontSize={11} className="leading-[calc(13rem/16)] " color="#FFFFFF80" />
            <Text text={'USD'} fontSize={11} className="leading-[calc(11rem/16)]" color="#FFFFFF80" />
          </div>
          <span className={cn(color, "lining-nums text-[calc(12rem/16)]")}>{presentChange}</span>
        </div>

        <div className="cursor-pointer">
          <RadioItem option={props.option} selectedOptions={props.selectedOptions} />
        </div>
      </div>
    </div>
  )
}

interface OptionalProps {
  symbolsFavorite: ISymbolList[]
  isLoading?: boolean
  getFavoriteSymbols: () => Promise<void>
}

const Optional = ({ symbolsFavorite, getFavoriteSymbols, isLoading = false }: OptionalProps) => {
  const [loading, setLoading] = useState(false)

  const handleUpsertFavorite = async (symbol: string[], isFavorite: boolean) => {
    try {
      setLoading(true)
      const { data } = await symbolDexClient.mutate({
        mutation: UPSERT_FAVORITE_SYMBOL,
        variables: {
          input: {
            symbol,
            isFavorite,
          },
        },
      })

      if (data?.error) {
        console.error('Mutation error:', data.error)
        toast.error(t('common.error'), {
          duration: 3000,
        })
        return { success: false, error: data.error }
      }
      getFavoriteSymbols()

      return {
        success: data?.status || false,
        error: null,
      }
    } catch (err: any) {
      console.error('Network error:', err)
      toast.error(t(err[0].message), {
        duration: 3000,
      })
      return { success: false, error: 'Network error occurred' }
    } finally {
      setLoading(false)
    }
  }

  const transformedData = symbolsFavorite.map((item) => ({
    symbolCoid: item.symbol,
    presentChange: `${formatPercentage(item.changPxPercent)}`,
  }))

  // Create initial toggle states from symbolsFavorite
  const initialToggles = symbolsFavorite.reduce(
    (acc, item) => ({
      ...acc,
      [item.symbol]: false,
    }),
    {} as Record<string, boolean>,
  )

  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>(initialToggles)

  const handleChange = (id: string) => {
    setCheckedOptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (isLoading) {
    return (
      <div className="relative z-1 w-full pb-5">
        {/* Loading skeleton */}
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[63px] mb-1" />
        ))}
      </div>
    )
  }

  if (!isLoading) {
    if (!symbolsFavorite || symbolsFavorite.length === 0) {
      return (
        <div className="relative z-1 w-full p-2 pb-5">
          <div className="flex justify-center h-32 flex-col items-center">
            <IconEmpty />
            <span className="text-[#FFFFFF80] text-[0.75rem]">{t('history.nodata')}</span>
          </div>
        </div>
      )
    }
  }

  return (
    <div
      className="relative z-1 w-full pt-[12px] pb-5 overflow-auto"
      style={{
        maxHeight: 'calc(100vh - 160px)',
      }}
    >
      <div className="grid grid-cols-2 gap-2 z-1 max-w-md mx-auto">
        {transformedData.map((item) => (
          <ItemOptional
            handleToggle={handleChange}
            key={item.symbolCoid}
            option={{ id: item.symbolCoid, checked: checkedOptions[item.symbolCoid] || false }}
            selectedOptions={checkedOptions}
            symbolCoid={item.symbolCoid}
            presentChange={item.presentChange}
          />
        ))}
      </div>
      {/* 初始化，没有一个选中，点击全选 */}
      {Object.values(checkedOptions).every((isChecked) => !isChecked) ? (
        <div className={cn(
          "mt-6 purple-gradient !rounded-[50px] h-[calc(1rem*(44/16))] flex gap-1 bg-[#ECECED14] justify-center items-center px-4 mx-auto w-45",
          'cursor-pointer hover:scale-[101%] transition-all duration-300 '
        )} 
        onClick={() => {
          if (!ServiceConfig.token) {
            return toast.error(t('appSettings.loginRequired'))
          }
          const newCheckedOptions = Object.fromEntries(
            Object.keys(checkedOptions).map((key) => [key, true])
          )
          setCheckedOptions(newCheckedOptions)
          handleUpsertFavorite(Object.keys(newCheckedOptions), true)
        }}>
          <Text text={t('futuresMarket.allSelect')} fontSize={14} fontWeight="medium" />
        </div>
      ) :
      (<div
        className={cn(
          `mt-6  purple-gradient !rounded-[50px] h-[calc(1rem*(44/16))] flex gap-1 bg-[#ECECED14] justify-center items-center px-4 mx-auto w-45`,
          'cursor-pointer hover:scale-[101%] transition-all duration-300 '
          // Object.values(checkedOptions).some((isChecked) => isChecked)
          //   ? 'cursor-pointer hover:scale-[101%] transition-all duration-300 '
          //   : 'cursor-not-allowed opacity-50',
        )}
        onClick={() => {
          if (!ServiceConfig.token) {
            return toast.error(t('appSettings.loginRequired'))
          }
        const selectedSymbol = Object.keys(checkedOptions).filter((key) => checkedOptions[key])
        if (selectedSymbol.length !== 0 && ServiceConfig.token) {
          handleUpsertFavorite(selectedSymbol, true)
        }
         
        
        }}
      >
        {!loading ? (
          <Text text={t('futuresMarket.addAll')} fontSize={14} fontWeight="medium" />
        ) : (
          <div className="px-2.5 py-2">
            <IconSpinner className="size-4 animate-spin mx-auto" />
          </div>
        )}
      </div>
    ) }
    </div>
  )
}

export default Optional
