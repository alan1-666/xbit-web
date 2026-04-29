import { lazy, MouseEvent } from 'react'
import { cn } from '@/lib/utils.ts'
import { SimpleTooltip } from '@components/v2/ui-shared/components/SimpleTooltip.tsx'
import { useTranslation } from 'react-i18next'
import { TooltipProvider } from '@components/ui/tooltip.tsx'
import { IconTelegram2 } from '@components/icon/brands/IconTelegram2.tsx'

export interface IconsGroupProps {
  tokenAddress: string
  twitterUrl?: string
  websiteUrl?: string
  twitterPostId?: string
  twitterChangeCount?: number
  advertisesOnDex?: boolean
  telegram?: string
}

const EmbeddedTwitterPost = lazy(() => import('@components/discover/EmbeddedTwitterPost.tsx'))

export const IconsGroup = (props: IconsGroupProps) => {
  const {
    tokenAddress,
    twitterUrl,
    twitterChangeCount = 0,
    websiteUrl,
    twitterPostId,
    advertisesOnDex,
    telegram,
  } = props
  const { t } = useTranslation()
  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const openLink = (event: MouseEvent, url: string) => {
    event.stopPropagation()
    event.preventDefault()
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1.5" onClick={handleClick}>
        {twitterPostId && <EmbeddedTwitterPost tweetId={twitterPostId} />}
        {twitterUrl && (
          <SimpleTooltip content="Twitter (X)">
            <div className={cn('flex items-center', twitterChangeCount > 1 ? 'text-[#FACC14]' : 'text-[#9B9B9B]')}>
              <img
                src="/images/icons/socials/ic-twitter.svg"
                alt=""
                className="size-3.5"
                onClick={(event) => openLink(event, twitterUrl)}
              />
              {twitterChangeCount > 1 && (
                <span className="text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))] font-medium">
                  {twitterChangeCount}
                </span>
              )}
            </div>
          </SimpleTooltip>
        )}
        {telegram ? (
          <SimpleTooltip content="Telegram">
            <IconTelegram2 className="size-3.5 text-[#9B9B9B]" onClick={(event) => openLink(event, telegram)} />
          </SimpleTooltip>
        ) : null}
        {websiteUrl && (
          <SimpleTooltip content={websiteUrl}>
            <img
              src="/images/icons/socials/ic-website.svg"
              alt=""
              className="size-4"
              onClick={(event) => openLink(event, websiteUrl)}
            />
          </SimpleTooltip>
        )}
        <SimpleTooltip content={t('listCoin.tooltip.searchContract')}>
          <img
            src="/images/icons/socials/ic-search.svg"
            alt=""
            className="size-4"
            onClick={(event) => openLink(event, `https://x.com/search?q=${tokenAddress}`)}
          />
        </SimpleTooltip>
        {advertisesOnDex && (
          <SimpleTooltip content={t('listCoin.tooltip.advertiseOnDexscreener')}>
            <img src="/images/icons/socials/ic-dexscreener.svg" alt="" className="size-4" />
          </SimpleTooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
