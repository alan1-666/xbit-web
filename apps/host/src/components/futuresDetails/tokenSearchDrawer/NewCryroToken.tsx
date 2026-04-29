import Text from '@/components/common/Text'
import { symbolDexClient } from '@/lib/gql/apollo-client'
import { GET_NEW_SYMBOLS } from '@/services/symbol.dex.service'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useHandleLogic from './hooks/useHandleLogic'
import SkeletonList from './SkeletonList'

const NewCryroToken = ({ isShowList }: { isShowList: boolean }) => {
  const navigate = useNavigate()
  const { saveToHistory } = useHandleLogic()
  const [loading, setLoading] = useState(false)
  const [popularSymbols, setPopularSymbols] = useState<string[]>([])

  const handleGetCategoryList = async () => {
    try {
      setLoading(true)
      const { data } = await symbolDexClient.query({
        query: GET_NEW_SYMBOLS,
        variables: {
          input: {
            number: 10,
          },
        },
      })
      setPopularSymbols(data?.getNewSymbol?.list || [])
    } catch (error) {
      console.error('Error fetching category list:', error)
    } finally {
      setLoading(false)
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
    <div className="mt-1.5 flex items-center gap-1.5 overflow-auto no-scrollbar">
      {loading ? (
        <SkeletonList />
      ) : (
        popularSymbols.map((item) => (
          <div
            key={item}
            className="relative px-6 py-2 bg-[#ECECED14] hover:bg-[#FFFFFF30] border border-gradient rounded-[6px] flex flex-col justify-center items-center cursor-pointer gap-1"
            onClick={() => handlePopularSearchClick(item)}
          >
            <div className="flex items-end gap-0.5">
              <Text text={item || ''} fontSize={14} fontWeight="medium" className="leading-[calc(1rem*(14/16))]" />
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
            {/* <div
              className={cn(
                'text-[calc(12rem/16)] text-[#FFFFFF80]',
                item?.changPxPercent === undefined || item?.changPxPercent >= 0 ? 'text-[#00FFB4]' : 'text-[#AB57FF]',
              )}
            >
              <span>{formatPercentage(item?.changPxPercent || 0, true)}</span>
            </div> */}
          </div>
        ))
      )}
    </div>
  )
}

export default NewCryroToken
