import { Button } from '@/components/ui/button'
import ButtonTelegram from '@components/common/LoginSection/ButtonTelegram.tsx'
import ButtonWallet from '@components/common/LoginSection/ButtonWallet.tsx'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FuturesAssetOverview } from './FuturesAssetOverview'
import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { cn } from '@/lib/utils'
import { MessageDrawer } from '@components/transfer/drawer/MessageDrawer'

export interface BaseAssetsHeaderProps {
  hideBalance: boolean
  setHideBalance: (value: boolean) => void
  walletName: ReactNode
  futuresBalance: number
  allAssetBalances: any
}

export const AssetsHeader = (props: BaseAssetsHeaderProps) => {
  const { hideBalance, setHideBalance, walletName, futuresBalance, allAssetBalances } = props
  const navigate = useNavigate()
  const activeWallet = useSelector(_activeWallet)
  const { t } = useTranslation()
  const [openDrawer, setOpenDrawer] = useState(false)

  if (!activeWallet.isConnected) {
    return (
      <div className="mt-10 flex items-center justify-center gap-3">
        <ButtonTelegram />
        <ButtonWallet />
      </div>
    )
  }
  const assetsNav = [
    {
      key: 'withdraw',
      icon: '/images/icons/withdraw.svg',
      title: t('assets.withdraw.withdrawLabel'),
    },
    {
      key: 'transfer',
      icon: '/images/icons/transfer.svg',
      title: t('assets.transfer'),
      // disabled: true,
    },
  ]

  const handleOnItemClicked = (key: string) => {
    switch (key) {
      case 'withdraw':
        setOpenDrawer(true)
        break
      case 'transfer':
        navigate(`${APP_PATH.CRYPTO_DEPOSIT}?source=futures`, { state: { walletBalances: allAssetBalances } })
        break
      default:
        break
    }
  }

  return (
    <>
      <div className="mt-4">
        <FuturesAssetOverview
          hideBalance={hideBalance}
          setHideBalance={setHideBalance}
          walletName={walletName}
          futuresBalance={futuresBalance}
        />
      </div>
      <div className="mt-4 flex items-center justify-center gap-22">
        {assetsNav.map((item, index) => {
          // if (hiddenKeys.includes(item.key)) return null
          return (
            <div key={index} className="flex flex-col items-center">
              <div className={cn('flex items-center justify-center')} onClick={() => handleOnItemClicked(item.key)}>
                <img
                  src={item.icon}
                  alt={item.title}
                  className={cn('w-[40px] h-[40px] transition-colors duration-100')}
                />
              </div>
              <div className="mt-3 text-center font-[330] text-[14px] leading-none text-white/80">{item.title}</div>
            </div>
          )
        })}
      </div>
      <MessageDrawer
        open={openDrawer}
        type={'error'}
        buttonTitle={t('assets.transfers.goToTransfer')}
        text={t('assets.transfers.transferDescription')}
        onClose={(isBtnClick) => {
          navigate(`${APP_PATH.CRYPTO_DEPOSIT}?source=futures&action=withdraw`, {
            state: { walletBalances: allAssetBalances },
          })
          setOpenDrawer(false)
        }}
      />
    </>
  )
}
