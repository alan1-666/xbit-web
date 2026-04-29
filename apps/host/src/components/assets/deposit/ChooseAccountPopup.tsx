import { useNavigate } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant'
import BottomSheet from '@/components/common/BottomSheet'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { _activeWallet } from '@/redux/modules/newWallet.slice'
import { ChainIds } from '@/types/enums.ts'

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
}

const ChooseAccountPopup = ({ open, setOpen }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeWallet = useSelector(_activeWallet)

  const depositTypes = [
    {
      type: 'qr',
      name: t('assets.deposit.transferTitle'),
      subtitle: t('assets.deposit.transferDescription'),
      icon: '/images/icons/transfer.svg',
      onClick: () => {
        const toToken = activeWallet.chainId === ChainIds.Bsc ? 'BNB' : 'SOL'
        navigate(`${APP_PATH.CRYPTO_DEPOSIT}?source=funding&toToken=${toToken}`)
      },
    },
    {
      type: 'deposit',
      name: t('assets.deposit.depositTitle'),
      subtitle: t('assets.deposit.depositDescription'),
      icon: '/images/icons/deposit.svg',
      onClick: () => {
        const depositType = activeWallet.chainId === ChainIds.Bsc ? 'BNB' : 'SOL'
        navigate(`${APP_PATH.DEPOSIT}`, {
          state: { type: depositType, wallet: activeWallet.walletAddress, from: 'detail' },
        })
      },
    },
  ]

  return (
    <BottomSheet open={open} setOpen={setOpen} title={t('assets.deposit.title')}>
      <slot>
        <div className="mt-6 flex flex-col gap-3">
          {depositTypes.map((type) => (
            <div
              key={type.type}
              className="flex items-center justify-between p-3 rounded-[8px] border-gradient border-[0.5px] border-[#ECECED1F] before:invisible hover:before:visible  cursor-pointer"
              onClick={type.onClick}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-[#ECECED14]">
                  <img src={type.icon} alt="icon" />
                </div>
                <div className="text-white flex-1">
                  <div className="font-medium text-[calc(16rem/16)] leading-4 mb-2">{type.name}</div>
                  <div className="text-[calc(13rem/16)] leading-[13px] text-[#FFFFFFB2]">{type.subtitle}</div>
                </div>
              </div>
              <img src="/images/icons/arrow-right.svg" className="h-4 w-4" alt="arrow-right" />
            </div>
          ))}
        </div>
      </slot>
    </BottomSheet>
  )
}

export default ChooseAccountPopup
