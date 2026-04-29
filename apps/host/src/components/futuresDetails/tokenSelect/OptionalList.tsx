import { cn } from '@/lib/utils'
import { ISymbolList } from '@/redux/modules/symbolList.slide'
import { TokenTrending } from '@/types/token'
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TokenSearchDrawerType, useGetPredictedFundings } from '.'
import ContractList from './ContractList'
import { mergeFundingRateToSymbolList } from '@/utils/helpers'

const OptionalList = ({
  search,
  symbolsFavorite,
  favoriteTokens,
  type,
  allowShowList,
  isLoadingFavorite,
  setOpen,
  setSymbolsFavorite,
  setIsFavoriteChange,
  isfuturesSearch,
  isHidenFuturesTab,
}: {
  search: string
  symbolsFavorite: ISymbolList[]
  favoriteTokens: TokenTrending[]
  type: TokenSearchDrawerType
  allowShowList?: boolean
  isLoadingFavorite?: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  setIsFavoriteChange: Dispatch<SetStateAction<boolean>>
  setSymbolsFavorite: (value: SetStateAction<ISymbolList[]>) => void
  setFavoriteTokens: Dispatch<SetStateAction<TokenTrending[]>>
  isfuturesSearch?: boolean
  isHidenFuturesTab?: boolean
}) => {
  const { t } = useTranslation()
  const { isPredictedFundingsLoading, predictedFundingsData } = useGetPredictedFundings()
  const headerTabs = [
    {
      value: '合约',
      label: t('tokenSearchDrawer.tabs.contracts'),
    },
    {
      value: 'Meme',
      label: t('tokenSearchDrawer.tabs.meme'),
    },
  ]

  const [activeHeader, setActiveHeader] = useState(headerTabs[0].value)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (count >= 4) {
      return
    }

    if (type === TokenSearchDrawerType.MEME || type === TokenSearchDrawerType.XSTOCKS) {
      setActiveHeader(headerTabs[1].value)
    } else {
      if (symbolsFavorite.length === 0) {
        setActiveHeader(headerTabs[1].value)
      } else {
        setActiveHeader(headerTabs[0].value)
      }
    }
  }, [symbolsFavorite, favoriteTokens, type, count])

  const loadingState = useMemo(
    () => isLoadingFavorite || isPredictedFundingsLoading,
    [isLoadingFavorite, isPredictedFundingsLoading],
  )

  const mergeArr = useMemo(() => {
    if (!predictedFundingsData) {
      return symbolsFavorite
    }
    return mergeFundingRateToSymbolList(predictedFundingsData, symbolsFavorite)
  }, [predictedFundingsData, symbolsFavorite])

  useEffect(() => {
    setCount((prev) => prev + 1)
  }, [symbolsFavorite, favoriteTokens, type])

  const handleRenderTab = useCallback(
    (tab: string) => {
      switch (tab) {
        case headerTabs[0].value:
          return (
            <ContractList
              symbolDataInitial={mergeArr}
              search={search}
              allowShowList={allowShowList}
              isFavorite={true}
              isLoading={loadingState}
              setOpen={setOpen}
              setIsFavoriteChange={setIsFavoriteChange}
              setSymbolsFavorite={setSymbolsFavorite}
              isfuturesSearch={isfuturesSearch}
              cusTomMaxHeightPC="450px"
            />
          )
        default:
          return (
            <ContractList
              symbolDataInitial={symbolsFavorite}
              search={search}
              allowShowList={allowShowList}
              isFavorite={true}
              isLoading={loadingState}
              setOpen={setOpen}
              setIsFavoriteChange={setIsFavoriteChange}
              setSymbolsFavorite={setSymbolsFavorite}
              isfuturesSearch={isfuturesSearch}
              cusTomMaxHeightPC="450px"
            />
          )
      }
    },
    [mergeArr, favoriteTokens, search, allowShowList, loadingState],
  )

  return (
    <div className="relative">
      {!isHidenFuturesTab && (
        <div className=" flex gap-1.5 items-center pt-3 px-2">
          {headerTabs.map(({ value, label }) => (
            <div
              className={cn(
                'text-[calc(1rem*(12/16))] px-3 py-1 border-[0.5px] border-[#ECECED14] rounded-full cursor-pointer',
                value === activeHeader
                  ? 'text-[#FFFFFF] bg-[#ECECED14] text-[13px] font-[500]'
                  : 'text-[#FFFFFF80] text-[13px] font-[400]',
                value === headerTabs[1].value && favoriteTokens.length === 0 && 'hidden',
                value === headerTabs[0].value && symbolsFavorite.length === 0 && 'hidden',
              )}
              onClick={() => setActiveHeader(value)}
              key={value}
            >
              {label}
            </div>
          ))}
        </div>
      )}
      <div className="w-full overflow-hidden">{handleRenderTab(activeHeader)}</div>
    </div>
  )
}

export default memo(OptionalList)
