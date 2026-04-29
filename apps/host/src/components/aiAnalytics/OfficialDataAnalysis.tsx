import { ReactNode, useState } from 'react'
import { CopyButton } from '../common/copy-button'
import { cn, getPath } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useGetTokenOfficialInformation } from '@hooks/useGetTokenOfficialInformation.ts'
import { formatTimestamp, getFirstAndLastFiveChars } from '@/utils/helpers.ts'
import dayjs from 'dayjs'
import { fShortenNumber } from '@/lib/number.ts'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useApolloClient } from '@apollo/client'
import { getManyToken } from '@services/tokens.service.ts'
import { APP_PATH } from '@/lib/constant.ts'
import { TokenDetail } from '@/@generated/gql/graphql-meme2.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'

interface OfficialItemProps {
  title: string
  content: string | ReactNode
  subContent?: ReactNode
  contentClassName?: string
}

const formatDatetime = (dateStr: string) => {
  const date = dayjs(dateStr)
  if (date.isValid() && date.unix() > 0) {
    return date.format('YYYY/MM/DD HH:mm')
  }
  return '--'
}

const OfficialItem = ({ title, content, contentClassName, subContent }: OfficialItemProps) => {
  return (
    <div className="flex flex-col py-2.5">
      <span className="text-[#605e68] font-[330] text-[calc(1rem*(12/16))] leading-none">{title}</span>
      <div className="flex gap-1 items-center mt-2">
        <span className={cn('text-[#FFFFFF] font-[380] text-[calc(13rem/16)] leading-none', contentClassName)}>
          {content}
        </span>
        {subContent}
      </div>
    </div>
  )
}

const useTokenInfo = (address: string) => {
  const client = useApolloClient()
  const { data } = useQuery({
    queryKey: ['ai_token_info', address],
    queryFn: async () => {
      const res = await client.query({
        query: getManyToken,
        variables: {
          input: {
            chainId: 501424,
            tokens: [address],
          },
        },
      })
      return res.data.getManyToken[0]
    },
    enabled: !!address,
  })
  return data
}

interface OfficialDataAnalysisProps {
  tokenData?: TokenDetail
}

const OfficialDataAnalysis = (props: OfficialDataAnalysisProps) => {
  const { tokenData } = props
  const { t } = useTranslation()
  const { chain = 'sol', address: currentToken = '' } = useParams()
  const chainId = useActiveChainId()
  const tokenInfo = useTokenInfo(currentToken)

  const [expanded, setExpanded] = useState(false)

  const { data } = useGetTokenOfficialInformation({ address: currentToken ?? '', chainId })

  const onExpanding = () => {
    setExpanded(true)
  }

  // const twitterInfo = useMemo(() => {
  //   if (!data || !data.socials) return undefined
  //   return data.socials.find((social) => social.type === 'twitter')
  // }, [data])

  return (
    <div className="p-[1px] rounded-[8px] mx-2.5 mt-4">
      <div className={cn('relative bg-[#18181d] rounded-[8px] pb-2')}>
        <div className="px-2.5 py-2 relative">
          <div className="absolute top-3.5 left-0 w-[2px] h-3 bg-[#6A2AE0] rounded-r-[2px]"></div>
          <span className="text-[#FFFFFF] text-[calc(1rem*(15/16))] leading-[calc(1rem*(15/16))] app-font-medium">
            {t('ai.officialTitle')}
          </span>
        </div>
        <div className="px-2.5">
          <div className="grid grid-cols-2 border-b-[0.5px] pb-2 border-[#ECECED14]">
            <OfficialItem title={t('ai.launchDate')} content={formatTimestamp(data?.openingDate)} />
            <OfficialItem
              title={t('ai.devHistory')}
              contentClassName="text-[#1890FF]"
              content={
                <>
                  {tokenData?.numberMigratedTokenByDev && tokenData?.numberMigratedTokenByDev > 0 ? (
                    <Link
                      to={getPath(APP_PATH.MEME_DEV_PROJECTS, {
                        address: currentToken ?? '',
                        chain: chain,
                      })}
                      state={{ from: window.location.pathname + window.location.search }}
                      className="text-[#1890FF] hover:underline"
                    >
                      {t('ai.relatedProjects')}
                    </Link>
                  ) : (
                    '--'
                  )}
                </>
              }
            />
            <OfficialItem
              title={t('ai.contract')}
              content={data?.contractAddress ? getFirstAndLastFiveChars(data?.contractAddress) : '--'}
              subContent={<CopyButton text={data?.contractAddress ?? ''} className="!size-3.5" />}
            />
            <OfficialItem title={t('ai.poolTime')} content={formatDatetime(data?.addPoolTime)} />
            <OfficialItem
              title={t('ai.poolAddress')}
              content={data?.poolAddress ? getFirstAndLastFiveChars(data?.poolAddress ?? '--') : '--'}
              subContent={
                data?.poolAddress ? <CopyButton text={data?.poolAddress ?? ''} className="!size-3.5" /> : null
              }
            />
            <OfficialItem
              title={t('ai.devAddress')}
              content={getFirstAndLastFiveChars(data?.projectPartyDevAddress || '--')}
              subContent={
                data?.projectPartyDevAddress ? (
                  <CopyButton text={data?.projectPartyDevAddress ?? ''} className="!size-3.5" />
                ) : null
              }
            />
            <OfficialItem
              title={t('ai.walletBalance')}
              content={
                data?.balanceProjectPartyDev
                  ? `${fShortenNumber(data?.balanceProjectPartyDev ? +data.balanceProjectPartyDev : 0)} ${tokenInfo?.symbol ?? ''}`
                  : '--'
              }
            />
          </div>
          {/*<div className="grid grid-cols-2 pb-2">*/}
          {/*  <OfficialItem*/}
          {/*    title={t('ai.twitterRegistrationTime')}*/}
          {/*    content={twitterInfo?.registrationDate ? dayjs(twitterInfo?.registrationDate).format('YYYY/MM/DD') : '--'}*/}
          {/*  />*/}
          {/*  <OfficialItem*/}
          {/*    title={t('ai.avgViews')}*/}
          {/*    content={twitterInfo?.averageViewPerPost ? fShortenNumber(twitterInfo.averageViewPerPost) : '--'}*/}
          {/*  />*/}
          {/*  <OfficialItem*/}
          {/*    title={t('ai.followers')}*/}
          {/*    content={twitterInfo?.numberFollowers ? fShortenNumber(+twitterInfo.numberFollowers) : '--'}*/}
          {/*    subContent={*/}
          {/*      twitterInfo?.numberFollowers ? (*/}
          {/*        <span className="text-xs text-[#FFFFFFB2]">({dayjs().format('YYYY/MM/DD')})</span>*/}
          {/*      ) : null*/}
          {/*    }*/}
          {/*  />*/}
          {/*  <OfficialItem*/}
          {/*    title={t('ai.avgComments')}*/}
          {/*    content={twitterInfo?.averageCommentsPerPost ? fShortenNumber(twitterInfo.averageCommentsPerPost) : '--'}*/}
          {/*  />*/}
          {/*  <OfficialItem*/}
          {/*    title={t('ai.totalPosts')}*/}
          {/*    content={twitterInfo?.numberPosts ? fShortenNumber(+twitterInfo.numberPosts) : '--'}*/}
          {/*  />*/}
          {/*  <OfficialItem*/}
          {/*    title={t('ai.avgLikes')}*/}
          {/*    content={twitterInfo?.averageLikesPerPost ? fShortenNumber(twitterInfo.averageLikesPerPost) : '--'}*/}
          {/*  />*/}
          {/*  <OfficialItem title={t('ai.firstPostTime')} content="--" />*/}
          {/*  <OfficialItem*/}
          {/*    title={t('ai.avgRetweets')}*/}
          {/*    content={*/}
          {/*      twitterInfo?.averageForwardingPerPost ? fShortenNumber(twitterInfo.averageForwardingPerPost) : '--'*/}
          {/*    }*/}
          {/*  />*/}
          {/*</div>*/}
          <div
            className={cn(
              'py-2 gap-1 items-center justify-center cursor-pointer rounded-md hidden',
              expanded && 'opacity-0 cursor-auto',
            )}
            onClick={onExpanding}
          >
            <span className="text-[#FFFFFFB2] text-[calc(1rem*(11/16))]">{t('ai.officialExpand')}</span>
            <img src="/images/tokenDetail/icon-load-more.svg" className="size-3.5" alt="load more" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfficialDataAnalysis
