import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TokenDetail } from '@/@generated/gql/graphql-future'
import { TokenPortrait } from '@/@generated/gql/graphql-core.ts'
import { getLaunchpad } from '@/utils/helpers.ts'
import useWatchLiquidity from '@hooks/useWatchLiquidity.ts'
import { ChainIds } from '@/types/enums.ts'
import { isBlackListTokenAddress } from '@/utils/token.ts'

export interface TokenAlertProps {
  tokenPortrait?: TokenPortrait
  tokenData?: TokenDetail
}

export const TokenAlert = (props: TokenAlertProps) => {
  const { tokenPortrait, tokenData } = props
  // const isMigrated = tokenData?.isMigrated
  const chainId = tokenData?.chainId
  const address = tokenData?.address
  const [isLowLiquidity, setIsLowLiquidity] = useState(false)
  const launchpad = getLaunchpad(tokenData?.dexes ?? [])
  const [isShow, setIsShow] = useState(true)
  const { t } = useTranslation()
  const { dataLp, isLowLp } = useWatchLiquidity({
    token: tokenData?.address ?? '',
    chainId: chainId ?? ChainIds.Solana,
  })
  const [liquidity, setLiquidity] = useState<number | undefined>(0)
  const isBlackListed = isBlackListTokenAddress(address)

  useEffect(() => {
    const hasDataLp = liquidity !== null && liquidity !== undefined

    if (!hasDataLp) return

    // Normalize liquidity
    const numericLp = typeof liquidity === 'number' ? liquidity : hasDataLp ? Number(liquidity) : undefined

    const lowLpFromData = typeof numericLp === 'number' && !Number.isNaN(numericLp) ? numericLp < 4000 : undefined

    // Priority: message flag > numeric lp > default false
    setIsLowLiquidity(isLowLp ?? lowLpFromData ?? false)
  }, [isLowLp, liquidity])

  useEffect(() => {
    if (tokenData?.liquidity) {
      setLiquidity(tokenData?.liquidity)
    }
  }, [tokenData?.liquidity])
  useEffect(() => {
    if (dataLp) {
      setLiquidity(Number(dataLp))
    }
  }, [dataLp])
  useEffect(() => {
    setIsLowLiquidity(tokenPortrait?.lowLiquidity ?? false)
  }, [tokenPortrait])

  const showNotify = (isBlackList: boolean) => {
    return (
      <div className="bg-[linear-gradient(90deg,#ff273d33_0%,#ff273d14_100%)] flex items-center justify-between px-2.5 py-2 lg:px-3 rounded-[4px]">
        <div className="flex items-center">
          <img src="/images/icons/danger.svg" alt="icon alert" className="w-[14px] h-[14px]" />
          <div className="text-white text-[calc(12rem/16)] ml-2 leading-4 lg:text-[13px] font-[330]">
            {isBlackList ? t('detail.alert.tokenNotSupportToTrade') : t('detail.alert.lowLiquidity')}
          </div>
        </div>

        <img
          src="/images/icons/icon-x.svg"
          alt="icon close"
          className="w-5 h-5 cursor-pointer"
          onClick={() => setIsShow(false)}
        />
      </div>
    )
  }

  const isShowLiquid = (isLowLiquidity && !!launchpad) || (isLowLiquidity && !launchpad)
  if (isShow && isBlackListed) return showNotify(true)
  if (isShow && isShowLiquid) {
    return showNotify(false)
  }

  return null
}
