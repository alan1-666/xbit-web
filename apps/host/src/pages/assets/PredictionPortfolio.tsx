import SelectHistory from '@/components/assets/history/SelectHistory'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useResponsive } from '@/hooks/useResponsive'
import { APP_PATH } from '@/lib/constant'
import { NAVIGATIONS } from '@/lib/navigations'
import { PortfolioContent } from '@/modules/prediction/components/portfolio/PortfolioContent'
import { PortfolioProvider } from '@/modules/prediction/context/PortfolioContext'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

const PredictionPortfolio = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { chainId, wallet } = location.state || {}
  const { isDesktop } = useResponsive()
  const [openSelectHistory, setOpenSelectHistory] = useState(false)

  useEffect(() => {
    if (isDesktop) {
      navigate(NAVIGATIONS.prediction.assets() + '?page=prediction')
    }
  }, [isDesktop, navigate])

  return (
    <PortfolioProvider>
      <TooltipProvider>
        <div className="flex h-screen flex-col overflow-hidden bg-[#0A0A0A] text-white">
          <div className="flex items-center justify-between">
            <div className="max-w-3xl mx-auto flex items-center justify-between w-full p-4">
              <div className="w-24">
                <img
                  src="/images/icons/arrow-left.svg"
                  className="w-6 h-6 cursor-pointer"
                  alt="arrow-left"
                  onClick={() => {
                    const page = new URLSearchParams(location?.search).get('page')
                    const path = page ? APP_PATH.ASSETS + `/${page}` : APP_PATH.ASSETS
                    const searchParams = new URLSearchParams()
                    if (page) {
                      searchParams.set('main', page)
                    }
                    const url = `${path}?${searchParams.toString()}`
                    navigate(url, {
                      state: { chainId, wallet },
                    })
                  }}
                />
              </div>
              <div
                className="flex gap-1 items-center cursor-pointer"
                onClick={() => {
                  setOpenSelectHistory(true)
                }}
              >
                <div className="text-[calc(18rem/16)] leading-6 font-medium flex items-center gap-2">
                  <span className="whitespace-nowrap">{t('assets.history.tradeHistory')}</span>
                  <img src="/images/icons/arrow-down3.svg" className="w-3" alt="arrow-down" />
                </div>
              </div>
              <div className="w-24 flex items-center justify-end"></div>
            </div>
          </div>
          <div className="h-full overflow-hidden">
            <div className="_hidescrollbar h-full overflow-y-auto">
              <PortfolioContent />
            </div>
          </div>
        </div>
        <SelectHistory
          open={openSelectHistory}
          setOpen={setOpenSelectHistory}
          onSelected={(type: string) => {
            if (type === 'assetHistory') {
              navigate(APP_PATH.ASSET_HISTORY + `?page=prediction`, {
                state: { wallet, chainId },
              })
            } else if (type === 'tradeHistory') {
              navigate(APP_PATH.PREDICTION_PORTFOLIO + '?page=prediction')
            }
          }}
        />
      </TooltipProvider>
    </PortfolioProvider>
  )
}

export default PredictionPortfolio
