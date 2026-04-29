import BoxTitle from './BoxTitle'
import BoxWithGradient from './BoxWithGradient'
import { useContext, useState } from 'react'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { useTranslation } from 'react-i18next'

const vaultBox = () => {
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
          title={t('assets.overview.vaults')}
          value={!hideBalance ? '$1.94K' : '***'}
          defaultExpand={true}
          onExpandChange={handleBoxExpandChange}
        />
      }
      content={
        <div>
          <div className="flex items-center justify-between text-[#FFFFFF80] text-[calc(1rem*(12/16))] leading-[calc(1rem*(12/16))]">
            <span>{t('assets.overview.vaultName')}</span>
            <span>{t('assets.overview.todayPnL')}</span>
          </div>

          {Array.from({ length: 2 }).map((_, index) => {
            return (
              <div key={index} className="flex items-center justify-between gap-2 py-4">
                <div className="text-[calc(1rem*(14/16))] leading-[calc(1rem*(14/16))] text-[#FFFFFF] flex items-center font-bold">
                  <img className="size-8 mr-2.5" src="/images/futuresDetail/usdt.png" alt="icon usdt" />
                  Growi HF
                </div>
                <div className="text-[calc(1rem*(16/16))] leading-[calc(1rem*(16/16))]  font-bold text-rise">
                  {!hideBalance ? '$3,302.12' : '***'}
                </div>
              </div>
            )
          })}
        </div>
      }
    />
  )
}
export default vaultBox
