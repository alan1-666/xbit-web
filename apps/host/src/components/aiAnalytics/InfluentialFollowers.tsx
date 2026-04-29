import { IconChevronRight } from '../icon'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client'
import { getListInfluentialTwitterFollowers } from '@services/ai.service.ts'
import { Skeleton } from '@components/ui/skeleton.tsx'
import { fShortenNumber } from '@/lib/number.ts'
import { useMemo } from 'react'
import { EmptyList } from '@components/discover/EmptyList.tsx'

// const followers = [
//   {
//     name: 'Donald J. Trump',
//     username: '@realDonaldTrump',
//     avatar: '/images/tokenDetail/trump.webp',
//     followers: '20.34K',
//   },
//   {
//     name: 'Elon Musk',
//     username: '@pulgypegen',
//     avatar: '/images/tokenDetail/trump.webp',
//     followers: '20.34K',
//   },
//   {
//     name: 'Alejandro Fargosi',
//     username: '@fargosi',
//     avatar: '/images/tokenDetail/trump.webp',
//     followers: '20.34K',
//   },
//   {
//     name: 'Eric Daugherty',
//     username: '@pulgypegen',
//     avatar: '/images/tokenDetail/trump.webp',
//     followers: '20.34K',
//   },
//   {
//     name: '弗洛伊德',
//     username: '@pulgypegen',
//     avatar: '/images/tokenDetail/trump.webp',
//     followers: '20.34K',
//   },
// ]

export interface InfluentialFollowersProps {
  address?: string
}

export default function InfluentialFollowers(props: InfluentialFollowersProps) {
  const { address } = props
  const { t } = useTranslation()

  const { data, loading } = useQuery(getListInfluentialTwitterFollowers, {
    variables: {
      input: {
        address: address!,
      },
    },
    skip: !address,
  })

  const followers = useMemo(() => {
    if (!data || !data.listInfluentialTwitterFollowers) return []
    return data.listInfluentialTwitterFollowers.data.map((follower) => ({
      name: 'Donald J. Trump',
      username: '@realDonaldTrump',
      avatar: '/images/tokenDetail/trump.webp', // TODO: replace with actual avatar URL
      followers: fShortenNumber(follower.numberOfFollowers),
    }))
  }, [data])

  return (
    <div className="mt-3 relative">
      <div className="flex justify-between px-2.5 py-2 bg-[linear-gradient(173.93deg,rgba(62,62,62,0.35)_16.91%,rgba(17,17,17,0)_95.21%)] rounded-t-[8px]">
        <span className="text-[#FFFFFF] text-[calc(1rem*(15/16))] app-font-medium">
          {t('ai.influential.title', { count: data?.listInfluentialTwitterFollowers?.data.length ?? 0 })}
        </span>
        <div className="flex justify-center items-center size-6 rounded-full bg-[#3D3D3D]">
          <IconChevronRight className="size-2.5" />
        </div>
      </div>
      <div className="pt-1.5 pb-3 flex flex-col gap-2 px-2.5">
        {loading && (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-[8px]" />
            ))}
          </>
        )}
        {!loading && followers.length === 0 && <EmptyList />}
        {!loading &&
          followers.length > 0 &&
          followers.map((follower, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl px-4 py-3 bg-[#23585F33] border border-[#23585F33]"
            >
              <div className="flex items-center gap-3 w-[194px]">
                <img src={follower.avatar} alt={follower.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex flex-col gap-1.5 justify-center">
                  <div className="text-[#FFFFFF] text-sm leading-[calc(1rem*(14/16))] app-font-medium">
                    {follower.name}
                  </div>
                  <div className="text-[#FFFFFF80] text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))]">
                    {follower.username}
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-1.5 text-center text-white">
                <div className="app-font-medium text-base leading-4">{follower.followers}</div>
                <div className="text-[calc(1rem*(10/16))] leading-[calc(1rem*(10/16))] text-[#FFFFFF80]">
                  {t('ai.influential.followerCount')}
                </div>
              </div>
              <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.9596 4.16602L17.793 9.89701L11.9596 15.8327" stroke="#B9B9B9" strokeWidth="1.66667" />
              </svg>
            </div>
          ))}
      </div>
    </div>
  )
}
