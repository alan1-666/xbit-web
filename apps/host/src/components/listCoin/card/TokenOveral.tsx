// import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'
import LogoWithChain from '@/components/common/LogoWithChain'
// import { TimeAgo } from '@/components/TimeAgo'
import XTooltip from '@/components/ui/XTooltip'
import { useActiveChainId } from '@/hooks/useActiveChain'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant'
import { formatBalance } from '@/lib/format'
import { cn, getPath } from '@/lib/utils.ts'
import { ChainIds } from '@/types/enums'
import { getBlockchainLogo2 } from '@/utils/helpers'
import { formatToTimeAgoI18n, getTimeAgo } from '@/utils/time'
import { memo, useMemo } from 'react'
import AliasCard from './AliasCard'
import { WalletAvatar } from '@components/assets/funding/WalletAvatar.tsx'

type Props = {
  address: string
  logo: string
  name: string
  lastActive?: number | string
  balance?: number
  isAvatar?: boolean
  // alias?: string
  className?: string
  useEditNameButton?: boolean
  isLowLiquidity?: boolean
  unLinkDetail?: boolean
  linkDetail?: string
  walletName?: string
  twitterName?: string
  onChangeNameSuccess?: (newName: string) => void
}

export const TokenOveral = memo((props: Props) => {
  const {
    address,
    logo,
    name,
    lastActive,
    balance,
    isAvatar = false,
    // alias = '',
    className,
    useEditNameButton = false,
    isLowLiquidity = false,
    linkDetail,
    walletName,
    twitterName,
    onChangeNameSuccess,
  } = props
  const chainId = useActiveChainId() ?? ChainIds.Solana

  const memoizedLinkDetail = useMemo(() => {
    return linkDetail ?? getPath(APP_PATH.MEME_TOKEN_DETAIL, { address, chain: CHAIN_SYMBOLS[chainId] })
  }, [linkDetail, address, chainId])

  const chainLogo = useMemo(() => getBlockchainLogo2(chainId), [chainId])

  return (
    <div className={cn('flex items-center justify-stretch gap-1.25 min-w-37.5 h-9.75 pl-2.5', className)}>
      {isAvatar ? (
        // <ChainCurrencyIcon
        //   currencyIcon={logo}
        //   avatarClassName="flex items-center justify-center w-[42px] h-[42px] rounded-[8px] m-0"
        //   avatarImageClassName="w-full h-full"
        //   fallbackImageEnable
        //   fallbackNFT={address}
        // />
        <WalletAvatar source={logo} address={address} rounded={false} className="w-10.5 h-10.5 rounded-[8px]" />
      ) : (
        <LogoWithChain
          logo={logo}
          logoClassName="flex items-center justify-center w-[36px] h-[36px] rounded-[8px]"
          logoContainerClassName="flex justify-center items-center w-[36px] h-[36px] rounded-[8px] overflow-hidden"
          chainLogo={chainLogo}
          name={name}
        />
      )}
      <div className="mt-0 ml-1.75">
        <div className="flex items-center leading-none h-3.25 mb-1">
          <AliasCard
            address={address}
            name={name}
            useCopyButton
            useEditNameButton={useEditNameButton}
            classNameWrapper="flex items-center"
            classNameAlias="text-[13px] font-medium"
            isLowLiquidity={isLowLiquidity}
            linkDetail={memoizedLinkDetail}
            walletName={walletName}
            twitterName={twitterName}
            onChangeNameSuccess={onChangeNameSuccess}
          />
        </div>
        {lastActive && typeof lastActive === 'number' ? (
          <XTooltip.Details
            title={
              <div className="text-[10px] min-w-12.5 text-left text-[#00CE89]">{formatToTimeAgoI18n(lastActive)}</div>
            }
          >
            <div className="font-normal mt-1 text-[12px] text-white">
              {getTimeAgo(lastActive * 1000, 'YYYY/MM/DD HH:mm:ss')}
            </div>
          </XTooltip.Details>
        ) : typeof lastActive === 'string' ? (
          <div className="font-normal mt-1 text-[12px]  text-[#00CE89]">{lastActive}</div>
        ) : null}
        {balance || balance === 0 ? (
          <div className="font-normal mt-1 text-white/50 text-[13px] flex items-center">
            <img src={getBlockchainLogo2(chainId)} alt="sol" className="w-3 h-3 inline-block align-top mr-1" />
            {formatBalance(balance, {
              roundMode: 'floor',
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
})

TokenOveral.displayName = 'TokenOveral'

// export const TokenOveral = memo(TokenOveralComponent)
