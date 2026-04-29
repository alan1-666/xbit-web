import { useWallet as useSolanaWallet, useWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader } from '../common/MoneyFormatted'
import { Button } from '../ui/button'
import { useSession } from '@walletconnect/modal-sign-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { IconTrust } from '../icon/stroke'

const DialogLoadingConnectWallet = ({
  loading,
  setLoading,
  nameWallet,
  error,
  setError,
  handleConnect,
}: {
  loading: boolean
  setLoading: (loading: boolean) => void
  nameWallet: string | null
  error: string | null
  setError: any
  handleConnect: any
}) => {
  const { wallets, select } = useWallet()
  const wallet = wallets.find((item) => item.adapter.name === nameWallet)
  const solanaWallet = useSolanaWallet()
  const { t } = useTranslation()
  // const { walletInfo } = useWalletInfo('solana')
  const session = useSession()

  useEffect(() => {
    if (error) {
      solanaWallet.disconnect()
    }
  }, [error])

  const getLogoWallet = () => {
    if (!!wallet?.adapter?.icon) {
      return wallet?.adapter?.icon
    }
    return session?.peer?.metadata?.icons?.[0]
  }

  return (
    <Dialog open={loading} onOpenChange={setLoading}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="w-full bg-[#232329] max-w-[768px] mx-auto text-center">
        {/* <DialogHeader className="py-2.5 px-2.5 flex w-full items-center justify-between">
          <img
            src="/images/icons/arrow-left.svg"
            className="w-6 h-6 cursor-pointer"
            alt="arrow-left"
            onClick={() => setLoading(false)}
          />
          <img
            src="/images/icons/icon-x.svg"
            className="w-6 h-6 cursor-pointer"
            onClick={() => setLoading(false)}
            alt=""
          />
        </DialogHeader> */}
        <DialogTitle></DialogTitle>
        <div className="flex items-center justify-center gap-5 h-full mt-4">
          <img src="/images/kairox-logo-rounded.svg" className="w-14 h-14" alt="xbit logo" />
          <img src="/images/wallets/icon_next.svg?v=2" className="w-5 h-5" alt="icon next" />
          {nameWallet === 'Trust' ? (
            <IconTrust className="w-14 h-14 rounded-[16px]" />
          ) : (
            <img src={getLogoWallet()} className="w-14 h-14 rounded-[16px]" alt="wallet logo" />
          )}
        </div>
        <div className="flex justify-center items-center gap-1 text-sm leading-none text-white/80 mt-5">
          {error ? (
            <>
              <img src="/images/wallets/icon-x.svg" className="w-4.5 h-4.5" alt="icon x" />
              <p className="text-[#f23f58]">{t('wallet.failToConnect')}</p>
            </>
          ) : (
            <>
              <p>{t('wallet.connectingWallet')}</p>
              <Loader />
            </>
          )}
        </div>
        {error ? (
          <Button
            className="bg-[#6A2AE0] rounded-[200px] w-full max-w-[300px] mx-auto h-11 mt-10 mb-14 text-[#FFFFFF] text-base"
            onClick={() => {
              setError(null)
              handleConnect(nameWallet)
            }}
          >
            {t('wallet.reconnect')}
          </Button>
        ) : (
          // <p className="text-sm leading-none text-white/80 my-14">{t('wallet.confirmWallet')}</p>
          <p className="text-sm leading-none text-white/80 my-4">
            {t('wallet.newConfirmWallet', {
              walletName: nameWallet ? nameWallet : 'Wallet',
            })}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DialogLoadingConnectWallet
