import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { cn, getPath } from '@/lib/utils.ts'
import { LabelPercentage } from '@/components/myPositions/MyPositionsCard'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { APP_PATH, CHAIN_SYMBOLS } from '@/lib/constant.ts'
import { formatMoney, getBlockchainLogo2 } from '@/utils/helpers.ts'
import chainSymbolToId from '@components/myPositions/ChainSymbolToId.ts'
import { useMemo } from 'react'
import { safeDecodeData } from '@/utils/string.ts'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'

const HoldingShare = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const dataFromSearchParams = useMemo(() => {
    const encoded = searchParams.get('data')
    if (!encoded) return {}

    try {
      const json = safeDecodeData(encoded)
      return JSON.parse(json)
    } catch (error) {
      console.error('Invalid encoded data in URL:', error)
      return {}
    }
  }, [searchParams])

  const {
    symbol,
    logoUrl,
    chainId,
    holdingQuantity,
    holdingValue,
    costPrice,
    avgMC,
    PnL,
    returnRate,
    token,
    realized,
    unrealized,
  } = dataFromSearchParams

  const chainUrl = getBlockchainLogo2(chainId ?? chainSymbolToId['sol'])

  const handleClickLogo = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    navigate(getPath(APP_PATH.MEME_TOKEN_DETAIL, { address: token, chain: CHAIN_SYMBOLS[chainId] }), {
      state: { symbol: symbol },
    })
  }

  const handleTextColor = (value: string | number) => {
    if (value === '--' || value === '0' || value === '0.00' || !isFinite(+value) || value === 0) {
      return 'text-[#FFFFFFB2]'
    } else if (+value > 0) {
      return 'text-rise'
    } else {
      return 'text-fall'
    }
  }

  return (
    <div className="w-full h-[calc(100vh-52px)] flex flex-col items-center justify-center bg-[#0A0A0A]">
      <div className="w-full flex flex-1 flex-col justify-center px-3">
        <div
          className="relative rounded-[8px] overflow-hidden p-[0.6px]"
          style={{
            background: (Number(realized) + Number(unrealized)) > 0 ? 'var(--up-card-background-gradient)' : 'var(--fall-card-background-gradient)'
          }}
        >
          {/*bg*/}
          <div className="absolute w-[calc(100%-1.2px)] h-[calc(100%-1.2px)] inset-[-1px] top-0 left-0 p-[0.6px] rounded-[8px] pointer-events-none" style={{
            background: (Number(realized) + Number(unrealized)) > 0 ? 'var(--up-border-gradient)' : 'var(--fall-border-gradient)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            WebkitMaskPosition: 'center',
          }} />
          {/*top*/}
          <div className="p-3 bg-[#141414]">
            <div className="flex items-center justify-between gap-[10px]">
              <div className="flex items-center gap-[5px] cursor-pointer" onClick={handleClickLogo}>
                <LogoWithChain logo={logoUrl} chainLogo={chainUrl} name={symbol} logoClassName={"w-[26px] h-[26px]"} />
                <div className="flex items-center gap-[4px]">
                  <div className="app-font-medium text-[calc(1rem*(14/16))] text-[#FFFFFF]">{symbol}</div>
                  <img src="/images/tokenDetail/icon-chevron-right.svg" className="w-[6px] min-w-[6px]" alt="" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 app-font-medium text-[calc(1rem*(13/16))] leading-[1]">
                <div className="text-[#FFFFFF80]">{t('detail.myPositions.profitAndLoss')}</div>
                <div
                  className={cn(
                    (Number(Number(realized) + Number(unrealized)) === 0)
                      ? 'text-[#FFFFFFB2]'
                      : Number(Number(realized) + Number(unrealized)) > 0
                        ? 'text-rise'
                        : 'text-fall',
                  )}
                >
                  <MoneyFormatted value={PnL} roundType="floor" />
                </div>
                <LabelPercentage value={returnRate} />
              </div>
            </div>
          </div>
          {/*bottom*/}
          <div className="border-t-[0.5px] border-t-[#ECECED14]">
            <div className="grid grid-cols-3 gap-x-3 gap-y-4 p-3 border-b-1 border-b-[#ECECED14] bg-[#141414]">
              <div>
                <div className="app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFB2] leading-[calc(1rem*(12/16))] mb-[6px]">
                  {t('detail.myPositions.numberOfPosition')}
                </div>
                <div className={cn('app-font-medium text-[calc(1rem*(12/16))] text-white leading-[1]')}>
                  <MoneyFormatted value={holdingQuantity} roundType="floor" showUnit={false} />
                </div>
              </div>
              <div>
                <div className="app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFB2] leading-[calc(1rem*(12/16))] mb-[6px]">
                  {t('detail.myPositions.positionValue')}
                </div>
                <div className={cn('app-font-medium text-[calc(1rem*(12/16))] text-white leading-[1]')}>
                  <MoneyFormatted value={holdingValue} roundType="floor" />
                </div>
              </div>
              <div>
                <div className="app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFB2] leading-[calc(1rem*(12/16))] mb-[6px]">
                  {t('detail.myPositions.costPrice')}
                </div>
                <div className={cn('app-font-medium text-[calc(1rem*(12/16))] text-white leading-[1]')}>
                  <MoneyFormatted value={costPrice} roundType="ceil" />
                </div>
              </div>
              <div>
                <div className="app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFB2] leading-[calc(1rem*(12/16))] mb-[6px]">
                  {t('detail.myPositions.avgBuyInMarketValue')}
                </div>
                <div className={cn('app-font-medium text-[calc(1rem*(12/16))] text-white leading-[1]')}>
                  {formatMoney(avgMC)}
                </div>
              </div>
              <div>
                <div className="app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFB2] leading-[calc(1rem*(12/16))] mb-[6px]">
                  {t('detail.holderTable.realized')}
                </div>
                <div className={cn('app-font-medium text-[calc(1rem*(12/16))] text-white leading-[1]', handleTextColor(realized))}>
                  <MoneyFormatted value={realized} roundType="floor"
                  />
                </div>
              </div>
              <div>
                <div className="app-font-regular text-[calc(1rem*(11/16))] text-[#FFFFFFB2] leading-[calc(1rem*(12/16))] mb-[6px]">
                  {t('detail.holderTable.unrealized')}
                </div>
                <div className={cn('app-font-medium text-[calc(1rem*(12/16))] text-white leading-[1]', handleTextColor(costPrice && Number(costPrice) > 0 ? unrealized : '--'))}>
                  <MoneyFormatted value={costPrice && Number(costPrice) > 0 ? unrealized : '--'} roundType="floor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className=" w-full text-center bg-[linear-gradient(90deg,_rgba(153,_69,_255,_0.1)_0%,_rgba(255,_255,_255,_0.08)_50%,_rgba(0,_243,_193,_0.1)_100%)] py-3.5">
        <div className="w-full flex items-center justify-center gap-3.5">
          <img className="w-15 h-15" src="/images/kairox-logo-rounded.svg" alt="logo xbit" />
          <div>
            <img src="/images/kairox-logo-text.svg" alt="logo xbit text" />
            <span className="app-font-regular text-[calc(1rem*(12/16))] text-[#FFFFFFB2] leading-3 tracking-[1.63px]">
              {t('detail.myPositions.decentralizedExchange')}
            </span>
          </div>
        </div>
        <div className="mt-2">{t('powerByXbit')}</div>
      </div>
    </div>
  )
}

export default HoldingShare
