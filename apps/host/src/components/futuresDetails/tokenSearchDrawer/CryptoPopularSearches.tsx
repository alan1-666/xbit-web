import Text from '@/components/common/Text'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { GET_POPULAR_SYMBOLS } from '@/services/symbol.dex.service'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useHandleLogic from './hooks/useHandleLogic'
import SkeletonList from './SkeletonList'
import { cn } from '@/lib/utils'
import { ISymbolList } from '@/pages/futures-market/type'
import { formatPercentage } from '@/utils/helpers'

const CryptoPopularSearches = ({ isShowList }: { isShowList: boolean }) => {
  const navigate = useNavigate()
  const { saveToHistory } = useHandleLogic()
  const [loading, setLoading] = useState(false)
  const [popularSymbols, setPopularSymbols] = useState<ISymbolList[]>([])

  const handleGetCategoryList = async () => {
    try {
      setLoading(true)
      const { data } = await symbolDexClient.query({
        query: GET_POPULAR_SYMBOLS,
        variables: {
          input: {
            number: 10,
          },
        },
      })
      setPopularSymbols(data?.getPopularSymbol?.list || [])
    } catch (error) {
      console.error('Error fetching category list:', error)
    } finally {
      setLoading(false)
      // setIsLoadingCategory(false)
    }
  }

  const handlePopularSearchClick = (item: string) => {
    saveToHistory({ address: item, name: item, chainId: 0, logo: '' }, 'dex')
    navigate(`/futures/${item}`)
  }

  useEffect(() => {
    if (isShowList && popularSymbols.length === 0) {
      handleGetCategoryList()
    }
  }, [isShowList, popularSymbols])

  return (
    <div className="flex items-start gap-1.5 overflow-x-auto no-scrollbar pt-4 -mt-1.5">
      {loading ? (
        <SkeletonList />
      ) : (
        popularSymbols.map((item) => (
          <div
            key={item.symbol}
            className="relative px-6 py-2 bg-[#ECECED14] hover:bg-[#FFFFFF30] border border-gradient rounded-[6px] flex flex-col justify-center items-center cursor-pointer gap-1"
            onClick={() => handlePopularSearchClick(item.symbol)}
          >
            <img src="/images/icons/icon-hot.svg" className="size-4 mr-1 absolute -top-1.5 -right-2" alt="" />

            <div className="flex items-end gap-0.5">
              <Text text={item.symbol || ''} fontSize={14} fontWeight="medium" className="leading-[calc(1rem*(14/16))]" />
              <Text
                text="/"
                fontSize={9}
                fontWeight="light"
                color="#FFFFFF80"
                className="leading-[calc(1rem*(12/16))]"
              />
              <Text
                text="USDC"
                fontSize={12}
                fontWeight="light"
                color="#FFFFFF80"
                className="leading-[calc(1rem*(12/16))]"
              />
            </div>
            <div className="text-[calc(9rem/16)] text-[#FFFFFF80]">合约</div>
            <div
              className={cn(
                'text-[calc(12rem/16)] text-[#FFFFFF80]',
                item?.changPxPercent === undefined || item?.changPxPercent >= 0 ? 'text-[#00FFB4]' : 'text-[#AB57FF]',
              )}
            >
              <span>{formatPercentage(item?.changPxPercent || 0, true)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default CryptoPopularSearches
