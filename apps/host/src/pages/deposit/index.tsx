import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user.ts'
import SelectAccount from '@/components/assets/overview/SelectAccount'
import { APP_PATH } from '@/lib/constant.ts'
import { ServiceConfig } from '@/lib/gql/service-config'
import { useAppSelector } from '@/redux/store'
import { ChainIds } from '@/types/enums.ts'
import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { CopyButton } from '@components/common/copy-button.tsx'
import { useActiveWallet } from '@hooks/useActiveWallet.ts'
import { QRCodeCanvas } from 'qrcode.react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

const tokenLogoMap: Record<string, string> = {
  SOL: '/images/icons/sol-rounded-new.svg',
  BNB: '/images/bnb.svg',
  MON: '/images/icons/chains/ic-monad.svg',
}

const DepositPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const accessToken = ServiceConfig.token || ''
  const activeWallet = useActiveWallet()
  const listWalletsByChain = useAppSelector((state) => state.newWallet.listWalletsByChain as UserEmbeddedWalletDto[])
  if (!accessToken) {
    navigate(APP_PATH.ASSETS)
  }
  const { type, wallet } = useLocation().state || {}
  const [openSelectMemeAccountToDeposit, setOpenSelectMemeAccountToDeposit] = useState(false)
  const [depositType, setDepositType] = useState<string>(type || activeWallet?.chainId === ChainIds.Bsc ? 'BNB' : activeWallet?.chainId === ChainIds.Mon ? 'MON' : 'SOL')
  const [depositWallet, setDepositWallet] = useState<string>(wallet || activeWallet?.walletAddress || '')

  useEffect(() => {
    if (!type && !wallet) {
      setDepositType(activeWallet?.chainId === ChainIds.Bsc ? 'BNB' : activeWallet?.chainId === ChainIds.Mon ? 'MON' : 'SOL')
      setDepositWallet(activeWallet?.walletAddress || '')
    } else {
      setDepositType(type)
      setDepositWallet(wallet)
    }
  }, [type, wallet])

  const location = useLocation()
  const onClickBack = () => {
    if (location.state?.from === 'detail') {
      navigate(-1)
      return
    }
    let previousPath = APP_PATH.ASSETS
    if (location.state?.from) {
      const from = (location.state as any).from
      previousPath += `/${from}`
    }
    navigate(previousPath)
  }

  const depositWalletData = useMemo(() => {
    if (depositType === 'SOL') {
      return listWalletsByChain.find((wallet) => wallet.walletAddress === depositWallet)
    }
    if (depositType === 'BNB') {
      return listWalletsByChain.find((wallet) => wallet.walletAddress === depositWallet && wallet.chain === 'BSC')
    }
    if (depositType === 'MON') {
      return listWalletsByChain.find((wallet) => wallet.walletAddress === depositWallet && wallet.chain === 'MON')
    }
  }, [depositType, depositWallet, listWalletsByChain])

  return (
    <div className="flex max-h-screen h-screen pt-16 flex-col overflow-hidden bg-[#0A0A0A] text-white">
      <div className="flex items-center justify-between fixed top-0 left-0 w-full z-10 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto flex items-center justify-between w-full p-4">
          <div className="w-24">
            <img
              src="/images/icons/arrow-left.svg"
              className="w-6 h-6 cursor-pointer"
              alt="arrow-left"
              onClick={onClickBack}
            />
          </div>
          <div className="flex gap-1 items-center cursor-pointer">
            <div className="text-[calc(18rem/16)] leading-6 font-medium">{t('exchange.memeDeposit')}</div>
          </div>
          <div className="w-24 flex items-center justify-end"></div>
        </div>
      </div>

      <div className="p-4">
        <div className="font-medium text-xs text-[#908E98]">{t('exchange.selectAccount')}</div>
        <div
          className="mt-3 bg-[#18181D] p-[17.5px] rounded-[10px] flex items-center justify-between cursor-pointer"
          onClick={() => setOpenSelectMemeAccountToDeposit(true)}
        >
          <div className="flex items-center gap-2">
            <LogoWithChain logo={tokenLogoMap[depositType]} name={depositType} logoClassName="size-6 min-w-6" />
            <div className="font-medium text-[14px] leading-3.5 text-white">
              {depositType === 'BNB' ? 'BNB Chain' : depositType === 'MON' ? 'Monad' : 'Solana'}
            </div>
          </div>
          <img className="size-5" src="/images/assets/arrow-down.svg" alt="" />
        </div>

        <div className="mt-6 font-medium text-xs text-[#908E98]">{t('exchange.yourDepositAddress')}</div>
        <div className="mt-3 bg-[#18181D] px-4 py-3.5 rounded-[10px] flex justify-between items-center">
          <div className="text-base leading-6 text-white break-all">{depositWallet}</div>
          <CopyButton text={depositWallet} />
        </div>
        <div className="mt-3 font-light text-[12px] text-[#71717A] leading-4">
          {t('exchange.memeDepositNote', { network: depositType === 'BNB' ? 'BNB Chain' : depositType === 'MON' ? 'Monad' : 'Solana' })}
        </div>

        <div className="mt-6 flex justify-center">
          <div className="relative bg-white rounded-[23px] p-4 inline-block">
            <QRCodeCanvas value={depositWallet} size={142} level="H" marginSize={0} />
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={tokenLogoMap[depositType] || ''}
                alt="logo"
                className={`border-[3px] size-9 rounded-xl border-white bg-[#202024] object-contain ${depositType === 'SOL' ? 'p-0' : 'p-1'}`}
              />
            </div>
          </div>
        </div>
      </div>

      <SelectAccount
        open={openSelectMemeAccountToDeposit}
        setOpen={setOpenSelectMemeAccountToDeposit}
        onAccountSelected={(account) => {
          const { chainId, wallet } = account
          const depositType = ChainIds.Solana === chainId ? 'SOL' : ChainIds.Mon === chainId ? 'MON' : 'BNB'
          setOpenSelectMemeAccountToDeposit(false)
          setDepositType(depositType)
          setDepositWallet(wallet || '')
        }}
      />
    </div>
  )
}

export default DepositPage
