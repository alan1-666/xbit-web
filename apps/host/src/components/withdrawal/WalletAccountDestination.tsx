import { useAppSelector } from '@/redux/store'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const WalletAccountDestination = () => {
  const activeChain = useAppSelector((state) => state.wallet.activeChain)

  const wallets = useAppSelector((state) => state.wallet.wallets)

  const { t } = useTranslation()

  const { walletIcon, walletName } = useMemo(() => {
    const wallet = wallets[activeChain].chain
    const walletIcon = wallet.walletInfo.icon
    const walletName = wallet.walletInfo.name
    return {
      walletIcon,
      walletName,
    }
  }, [wallets, activeChain])

  return (
    <div>
      <h1 className="text-[calc(15rem/16)] mb-2">{t('assets.withdrawal.tokenRecipientAddress', { token: 'USDC' })}</h1>
      <div className="border border-[#ECECED14] bg-[#2323290A] px-3 py-3.5 rounded-[8px] mb-4">
        <div className="flex items-center text-[calc(14rem/16)] text-[#FFFFFFB2] mb-3">
          <img src={walletIcon} alt="" className="size-5 mr-2" />
          <span>{t('assets.withdrawal.wallet', { name: walletName })}</span>
        </div>
        <div className="text-[calc(13rem/16)] break-all">5Cyp5AsCTVzTcYVmqbqHh2Hx3YETxkKNk6kwJgS8CHD8</div>
      </div>
    </div>
  )
}
