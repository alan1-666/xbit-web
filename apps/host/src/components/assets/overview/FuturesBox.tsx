import BoxTitle from './BoxTitle'
import BoxWithGradient from './BoxWithGradient'
import Tag from '@/components/common/Tag'
import { useContext, useState } from 'react'
import { cn } from '@/lib/utils'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { useTranslation } from 'react-i18next'

const FuturesBox = () => {
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
          title={t('assets.overview.futures')}
          value={!hideBalance ? '$589.82' : '***'}
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
            <span>{t('assets.overview.pnl')}</span>
          </div>

          {Array.from({ length: 4 }).map((_, index) => {
            return (
              <div
                key={index}
                className={cn(
                  'flex gap-2 py-4 items-center justify-between',
                  index === 3 ? '' : 'border-b-[0.5px] border-solid border-[#ECECED14]',
                )}
              >
                <div className="flex items-center">
                  <img className="size-8 mr-2.5" src="/images/futuresDetail/usdt.png" alt="" />
                  <div>
                    <div className="flex items-center mb-1.5">
                      <div className="mr-1 text-[calc(14rem/16)] leading-[calc(14rem/16)]">
                        {t('assets.overview.perpetual', { pair: 'BTCUSDT' })}
                      </div>
                      <Tag
                        label={t('assets.overview.long')}
                        color="#00FFB4"
                        containerClassName="rounded-[4px] px-1 py-0.75 mr-1.5"
                      />

                      <Tag
                        label={`${t('assets.overview.cross')} 100x`}
                        color="#FFFFFF80"
                        containerClassName=" bg-transparent rounded-[4px] px-1 py-0.75"
                      />
                    </div>

                    <div className="text-[calc(13rem/16)] leading-[calc(13rem/16)]">
                      <span className="text-[#FFFFFFB2] mr-1.5">{!hideBalance ? '5,233.12' : '***'}</span>
                      <span className="text-rise">{!hideBalance ? '+5.67%' : '***'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[calc(1rem*(16/16))] leading-[calc(1rem*(16/16))] text-rise font-bold mb-1">
                    {!hideBalance ? '$3,302.12' : '***'}
                  </p>
                  <p className="text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))] text-rise">
                    {!hideBalance ? '+0.55%' : '***'}
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
export default FuturesBox
