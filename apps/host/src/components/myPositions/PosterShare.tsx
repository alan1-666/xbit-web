import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import MoneyFormatted from '@components/common/MoneyFormatted.tsx'
import FormatedValue from '@components/common/FormatedValue.tsx'

type PosterShareProps = {
  costPrice: string | number
  returnRate: string | number
  tokenName: string
  tokenAvatar: string
  tokenLatestPrice: string | number
}

const PosterShare = forwardRef<HTMLDivElement, PosterShareProps>(
  ({ costPrice, returnRate, tokenName, tokenAvatar, tokenLatestPrice }: PosterShareProps, ref) => {
    const { t } = useTranslation()

    return (
      <div className="px-[37.5px] mt-3 mb-[17.5px]">
        <div
          className="mx-auto max-w-[375px] border-[0.5px] border-[#843BEA] rounded-[20px] bg-[#232329]"
          ref={ref}
        >
          <div className="flex flex-col items-center p-5">
            <div className="flex items-center gap-2 w-full">
              <img src={tokenAvatar} alt="token avatar" className="rounded-full size-12" />
              <h2 className="text-[#FFFFFF] text-[calc(1rem*(20/16))] font-medium my-4">{tokenName}</h2>
            </div>
            <div className="w-full mt-2 grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-2 text-white text-[13px] leading-[1] font-normal">
                <span>{t('detail.myPositions.costPrice')}</span>
                <MoneyFormatted value={costPrice} roundType="ceil" />
              </div>

              <div className="flex flex-col gap-2 text-white text-[13px] leading-[1] font-normal">
                <span>{t('detail.myPositions.returnRate')}</span>
                <span>
                  {returnRate === '--' ? (
                    '--'
                  ) : (
                    <FormatedValue value={Number(returnRate)} unit="%" maxMeaningfulDigits={2} />
                  )}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-white text-[13px] leading-[1] font-normal">
                <span>{t('chart.toolbar.price')}</span>
                <MoneyFormatted value={tokenLatestPrice} />
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-center gap-3.5 bg-[url('/images/map.png')] bg-cover bg-[#8159DE24] border-t-[0.5px] border-[#843BEA] p-3">
            <img className="w-[39px] h-[36px]" src="/images/kairox-logo.svg" alt="logo xbit" />
            <div>
              <img src="/images/kairox-logo-text.svg" alt="logo xbit text" />
              <span className="app-font-regular text-[calc(1rem*(12/16))] text-[#FFFFFFB2] leading-3 tracking-[1.63px]">
                {t('detail.myPositions.decentralizedExchange')}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

export default PosterShare
