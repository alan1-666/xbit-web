import { useTranslation } from 'react-i18next'
import { IconChevronRight, IconWarningCircleSolid } from '../icon'
import { useQuery } from '@tanstack/react-query'
import { useApolloClient } from '@apollo/client'
import { getOnChainDataAnalytic } from '@services/ai.service.ts'
import { formatPercentage } from '@/utils/helpers.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { useSubscription } from '@/lib/mqtt'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { useNavigate } from 'react-router-dom'
import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'

// const numberFormatter = new Intl.NumberFormat('en-US', {
//   style: 'decimal',
//   maximumSignificantDigits: 2,
// })

// const formatPercentage = (value: number) => {
//   if (value === undefined || value === null) return '0%'
//   if (value >= 100) return '100%'
//   return `${numberFormatter.format(value)}%`
// }

const useAnalysis = (address: string | undefined, chainId: number | undefined) => {
  const client = useApolloClient()
  return useQuery({
    queryKey: ['onChainAnalytics', address, chainId],
    queryFn: async () => {
      const res = await client.query({
        query: getOnChainDataAnalytic,
        variables: {
          input: {
            address: address!,
            chainId: chainId!,
          },
        },
      })
      return res.data.getOnChainDataAnalytic
    },
    enabled: !!address && !!chainId,
  })
}

const useRealtimeInsiderHolding = (address: string | undefined) => {
  const [sniperPercentage, setSniperPercentage] = useState<number | undefined>(undefined)
  const activeChainId = useActiveChainId()
  const { message } = useSubscription(`public/meme/token_info/${activeChainId}/${address}`, {
    shouldSkip: !address,
  })

  useEffect(() => {
    const msg = message?.message?.toString()
    if (!msg || !message?.topic) return
    const data = JSON.parse(msg)
    let sniper: number | undefined = undefined
    // let tokenInfo: any
    const isArray = Array.isArray(data)
    if (isArray) {
      data.forEach((item: any) => {
        if (item.sniperPercentage !== undefined) {
          sniper = item.sniperPercentage
        }
      })
    } else {
      sniper = data.sniperPercentage
    }
    if (sniper !== undefined) {
      setSniperPercentage(sniper)
    }
  }, [message])

  useEffect(() => {
    setSniperPercentage(undefined)
  }, [address])

  return sniperPercentage
}

export interface OnChainAnalyticsProps {
  address: string | undefined
  tokenData?: TokenDetail
}

const calculateRelatedWallets = (linkedWallets: number, totalHolders: number) => {
  if (totalHolders === 0) return '0%'
  if (linkedWallets >= totalHolders) return '100%'
  const percentage = (linkedWallets * 100) / totalHolders
  return formatPercentage(percentage)
}

type DrawerContent = {
  title: string | ReactNode
  content: string | ReactNode
}

const OnChainAnalytics = (props: OnChainAnalyticsProps) => {
  const { address } = props
  const { t } = useTranslation()
  const navigate = useNavigate()
  const chainId = useActiveChainId()

  const { data, isLoading } = useAnalysis(address, chainId)
  // const navigate = useNavigate()
  const [showHint, setShowHint] = useState<boolean>(false)
  // const [description, setDescription] = useState('')
  const [drawerContent, setDrawerContent] = useState<DrawerContent>()
  const realtimeInsiderHolding = useRealtimeInsiderHolding(address)

  const insiderHolding = useMemo(() => {
    if (realtimeInsiderHolding) return realtimeInsiderHolding
    if (data?.insiderPercentage) return data.insiderPercentage
    return 0
  }, [data, realtimeInsiderHolding])

  const analyticsData = [
    // {
    //   label: t('ai.twitterChanges'),
    //   value: data?.twitterNameChangeCount ?? 0,
    //   icon: <IconChevronRight className="size-2.5" />,
    //   onClick: () => {
    //     setShowHint(true)
    //     setDrawerContent({
    //       title: (
    //         <div className="size-11 p-2.5 bg-[#EC46991A] rounded-full">
    //           <IconWarning />
    //         </div>
    //       ),
    //       content: (
    //         <div>
    //           {data?.twitterNameChangeCount && data?.twitterNameChangeCount > 0 ? (
    //             <>
    //               <div className="text-[calc(18rem/16)]">
    //                 {t('ai.twitterNameChangeCountDescription', { count: data?.twitterNameChangeCount ?? 0 })}
    //               </div>
    //               <div className="text-[calc(14rem/16)] mt-2">{/*  TODO: Fill twitter names */}</div>
    //             </>
    //           ) : (
    //             <div className="text-[calc(14rem/16)]">{t('ai.twitterNameNoChangeDescription')}</div>
    //           )}
    //         </div>
    //       ),
    //     })
    //   },
    // },
    {
      label: t('ai.insiderRatio'),
      value: formatPercentage(insiderHolding * 100),
      icon: <IconWarningCircleSolid className="size-2.5" />,
      onClick: () => {
        setShowHint(true)
        setDrawerContent({
          title: t('ai.insiderRatio'),
          content: t('ai.insiderRatioDescription'),
        })
      },
    },
    {
      label: t('ai.relatedWallets'),
      value: data
        ? `${data.numberOfLinkedWallets} (${calculateRelatedWallets(data.numberOfLinkedWallets, data.numberOfHolder)})`
        : '0%',
      icon: <IconWarningCircleSolid className="size-2.5" />,
      onClick: () => {
        setShowHint(true)
        setDrawerContent({
          title: t('ai.relatedWallets'),
          content: t('ai.relatedWalletsDescription'),
        })
      },
    },
    {
      label: t('ai.devStartups'),
      value: data?.numberOfDevProjectsLaunched ?? 0,
      icon: <IconChevronRight className="size-2.5" />,
      onClick: () => {
        if (!data?.numberOfDevProjectsLaunched || data?.numberOfDevProjectsLaunched < 1) return
        const currentPath = window.location.pathname
        const search = window.location.search
        const devProjectsPath = currentPath + '/dev-projects'
        navigate(devProjectsPath, { state: { from: `${currentPath}${search}` } })
      },
    },
    // {
    //   label: t('ai.twitterCreatedAt'),
    //   value: data?.twitterAccountCreationDate ? dayjs(data.twitterAccountCreationDate).format('YYYY/MM/DD') : '--',
    // },
    {
      label: t('ai.devHoldRatio'),
      value: data?.devTokenHoldingPercentage ? formatPercentage(data.devTokenHoldingPercentage * 100) : '0%',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <span className="text-sm app-font-medium">{t('ai.onChainTitle')}</span>
      <div className="mt-[11px] grid grid-cols-2 gap-1.5">
        {analyticsData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center bg-[#18181d] rounded-md py-[10px] px-1 text-[calc(1rem*(11/16))] leading-[calc(1rem*(11/16))]"
          >
            <div className="flex items-center justify-center gap-1 mb-1.5 cursor-pointer" onClick={item.onClick}>
              <span className="text-[#908e98] text-[12px] font-[330] leading-none">{item.label}</span>
              {item?.icon}
            </div>
            <span className="text-[#FFFFFF] text-[11px] font-[330] leading-none">{item.value}</span>
          </div>
        ))}
      </div>
      {/*<XModal showModal={showHint} setShowModal={setShowHint} description={description} showCloseButton={false} />*/}
      <AppDrawer
        setOpen={setShowHint}
        open={showHint}
        title={drawerContent?.title}
        drawerContent={
          <div className="pb-6">
            <div className="text-[calc(13rem/16)]">{drawerContent?.content}</div>
          </div>
        }
      ></AppDrawer>
    </div>
  )
}

export default OnChainAnalytics
