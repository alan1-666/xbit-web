import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatBalance, formatPercent } from '@/lib/format'
import { getPath } from '@/lib/utils'
import { getShortenedUrl } from '@/utils/helpers'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import ShareBottomSheet from '@components/common/ShareBottomSheet.tsx'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  data: any
  inviteCode?: string
  isXStock?: boolean
}

const ShareHolding = ({ open, setOpen, data, inviteCode, isXStock }: Props) => {
  const { t } = useTranslation()
  const memoizedLinkDetail = useMemo(() => {
    if (isXStock) {
      return `${getPath(APP_PATH.X_STOCK_DETAIL, { address: data?.tokenAddress, chain: CHAIN_SYMBOLS[data?.chainId] })}${
        inviteCode ? `/@${inviteCode}` : ''
      }`
    }

    return `${getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: data?.tokenAddress, chain: CHAIN_SYMBOLS[data?.chainId] })}${
      inviteCode ? `/@${inviteCode}` : ''
    }`
  }, [data, inviteCode])

  const currentUrl = useMemo(() => window.location.origin, [])

  return (
    <ShareBottomSheet
      open={open}
      setOpen={setOpen}
      title={t('shareBottomSheet.title')}
      fileName=""
      text={
        isXStock
          ? t('shareBottomSheet.stockShareTemplate', {
              symbol: data?.symbol,
              returns: formatBalance(data.returnRate, {
                showCurrency: true,
                roundMode: 'floor',
              }),
            })
          : t('shareBottomSheet.shareHoldingTemplate', {
              symbol: data?.symbol,
              returns: formatBalance(data.returnRate, {
                showCurrency: true,
                roundMode: 'floor',
              }),
            })
      }
      url={`${currentUrl}${memoizedLinkDetail}`}
      hideSaveButton={true}
    >
      <div className="w-full">
        <div className='bg-[url("/images/share-holding-header-bg.png")] bg-cover bg-center bg-no-repeat w-full h-[120px] rounded-b-[8px] flex flex-col justify-center items-center text-center text-white text-[16px] sm:text-[20px] font-[700] leading-[1.5]'>
          <div>{t('assets.shareHolding.title')}</div>
          <div>{t('assets.shareHolding.description')}</div>
        </div>
        <div className='px-[20px] pt-[30px] pb-[24px] bg-[url("/images/dot-group.png")] bg-cover bg-center bg-no-repeat w-ful'>
          <div>
            <div className="flex items-center gap-2.5">
              {isXStock ? (
                <LogoWithChain
                  logo={data.tokenAvatar}
                  logoClassName="w-6 h-6"
                  name={data.tokenName}
                />
              ) : (
                <LogoWithChain
                  logo={data.tokenAvatar + `t=${Date.now()}`}
                  logoClassName="w-6 h-6"
                  name={data.tokenName}
                  avatarImageProps={{
                    crossOrigin: 'use-credentials',
                  }}
                />
              )}

              <div className="text-[15px] font-[500] leading-[1.4] text-white">{data.tokenName}</div>
            </div>
            <div className="mt-4 text-[16px] font-[330] text-white">{t('assets.shareHolding.totalPnl')}</div>
            <div className="mt-4 flex items-center gap-2.5">
              <span
                className={`text-[24px] font-[520] ${
                  typeof data.pnl === 'number'
                    ? data.pnl > 0
                      ? 'text-rise'
                      : data.pnl < 0
                        ? 'text-fall'
                        : 'text-white'
                    : 'text-white'
                }`}
              >
                {formatBalance(data.pnl, {
                  showCurrency: true,
                  roundMode: 'floor',
                })}
              </span>
              {data.returnRate !== '--' && data.pnl !== '--' && (
                <span
                  className={`p-1 rounded-[4px] font-[380] text-[14px] leading-none text-white ${
                    Number(data.returnRate) > 0 ? 'bg-rise' : 'bg-fall'
                  }`}
                >
                  {formatPercent(data.returnRate, {
                    showSign: true,
                  })}
                </span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="text-[11px] sm:text-[13px] font-[350] text-white/70">
                {inviteCode ? t('assets.shareHolding.inviteCode') : t('assets.shareHolding.officialWebsite')}
              </div>
              <div className="text-[12px] sm:text-[15px] font-[500] text-white">
                {getShortenedUrl(`${inviteCode ? `${currentUrl}/@${inviteCode}` : currentUrl}`, 35, inviteCode)}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="p-4 text-center bg-[#14141499] border-[#ECECED14] rounded-[4px]">
                <div className="text-[12px] font-[330] text-white/70">{t('assets.shareHolding.buyAmount')}</div>
                <div className="mt-2.5 text-[16px] font-[500] text-white">
                  {formatBalance(data?.totalBuyValue, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })}
                </div>
              </div>
              <div className="p-4 text-center bg-[#14141499] border-[#ECECED14] rounded-[4px]">
                <div className="text-[12px] font-[330] text-white/70">{t('assets.shareHolding.holding')}</div>
                <div className="mt-2.5 text-[16px] font-[500] text-white">
                  {formatBalance(data?.holdingValue, {
                    showCurrency: true,
                    roundMode: 'floor',
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end items-center">
            <img src="/images/share-holding-footer.png" alt="footer" className="w-[136px] h-[136px]" />
          </div>
        </div>
      </div>
    </ShareBottomSheet>
  )
}

export default ShareHolding
