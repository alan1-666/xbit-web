import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatAmount, formatBalance } from '@/lib/format.ts'
import { fShortenNumber } from '@/lib/number.ts'
import { containsWalletAddress, formatAddressWallet } from '@/lib/string.ts'
import { useGetUserData } from '@/modules/prediction/hooks/useGetUserData.ts'
import { useTotalUserPositionValue } from '@/modules/prediction/hooks/useTotalUserPositionValue.ts'
import { useUserProfileStats } from '@/modules/prediction/hooks/useUserProfileStats.ts'
import { Loader } from '@components/common/MoneyFormatted.tsx'
import { Skeleton } from '@components/ui/skeleton.tsx'
import ClipboardJS from 'clipboard'
import { format } from 'date-fns'
import { Check, CheckCircle } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const SHORTEN_NAME_THRESHOLD = 25

function shortenName(name?: string) {
  if (!name) return ''
  const shouldShorten = containsWalletAddress(name) || name.length >= SHORTEN_NAME_THRESHOLD
  if (!shouldShorten) return name
  return `${name.slice(0, 10)}...`
}

const UserInfoCard = ({ userId }: { userId: string }) => {
  const { t } = useTranslation()
  const { data: userData, isPending: isFetchingUserData } = useGetUserData(userId)
  const { data: userStats, isPending: isFetchingUserStats } = useUserProfileStats(userId)
  const { data: userBalance, isPending: isFetchingUserBalance } = useTotalUserPositionValue(userId)

  const displayName = shortenName(userData?.name) || userData?.pseudonym || formatAddressWallet(userId)
  const joinDate = userStats?.joinDate ? format(new Date(userStats.joinDate), 'MMM yyyy') : 'Unknown'
  const isCreator = userData?.users?.some((u) => u.creator) || false
  const isMod = userData?.users?.some((u) => u.mod) || false

  const [checked, setChecked] = useState(false)
  const buttonRef = useRef(null)

  const copy = useCallback(
    (e: any) => {
      e.stopPropagation() // Stop event bubbling
      e.preventDefault() // Prevent default action (for extra safety)

      //Check working in safari (ios 18)
      if (!navigator.clipboard) {
        const clipboard = new ClipboardJS(buttonRef.current!, {
          text: () => userId || '',
        })

        clipboard.on('success', () => {
          onCopySuccess()
        })

        return
      }

      navigator.clipboard
        .writeText(userId || '')
        .then(() => {
          onCopySuccess()
        })
        .catch((err) => {
          console.warn(err)
        })
    },
    [userId, buttonRef],
  )

  const onCopySuccess = () => {
    setChecked(true)
    toast.success(t('toast.copiedSuccess'))
    setTimeout(() => {
      setChecked(false)
    }, 600)
  }

  return (
    <Tooltip>
      <div>
        <div className="border-0 lg:border lg:border-white/10 rounded-lg lg:p-3 lg:h-full">
          <div className="flex flex-col gap-4 md:h-full">
            <div className="w-full">
              {isFetchingUserData ? (
                <div className="grid grid-cols-[64px_1fr] grid-rows-2 gap-x-3 items-center w-full">
                  <div className="row-span-2">
                    <div className="relative">
                      <Skeleton className="size-16 rounded-full" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full overflow-hidden gap-4">
                    <Skeleton className="size-5 w-full" />

                    <div className="flex items-center shrink-0 min-w-fit gap-2">
                      <Skeleton className="size-5" />
                      <Skeleton className="size-5" />
                      <Skeleton className="size-5" />
                    </div>
                  </div>

                  <Skeleton className="h-5 w-20" />
                </div>
              ) : (
                <div className="grid grid-cols-[64px_1fr] grid-rows-2 gap-x-3 items-center w-full ">
                  {/* Avatar */}
                  <div className="row-span-2">
                    <div className="relative">
                      {userData?.profileImage ? (
                        <Avatar className="size-16 rounded-full border border-white/10 shrink-0">
                          <AvatarImage src={userData.profileImage} alt={displayName} className="object-cover" />
                          <AvatarFallback className="rounded-full text-lg">
                            {displayName?.slice(0, 2)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div
                          className="rounded-full border border-white/10"
                          style={{
                            borderRadius: '50%',
                            backgroundColor: 'rgb(147, 127, 15)',
                            backgroundImage:
                              'radial-gradient(at 66% 77%, rgb(180, 199, 80) 0px, transparent 50%), radial-gradient(at 29% 97%, rgb(138, 96, 98) 0px, transparent 50%), radial-gradient(at 99% 86%, rgb(76, 21, 133) 0px, transparent 50%), radial-gradient(at 29% 88%, rgb(73, 207, 199) 0px, transparent 50%)',
                            height: '64px',
                            width: '64px',
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Name & Connect */}
                  <div className="flex items-center justify-between w-full overflow-hidden">
                    <div className="flex-1 min-w-0 pr-2 flex items-center gap-2">
                      <p className="text-2xl font-semibold text-white truncate min-w-0 max-w-full">{displayName}</p>
                      {userData?.verifiedBadge && <CheckCircle size={20} className="text-blue-500 shrink-0" />}
                    </div>

                    {/* Actions */}
                    <div className="flex  shrink-0 min-w-fit gap-2">
                      <TooltipTrigger asChild>
                        {checked ? (
                          <Check className={`w-4 h-4`} />
                        ) : (
                          <img
                            src={'/images/icons/ic-copy.svg'}
                            className={'w-4 h-4 min-w-4 cursor-pointer'}
                            alt=""
                            onClick={copy}
                            ref={buttonRef}
                          />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('iconsDrawer.copyContract')}</p>
                      </TooltipContent>
                    </div>
                  </div>

                  {/* Joined & Roles */}
                  <div className="flex items-center gap-x-2 text-gray-400 min-h-[20px]">
                    <span className="text-sm whitespace-nowrap">
                      {t('prediction.profile.joined')} {joinDate}
                    </span>
                    {/* TODO: sẽ sử dụng ở tương lai */}
                    {/* <span className="text-sm">•</span> */}
                    {/* <span className="text-sm whitespace-nowrap">
                    {userStats?.views !== undefined ? fShortenNumber(userStats.views) : 0} views
                  </span> */}
                    {(isCreator || isMod) && (
                      <>
                        <span className="text-sm">•</span>
                        <span className="text-sm whitespace-nowrap">
                          {isCreator && isMod
                            ? t('prediction.profile.creatorAndMod')
                            : isCreator
                              ? t('prediction.profile.creator')
                              : t('prediction.profile.mod')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex flex-row gap-x-5 md:gap-x-4 items-start mt-auto pt-2">
              <div className="flex flex-col gap-y-0.5">
                <p className="text-sm text-gray-400 whitespace-nowrap">{t('prediction.profile.positionsValue')}</p>
                <p className="text-xl font-medium text-white">
                  {isFetchingUserBalance ? (
                    <Loader />
                  ) : (
                    <>
                      <span className="max-[431px]:hidden">
                        {formatBalance(userBalance || 0, { showCurrency: true })}
                      </span>
                      <span className="hidden max-[431px]:block">${fShortenNumber(userBalance || 0)}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="w-px h-8 bg-white/10 self-center"></div>
              <div className="flex flex-col gap-y-0.5">
                <p className="text-sm text-gray-400 whitespace-nowrap">{t('prediction.profile.biggestWin')}</p>
                <p className="text-xl font-medium text-white">
                  {isFetchingUserStats ? (
                    <Skeleton className="h-7 w-20" />
                  ) : (
                    formatAmount(userStats?.largestWin || 0, { showCurrency: true })
                  )}
                </p>
              </div>
              <div className="w-px h-8 bg-white/10 self-center"></div>
              <div className="flex flex-col gap-y-0.5">
                <p className="text-sm text-gray-400 whitespace-nowrap">{t('prediction.profile.predictions')}</p>
                <p className="text-xl font-medium text-white">
                  {isFetchingUserStats ? <Skeleton className="h-7 w-12" /> : fShortenNumber(userStats?.trades || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Tooltip>
  )
}

export default UserInfoCard
