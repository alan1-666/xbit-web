import { MouseEvent, ReactNode, useState } from 'react'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { useTranslation } from 'react-i18next'
import { TokenDetail, TokenPortrait } from '@/@generated/gql/graphql-future'
import ClipboardJS from 'clipboard'
import { Check } from 'lucide-react'
import { EmbeddedTwitterPost } from '@components/discover/EmbeddedTwitterPost.tsx'
import { cn } from '@/lib/utils.ts'
import { useIsXStockPath } from '@hooks/xstock/useIsXStockPath.ts'
import { useLocation } from 'react-router-dom'
import { DevAction } from '@/@generated/gql/graphql-meme2.ts'
import { useActiveChainId } from '@hooks/useActiveChain.ts'
import { CHAIN_EXPLORER_IMAGES } from '@/lib/constant.ts'
import { ChainIds } from '@/types/enums.ts'

export interface IconsDrawerProps {
  tokenData?: TokenDetail
  tagDevAction?: string
  tokenPortrait?: TokenPortrait
  hideSearchToken?: boolean
}

type PortraitIconItem = {
  key: string
  icon: string | ReactNode
  show: boolean
  onClick?: (event: MouseEvent) => void
  suffix?: string | ReactNode
  text: string | ReactNode
  showInIconList?: boolean
  infoText?: string
  href?: string
}

const formatAge = (createdTime: string) => {
  if (!createdTime) return '--'
  const now = Date.now()
  const createdTimeInMs = new Date(createdTime).getTime()
  const diffInSeconds = Math.floor((now - createdTimeInMs) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  return `${Math.floor(diffInSeconds / 86400)}d`
}

const IconsDrawer = (props: IconsDrawerProps) => {
  const { t } = useTranslation()
  const { state } = useLocation()
  const { tweetId, twitterNameChangeCount, advertisesOnDex } = state || {}
  const [openDrawer, setOpenDrawer] = useState(false)
  const [copyStatus, setCopyStatus] = useState(false)

  const isXStockPath = useIsXStockPath()
  const activeChainId = useActiveChainId()

  const { tokenData, tagDevAction, tokenPortrait, hideSearchToken = false } = props
  const hasState = !!tweetId || !!twitterNameChangeCount || !!advertisesOnDex

  if (!tokenData && !hasState) return null

  if (!tokenPortrait && !hasState) return null

  const tokenAddress = tokenData?.address as string

  const copy = () => {
    if (!tokenAddress) return
    const clipboard = new ClipboardJS('.copy-contract-btn', {
      text: () => tokenAddress,
    })

    clipboard.on('error', (e) => {
      clipboard.destroy()
      console.error('Action:', e?.action)
    })

    navigator.clipboard
      .writeText(tokenAddress)
      .then(() => {
        setCopyStatus(true)
        setTimeout(() => {
          setCopyStatus(false)
        }, 1000)
      })
      .catch((err) => {
        console.warn(err)
      })
  }

  const items: PortraitIconItem[] = [
    {
      key: 'isHotToken',
      icon: '/images/tokenDetail/icon-hot.svg',
      show: isXStockPath ? false : (tokenData?.isHotToken ?? false),
      text: t('iconsDrawer.isHot', { total: 1000 }),
    },
    {
      key: 'launchedOnPump',
      icon: '/images/icons/icon-pump.webp',
      show: tokenPortrait?.launchedOnPump ?? false,
      text: t('iconsDrawer.pumpLaunch'),
    },
    {
      key: 'lowLiquidity',
      icon: '/images/tokenDetail/icon-danger.svg',
      show: tokenPortrait?.lowLiquidity ?? false,
      text: t('iconsDrawer.lowLiquidity'),
    },
    {
      key: 'copyContract',
      icon: '/images/tokenDetail/icon-copy.webp',
      show: true,
      text: t('iconsDrawer.copyContract'),
      onClick: copy,
      suffix: copyStatus ? (
        <Check className="w-[20px] min-w-[20px] text-[#00FFB4]" />
      ) : (
        <span className="copy-contract-btn border border-[#ffffff80] rounded px-2 py-1 text-[14px] leading-[1]">
          {t('iconsDrawer.copyTextSuffix')}
        </span>
      ),
    },
    {
      key: 'tokenAge',
      icon: (
        <span className="text-[calc(1rem*(14/16))] text-[#00FFB4] leading-[1] inline-block w-[25px] min-w-[25px]">
          {formatAge(tokenData?.createdTime)}
        </span>
      ),
      show: true,
      text: t('iconsDrawer.tokenAge'),
    },
    {
      key: 'walletActive1h',
      icon: '/images/tokenDetail/icon-green-fire.svg',
      show: tokenPortrait?.walletActive1h ? tokenPortrait.walletActive1h >= 1000 : false,
      text: t('iconsDrawer.activeWallets'),
    },
    {
      key: 'revise',
      icon: <EmbeddedTwitterPost tweetId={tweetId ? tweetId : (tokenPortrait?.tweetId ?? '')} />,
      show: tweetId ? !!tweetId : !!tokenPortrait?.tweetId,
      text: t('iconsDrawer.revise'),
      showInIconList: true,
    },
    {
      key: 'devAction',
      icon: <span className="text-[calc(1rem*(13/16))] text-[#FFFFFF] leading-[1] inline-block w-5 min-w-5">DEV</span>,
      text: (
        <span className={cn(tagDevAction === DevAction.Hold ? 'text-rise' : 'text-fall')}>{tagDevAction ?? ''}</span>
      ),
      show: !!tagDevAction && tagDevAction !== '',
    },
    {
      key: 'updatedSocialOnDex',
      icon: '/images/tokenDetail/icon-dex.webp',
      show: tokenPortrait?.updatedSocialOnDex ?? false,
      text: t('iconsDrawer.dexScreenerSocial'),
      showInIconList: true,
    },
    {
      key: 'abandoned',
      icon: '/images/tokenDetail/icon-traders.svg',
      show: tokenPortrait?.abandoned ?? false,
      text: t('iconsDrawer.projectAbandoned'),
      showInIconList: true,
    },
    {
      key: 'advertisesOnDex',
      icon: '/images/tokenDetail/icon-speaker.webp',
      show: advertisesOnDex ? advertisesOnDex : (tokenPortrait?.advertisesOnDex ?? false),
      text: t('iconsDrawer.dexScreenerAd'),
      showInIconList: true,
    },
    {
      key: 'twitterSearch',
      icon: '/images/tokenDetail/icon-search.svg',
      show: true,
      text: t('iconsDrawer.goToTwitter'),
      showInIconList: !hideSearchToken,
      suffix: <img src="/images/tokenDetail/icon-arrow-right.svg" className="w-[24px] min-w-[24px]" alt="" />,
      onClick: (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        window.open(`https://x.com/search?q=${tokenAddress}`, '_blank')
      },
      href: `https://x.com/search?q=${tokenAddress}`,
    },
    {
      key: 'officialTwitter',
      icon: '/images/tokenDetail/icon-twitter.svg',
      show: !!tokenPortrait?.officialTwitter,
      text: t('iconsDrawer.officialTwitter'),
      showInIconList: true,
      suffix: <img src="/images/tokenDetail/icon-arrow-right.svg" className="w-[24px] min-w-[24px]" alt="" />,
      onClick: (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        window.open(tokenPortrait?.officialTwitter ?? '#', '_blank')
      },
      href: tokenPortrait?.officialTwitter ?? '#',
    },
    {
      key: 'officialTelegram',
      icon: '/images/tokenDetail/icon-tele.svg',
      show: !!tokenPortrait?.officialTelegram,
      text: t('iconsDrawer.officialTelegram'),
      showInIconList: true,
      suffix: <img src="/images/tokenDetail/icon-arrow-right.svg" className="w-[24px] min-w-[24px]" alt="" />,
      href: tokenPortrait?.officialTelegram?.toString(),
    },
    {
      key: 'officialWebsite',
      icon: '/images/tokenDetail/icon-global.svg',
      show: !!tokenPortrait?.officialWebsite,
      text: t('iconsDrawer.officialWebsite'),
      showInIconList: true,
      suffix: <img src="/images/tokenDetail/icon-arrow-right.svg" className="w-[24px] min-w-[24px]" alt="" />,
      onClick: (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        window.open(tokenPortrait?.officialWebsite ?? '#', '_blank')
      },
      href: tokenPortrait?.officialWebsite ?? '#',
    },
    {
      key: 'explorer',
      icon: CHAIN_EXPLORER_IMAGES[activeChainId ?? ChainIds.Solana],
      show: !!tokenPortrait?.explorer,
      text: t('iconsDrawer.contractExplorer'),
      showInIconList: true,
      suffix: <img src="/images/tokenDetail/icon-arrow-right.svg" className="w-[24px] min-w-[24px]" alt="" />,
      onClick: (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        window.open(tokenPortrait?.explorer ?? '#', '_blank')
      },
      href: tokenPortrait?.explorer ?? '#',
    },
    {
      key: 'twitterSymbolRename',
      icon: '/images/tokenDetail/icon-symbol-change.svg',
      show: twitterNameChangeCount
        ? Number(twitterNameChangeCount) > 0
        : Number(tokenPortrait?.twitterNameChangeCount) > 0,
      text: t('iconsDrawer.symbolChanges', { total: tokenPortrait?.twitterNameChangeCount }),
      //infoText: "officialpepsic、Alex Jones、Nordace、₿en Todar、ALGO V9、hiddengem10000x.eth、0x长安、Bounce Brand、Ramin Nasibov、Crypto Matt"
    },
    {
      key: 'twitterRename',
      // icon: '/images/icons/arrow-down-icon.svg',
      icon: (
        <div className="bg-[#25252a] rounded-[4px] px-0.5 py-0.5">
          <img src="/images/icons/arrow-down-icon.svg" className="w-[12px] min-w-[12px]" alt="" />
        </div>
      ),
      showInIconList: true,
      show: true,
      text: t('iconsDrawer.nameChanges'),
    },
  ]

  return (
    <>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setOpenDrawer(true)}>
        {items.map((item, index) => {
          if (!item.show || !item.showInIconList) return null
          if (typeof item.icon === 'string') {
            return (
              <img
                src={item.icon}
                key={index}
                className="w-[16px] min-w-[16px] !pointer-events-auto"
                alt=""
                onClick={item.onClick}
              />
            )
          }
          return item.icon
        })}
      </div>
      <AppDrawer
        title={t('iconsDrawer.tokenPortrait')}
        open={openDrawer}
        setOpen={setOpenDrawer}
        isShowBgImg={false}
        drawerContent={
          <>
            {items.map((item, index) => {
              if (!item.show || index === items.length - 1) return null
              if (Boolean(item?.href)) {
                return (
                  <a
                    key={index}
                    className="block py-[18px] border-b-[0.5px] border-b-[#343339] cursor-pointer"
                    href={item?.href}
                    target={'_blank'}
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-[12px] ">
                      {typeof item.icon === 'string' ? (
                        <img src={item.icon} className="w-[25px] min-w-[25px]" alt="" />
                      ) : (
                        item.icon
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-[10px] h-full">
                          <div className="text-[calc(1rem*(14/16))] text-white leading-[1]">{item.text}</div>
                          {item?.suffix}
                        </div>
                      </div>
                    </div>
                    {item?.infoText && (
                      <div className="text-[12px] app-font-regular text-[#FFFFFFB2] mt-2 ml-8">{item.infoText}</div>
                    )}
                  </a>
                )
              }
              return (
                <div
                  key={index}
                  className="py-[18px] border-b-[0.5px] border-b-[#343339] cursor-pointer"
                  onClick={item.onClick}
                >
                  <div className="flex items-center gap-[12px] ">
                    {typeof item.icon === 'string' ? (
                      <img src={item.icon} className="w-[25px] min-w-[25px]" alt="" />
                    ) : (
                      item.icon
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-[10px] h-full">
                        <div className="text-[calc(1rem*(14/16))] text-white leading-[1]">{item.text}</div>
                        {item?.suffix}
                      </div>
                    </div>
                  </div>
                  {item?.infoText && (
                    <div className="text-[12px] app-font-regular text-[#FFFFFFB2] mt-2 ml-8">{item.infoText}</div>
                  )}
                </div>
              )
            })}
          </>
        }
      />
    </>
  )
}

export default IconsDrawer
