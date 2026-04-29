import BoxTitle from './BoxTitle'
import BoxWithGradient from './BoxWithGradient'
import { useContext, useState } from 'react'
import ChainCurrencyIcon from '@/components/common/ChainCurrencyIcon'

import { cn } from '@/lib/utils'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { useTranslation } from 'react-i18next'

const CryptoBox = () => {
  const { hideBalance } = useContext(AssetOverviewContext)
  const [boxIsExpand, setBoxIsExpand] = useState<boolean>(true)
  const { t } = useTranslation()

  const handleBoxExpandChange = (status: boolean) => {
    setBoxIsExpand(status)
  }

  return (
    <BoxWithGradient
      containerClassName="mb-2"
      isExpand={boxIsExpand}
      header={
        <BoxTitle
          title="Meme"
          value={!hideBalance ? '$6162.83' : '***'}
          defaultExpand={true}
          onExpandChange={handleBoxExpandChange}
        />
      }
      content={
        <div>
          <div className="flex items-center justify-between text-[#FFFFFF80] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]">
            <span>
              {t('assets.overview.price')}/{t('assets.overview.change')}
            </span>
            <span>
              {t('assets.overview.amount')} / {t('assets.overview.cost')}
            </span>
          </div>

          {Array.from({ length: 3 }).map((_, index) => {
            return (
              <div
                key={index}
                className={cn(
                  'flex gap-2 py-4 items-center justify-between',
                  index === 3 ? '' : 'border-b-[0.5px] border-solid border-[#ECECED14]',
                )}
              >
                <div className="flex items-center">
                  <ChainCurrencyIcon
                    chainIcon={'/images/solana.webp'}
                    currencyIcon={'/images/tokenDetail/trump.webp'}
                  />
                  <div>
                    <div className="flex items-center mb-1.5">
                      <div className="mr-1 text-[calc(14rem/16)] leading-[calc(14rem/16)]">SOL</div>
                    </div>

                    <div className="text-[calc(13rem/16)] leading-[calc(13rem/16)]">
                      <span className="text-[#FFFFFFB2] mr-1.5">{!hideBalance ? '$120.34' : '***'}</span>
                      <span className="text-fall">{!hideBalance ? '-2.23%' : '***'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[calc(1rem*(16/16))] leading-[calc(1rem*(16/16))] text-[#FFFFFF] font-bold mb-1">
                    {!hideBalance ? '1.9283' : '***'}
                  </p>
                  <p className="text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] text-[#FFFFFFB2]">
                    {!hideBalance ? '+12.34K' : '***'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      }
    />
  )
}
export default CryptoBox
