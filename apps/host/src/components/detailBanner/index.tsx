import { TokenDetail } from '@/@generated/gql/graphql-core.ts'
import { ChainIds } from '@/types/enums.ts'
import { getLaunchpad } from '@/utils/helpers.ts'
import { cn } from '@/lib/utils.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { getDex } from '@/utils/lauchpad.ts'
import { useOfficialPool } from '@hooks/useTokenPools.ts'
import { HotTokenTooltip } from '@components/detailInfo/HotTokenTooltip.tsx'
import { TopTrendingTooltip } from '@components/detailInfo/TopTrendingTooltip.tsx'

type DetailBannerProps = {
  tokenData: TokenDetail
}

const chainMap: Record<number, string> = {
  [ChainIds.Solana]: 'SOL',
  [ChainIds.Ethereum]: 'ETH',
  [ChainIds.Bsc]: 'BNB',
}

const chainNameMap: Record<number, string> = {
  [ChainIds.Solana]: 'Solana',
  [ChainIds.Ethereum]: 'Ethereum',
  [ChainIds.Bsc]: 'BNB',
}

const iconChainMap: Record<number, string> = {
  [ChainIds.Solana]: '/images/wallets/sw-solana.svg',
  [ChainIds.Ethereum]: '/images/wallets/ethereum.png',
  [ChainIds.Bsc]: '/images/icons/chains/ic-bnb.svg',
}

const normalizeDexName = (dex: string) => {
  if (dex === 'Pump') return 'Pumpfun'
  return dex
}

const DetailBanner = ({ tokenData }: DetailBannerProps) => {
  const officialPool = useOfficialPool(tokenData?.address as string, tokenData?.chainId as number)
  const dex = officialPool?.dex ? getDex(officialPool.dex) : null
  const launchpad = tokenData?.isMigrated ? getLaunchpad(tokenData?.dexes ?? []) : undefined
  const website = tokenData?.info?.websites?.[0]
  const twitter = tokenData?.info?.socials?.find((item) => item.type === 'twitter')

  const launchpadInfo = launchpad ? getDex(launchpad) : null

  // Check if website and twitter exist
  const hasWebsite = !!website?.url
  const hasTwitter = !!twitter?.url

  const visible = !tokenData?.info?.bannerUrl && !hasWebsite && !hasTwitter

  return (
    <div className="flex flex-col gap-3 px-2.5 pt-4">
      <div className="flex flex-col gap-2">
        {/*Symbol*/}
        <div className="flex items-center gap-1 font-[380] text-[16px] text-[#FFFFFF]">
          <div className="flex items-center gap-1 nophone">
            <span>{tokenData?.symbol}</span>
            <CopyButton icon="/images/icons/ic-copy2.svg" text={tokenData?.address ?? ''} className="size-4" type="tokenAddress" />
          </div>
          <div>
            <span className="text-[14px]">/</span> {tokenData?.chainId ? chainMap[tokenData.chainId] : ''}
          </div>
          {tokenData?.isHotToken ? <HotTokenTooltip className="ml-0" /> : null}
          {tokenData?.topTrending && tokenData?.topTrending > 0 ? (
            <TopTrendingTooltip top={tokenData.topTrending} />
          ) : null}
        </div>

        {/*Link*/}
        <div className="flex items-center gap-2 cursor-default">
          <div className="flex items-center gap-1 text-[12px] app-font-regular text-[#FFFFFFB2]">
            <img
              src={tokenData?.chainId ? iconChainMap[tokenData.chainId] : '/images/wallets/sw-solana.svg'}
              alt=""
              className="size-3"
            />
            <span className="leading-[1]">{tokenData?.chainId ? chainNameMap[tokenData.chainId] : 'Solana'}</span>
            <img src="/images/futuresDetail/arrow-right.svg" alt="chevron right" />
          </div>

          {dex && dex.value !== launchpad && (
            <div className="flex items-center gap-1 text-[12px] app-font-regular text-[#FFFFFFB2]">
              <img src={dex.icon} className="size-[11px]" alt="" />
              <span className="leading-[1]">{normalizeDexName(dex.label)}</span>
              {launchpad && <span className="text-[#FFFFFF80]">via</span>}
            </div>
          )}

          {launchpadInfo && (
            <div className="flex items-center gap-1 text-[12px] app-font-regular text-[#FFFFFFB2]">
              <a href="#">
                <img src={launchpadInfo.icon} className="size-[11px]" alt="" />
              </a>
              <a href="#" className="leading-[1]">
                {launchpadInfo.alias ?? launchpadInfo.label}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className={cn('relative bg-[#18181d] rounded-[4px] w-full', tokenData?.info?.bannerUrl ? '' : '')}>
        {!!tokenData?.info?.bannerUrl && (
          <img
            src={tokenData.info?.bannerUrl as string}
            className="w-full h-full object-cover rounded-t-[8px] max-h-[300px]"
            alt="banner"
          />
        )}

        {!visible && (
          <div className="flex items-center rounded-[4px] bg-[#18181D] w-full h-7 text-[12px] app-font-medium leading-[1]">
            {/* Website Link */}
            {hasWebsite ? (
              <a
                href={website.url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1 text-white "
              >
                <img src="/images/tokenDetail/icon-global-active.svg" className="size-5" alt="" />
                Website
              </a>
            ) : (
              <div className="flex flex-1 items-center justify-center gap-1 text-[#605E68] cursor-not-allowed">
                <img src="/images/tokenDetail/icon-global.svg" className="size-5 opacity-50" alt="" />
                Website
              </div>
            )}

            <div className="h-3 w-[1px] bg-[#ECECED14]"></div>

            {/* Twitter Link */}
            {hasTwitter ? (
              <a
                href={twitter.url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1 text-white "
              >
                <img src="/images/tokenDetail/icon-twitter-active.svg" className="size-4" alt="" />
                Twitter
              </a>
            ) : (
              <div className="flex flex-1 items-center justify-center gap-1 text-[#605E68] cursor-not-allowed">
                <img src="/images/tokenDetail/icon-twitter.svg" className="size-4 opacity-50" alt="" />
                Twitter
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DetailBanner
