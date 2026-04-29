import { useTranslation } from 'react-i18next'
import Container from '@components/common/Container.tsx'
import FollowTypeDropdown from '@components/listCoin/filter/FollowTypeDropdown.tsx'
import { FollowingWalletInfo, SmartMoneyDto, SmartMoneySortType } from '@/@generated/gql/graphql-future.ts'
import { SkeletonList } from '@components/ui/skeleton.tsx'
import CopyTradeCard from '@/components/listCoin/card/TopTraderCard'
import { useEffect, useRef, useState } from 'react'
import { IconEmpty } from '@components/icon'
import ImportExportFollowingWallet from '@components/monitoring/ImportExportFollowingWallet.tsx'
import AddNewFollowingWallet from '@components/monitoring/AddNewFollowingWallet.tsx'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { getFollowingSmartMoney } from '@services/smartMoney.service.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { Link, useSearchParams } from 'react-router-dom'
import { ServiceConfig } from '@/lib/gql/service-config.ts'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { ButtonConnectWallet } from '@components/common/ButtonConnectWallet.tsx'
import { LIMIT_PER_PAGE, REFETCH_WALLETS_FOLLOWING, SMART_MONEY_ALLOWED_CHAINS } from '@const/smartMoney.ts'
import SwitchChains from '@components/header/switch-chains.tsx'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import eventBus from '@/lib/eventBus.ts'
import { Loading } from '@components/common/Loading.tsx'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { activeChainToChainIds } from '@/utils/chain.ts'

type ListCoinProps = {
  sortType: SmartMoneySortType
}

const loadFirstPageFromLocalStorage = () => {
  const storedData = localStorage.getItem('smartMoneyList')
  if (storedData) {
    try {
      return JSON.parse(storedData)
    } catch (error) {
      console.error('Error parsing smartMoneyList from localStorage:', error)
    }
  }
  return []
}

const ListCoin = ({ sortType }: ListCoinProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const lastSmartMoneyRef = useRef<HTMLDivElement | null>(null)

  const activeChain = useActiveChain()
  const chainId = activeChainToChainIds(activeChain)
  const [searchParams] = useSearchParams()
  const isNotSupportNetwork = searchParams?.get('isNotSupportNetwork') === 'true'

  const {
    data,
    isLoading: loading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['getFollowingSmartMoneys', sortType, ServiceConfig.token],
    initialPageParam: 1,
    initialData: {
      pages: [
        {
          getFollowingSmartMoneys: loadFirstPageFromLocalStorage(),
        },
      ],
      pageParams: [1],
    },
    queryFn: async ({ pageParam = 1 }) => {
      if (!ServiceConfig.token) return { getFollowingSmartMoneys: [] }
      const { data } = await futureClient.query({
        query: getFollowingSmartMoney,
        variables: {
          filter: {
            page: pageParam,
            chain: mappingTypeChain(activeChain),
            sortType,
            limit: LIMIT_PER_PAGE,
          },
        },
      })
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.getFollowingSmartMoneys.length >= 20 ? allPages.length + 1 : undefined
    },
  })

  const updateCacheData = (address: string, newName: string) => {
    queryClient.setQueryData(['getFollowingSmartMoneys', sortType, ServiceConfig.token], (oldData: any) => {
      if (!oldData) return oldData
      const newPages = oldData.pages.map((page: { getFollowingSmartMoneys: SmartMoneyDto[] }) => {
        const newItems = page.getFollowingSmartMoneys.map((item: SmartMoneyDto) => {
          if (item.address === address) {
            return {
              ...item,
              name: newName,
            }
          }
          return item
        })
        return {
          ...page,
          getFollowingSmartMoneys: newItems,
        }
      })
      return {
        ...oldData,
        pages: newPages,
      }
    })
  }

  useEffect(() => {
    const firstPage = data?.pages[0]
    if (!firstPage) return
    // save the first page data to local storage
    localStorage.setItem('smartMoneyList', JSON.stringify(firstPage.getFollowingSmartMoneys))
  }, [data])

  const listFollowing = (data?.pages.flatMap((page) => page.getFollowingSmartMoneys) as SmartMoneyDto[]) ?? []

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loading && !isFetchingNextPage) {
          // Load next page
          fetchNextPage().catch(console.error)
        }
      },
      { threshold: 0.5 },
    )
    if (lastSmartMoneyRef.current) {
      observer.observe(lastSmartMoneyRef.current)
    }
    return () => {
      if (observer) {
        observer.disconnect()
      }
    }
  }, [loading])

  useEffect(() => {
    eventBus.on(REFETCH_WALLETS_FOLLOWING, () => {
      refetch().catch(console.error)
    })
    return () => {
      eventBus.remove(REFETCH_WALLETS_FOLLOWING)
    }
  }, [])

  const activeWallet = useActiveWallet()

  const handleRenderList = () => {
    if (!activeWallet.isConnected) {
      return (
        <div className="pt-[146px]">
          <ButtonConnectWallet />
        </div>
      )
    }

    if (!SMART_MONEY_ALLOWED_CHAINS.includes(activeChain) || isNotSupportNetwork) {
      return (
        <Container className="mt-[10px] h-40 pt-[100px]">
          <div className="flex items-center gap-2 flex-col justify-center text-[14px] text-[#999999] mt-10">
            <span>{t('orderForm.status.NETWORK_UNSUPPORT')}</span>
            <SwitchChains isNotSupportChainBtn />
          </div>
        </Container>
      )
    }

    if (loading) {
      return <SkeletonList count={10} classNameItem="h-[97px]" />
    }

    if (listFollowing.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center pt-[146px]">
          <IconEmpty />
          <span className="text-[#FFFFFF80] text-[0.75rem] text-center">{t('following.empty')}</span>
          <Link
            to={'/meme/smart-money?walletType=SmartMoney&tab=topTalents'}
            className="purple-btn-gradient !text-white !max-h-[42px] mt-4 text-[calc(1rem*(14/16))] leading-[1] font-[500] tracking-[calc(1rem*(0.5/16))] p-[13px_12.5px] rounded-[50px]"
          >
            {t('emptyFollowing.cta')}
          </Link>
        </div>
      )
    }

    return (
      <>
        {listFollowing.map((item, index) => {
          if (index === listFollowing?.length - 1) {
            return (
              <div key={item.address} ref={lastSmartMoneyRef}>
                <CopyTradeCard
                  key={item.address}
                  {...(item as any)}
                  isSmartMoneyFormatName
                  defaultCollect
                  referrer="monitoring"
                  showFavoriteIcon={false}
                  currencyIcon={item?.avatar}
                  walletName={item.info?.walletName}
                  twitterName={item.info?.twitterName}
                  classNameContainer="px-2 py-0.5 rounded-[6px] border-[0.5px] border-solid border-[rgba(236, 236, 237, 0.9)] cursor-pointer mb-[5px] bg-[#0F0F0F]"
                  onChangeNameSuccess={(newName: string) => updateCacheData(item.address, newName)}
                />
              </div>
            )
          }
          return (
            <CopyTradeCard
              key={item.address}
              {...(item as any)}
              isSmartMoneyFormatName
              defaultCollect
              referrer="monitoring"
              currencyIcon={item?.avatar}
              classNameContainer="px-2 py-0.5 rounded-[6px] border-[0.5px] border-solid border-[rgba(236, 236, 237, 0.9)] cursor-pointer mb-[5px] bg-[#0F0F0F]"
              showFavoriteIcon={false}
              walletName={item.info?.walletName}
              twitterName={item.info?.twitterName}
              onChangeNameSuccess={(newName: string) => updateCacheData(item.address, newName)}
            />
          )
        })}
        <div ref={lastSmartMoneyRef} className="readonly"></div>
        {hasNextPage && (
          <div className="h-[89px] w-full flex justify-center items-center">
            <Loading />
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-[5px] h-full no-scrollbar">{handleRenderList()}</div>
    </>
  )
}

type TabSmartMoneyProps = {
  listFollowing: FollowingWalletInfo[]
}

const TabSmartMoney = ({ listFollowing }: TabSmartMoneyProps) => {
  const { t } = useTranslation()
  const [sortType, setSortType] = useState<SmartMoneySortType>(SmartMoneySortType.FollowTime)
  const [openImportExport, setOpenImportExport] = useState(false)
  const [openAddNewFollowing, setOpenAddNewFollowing] = useState(false)
  const activeWallet = useSelector(_activeWallet)

  return (
    <Container className="w-full max-h-full flex-1 flex flex-col relative">
      {activeWallet.isConnected && (
        <div className="flex items-center justify-between py-2.5 sticky top-[50px] bg-[#0A0A0A] z-10">
          <FollowTypeDropdown sortType={sortType} setSortType={setSortType} />
          <div className="items-center gap-2 flex">
            <button
              className="h-7 px-3 font-normal text-[13px] text-white/80 bg-[#ECECED14] rounded-md"
              onClick={() => setOpenImportExport(true)}
            >
              {t('followingWallet.import')}/{t('followingWallet.export')}
            </button>
            <button
              className="h-7 px-3 font-normal text-[13px] text-[#00FFB4] bg-[#ECECED14] rounded-md"
              onClick={() => setOpenAddNewFollowing(true)}
            >
              + {t('followingWallet.addWallet')}
            </button>
          </div>
        </div>
      )}
      <ListCoin sortType={sortType} />
      <ImportExportFollowingWallet
        open={openImportExport}
        setOpen={setOpenImportExport}
        listFollowing={listFollowing}
      />
      <AddNewFollowingWallet open={openAddNewFollowing} setOpen={setOpenAddNewFollowing} />
    </Container>
  )
}

export default TabSmartMoney
