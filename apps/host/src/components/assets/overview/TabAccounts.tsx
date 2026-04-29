import { APP_PATH } from '@/lib/constant.ts'
import { formatBalance } from '@/lib/format'
import { cn } from '@/lib/utils.ts'
import { useAppSelector } from '@/redux/store'
import { AssetOverviewContext } from '@components/assets/overview/AssetOverviewContext.tsx'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

type Section = {
  title: string
  value: number | string
  onClick?: () => void
}

export const TabAccounts = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hideBalance, walletBalanceData, futuresBalance } = useContext(AssetOverviewContext)
  const headerTab = useAppSelector((state) => state.router.headerTab)

  const isDex = headerTab === 'crypto'

  const fundingBalance = useMemo(() => {
    if (!walletBalanceData) return 0
    return walletBalanceData.funding?.reduce((acc, cur) => {
      return acc + parseFloat(cur.usdBalance || '0')
    }, 0)
  }, [walletBalanceData])

  const fututresBalance = useMemo(() => {
    if (!walletBalanceData && !futuresBalance) return 0
    if (!walletBalanceData && futuresBalance) {
      return futuresBalance
    }
    return futuresBalance
      ? futuresBalance
      : walletBalanceData?.futures?.reduce((acc, cur) => {
          return acc + parseFloat(cur.usdBalance || '0')
        }, 0)
  }, [walletBalanceData, futuresBalance])

  const sections: Section[] = useMemo(() => {
    const assetsPath = isDex ? APP_PATH.ASSETS : APP_PATH.ASSETS
    return [
      {
        title: t('assets.futures.title'),
        value: Number(fututresBalance),
        onClick: () => {
          navigate(assetsPath + '?page=futures')
        },
      },
      {
        title: t('assets.funding.title'),
        value: Number(fundingBalance),
        onClick: () => {
          navigate(assetsPath + '?page=funding')
        },
      },
    ]
  }, [fundingBalance, fututresBalance])

  return (
    <div className="mt-3.75 px-2.5 space-y-2 ">
      {sections.map((section, index) => (
        <div
          key={index}
          className="rounded-[10px] p-3.5 cursor-pointer bg-[#18181B] transition-colors duration-200 flex items-center justify-between"
          onClick={section.onClick}
        >
          <div>
            <div className="font-semibold text-[16px] leading-5.5 text-white">{section.title}</div>
            <div className="font-normal text-[12px] leading-5.5 text-[#908E98]">
              {hideBalance
                ? '******'
                : typeof section.value === 'number'
                  ? formatBalance(section.value, {
                      showCurrency: true,
                      roundMode: 'floor',
                    })
                  : section.value}
            </div>
          </div>
          <img className="-rotate-90 size-6" src="/images/assets/arrow-down.svg" alt="" />
        </div>
      ))}
    </div>
  )
}
