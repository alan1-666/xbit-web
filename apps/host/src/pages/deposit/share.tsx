import { QRCodeCanvas } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChainIds } from '@/types/enums.ts'
import { toast } from 'sonner'
import { IconInfo } from '@components/icon/stroke/iconInfo.tsx'
import { useMemo, useState } from 'react'
import { MinimumDepositWarningDrawer } from '@components/assets/deposit/MinimumDepositWarningDrawer.tsx'
import { APP_PATH } from '@/lib/constant.ts'

const tokenLogoMap: Record<string, string> = {
  SOL: '/images/icons/chains/ic-solana.svg',
  USDC: '/images/icons/chains/ic-usdc.svg',
  ETH: '/images/icons/chains/ic-ethereum.svg',
  'ARB-ETH': '/images/icons/chains/ic-ethereum.svg',
}

const tokenNameMap: Record<string, string> = {
  SOL: 'SOL',
  USDC: 'USDC',
  ETH: 'ETH',
  'ARB-ETH': 'ETH',
  BNB: 'BNB',
}

export const DepositSharePage = () => {
  const [openMinimumWarning, setOpenMinimumWarning] = useState(false)
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const address = searchParams.get('address') || ''
  const token = searchParams.get('token') || ''
  const chainId = Number(searchParams.get('chain') || '') as ChainIds
  const warningMessage = useMemo(() => {
    if (chainId === ChainIds.Ethereum) {
      return t('assets.deposit.warningEthereum')
    }
    if (chainId === ChainIds.Solana) {
      return t('assets.deposit.warningSolana')
    }
    if (chainId === ChainIds.Arbitrum) {
      return t('assets.deposit.warningArbitrum', { token: tokenNameMap[token] })
    }
    return ''
  }, [chainId, t])
  const navigate = useNavigate()
  return (
    <div className="pt-14 px-3">
      <div className="flex items-center justify-between fixed top-0 left-0 w-full p-3 z-10 bg-[#0A0A0A]">
        <div className="max-w-[768px] w-full mx-auto flex items-center justify-between">
          <div className="w-24">
            <img
              src="/images/icons/arrow-left.svg"
              className="w-6 h-6 cursor-pointer"
              alt="arrow-left"
              onClick={() => {
                navigate(APP_PATH.ASSETS, { replace: true})
              }}
            />
          </div>
          <div className="text-white text-[calc(20rem/16)] font-medium">{t('assets.deposit.title')}</div>
          <div className="w-24" />
        </div>
      </div>
      {/*<div className="bg-[#232329] border-gradient border-[0.5px] flex items-center flex-col justify-center mx-auto mt-10 w-fit pointer-events-none">*/}
      {/*  <div className="flex flex-col items-center gap-4 p-4 bg-[url('/images/share-bg.png')] bg-cover bg-center">*/}
      {/*    <div className="text-white text-[calc(20rem/16)]">{t('assets.deposit.depositXbitWallet')}</div>*/}
      {/*    <QRCodeCanvas*/}
      {/*      value={address || ''}*/}
      {/*      size={248}*/}
      {/*      marginSize={2}*/}
      {/*      imageSettings={{*/}
      {/*        src: tokenLogoMap[token],*/}
      {/*        height: 35,*/}
      {/*        width: 35,*/}
      {/*        excavate: true,*/}
      {/*      }}*/}
      {/*      className="rounded-[10px]"*/}
      {/*    />*/}
      {/*    <div className="flex items-center justify-center gap-2">*/}
      {/*      <div className="text-[calc(14rem/16)] font-[350]">{t('assets.deposit.network')}</div>*/}
      {/*      <div className="bg-[#ECECED14] rounded-full py-1 pl-1.5 pr-2 flex items-center gap-1">*/}
      {/*        <div className="size-4.5 p-1 bg-black rounded-full">*/}
      {/*          <img src={chainIconMap[chainId]} alt="" className="size-full" />*/}
      {/*        </div>*/}
      {/*        <div className="text-white font-[350] text-[calc(13rem/16)] leading-[calc(15rem/16)]">*/}
      {/*          {BLOCKCHAIN_NAMES[chainId]}*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*    <div>*/}
      {/*      <div className="text-[calc(14rem/16)] font-[350]">{t('assets.deposit.walletAddress')}</div>*/}
      {/*      <div className="break-all text-[calc(14rem/16)] font-[350] text-[#FFFFFFB2]">{address}</div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <div className="mt-6 pt-4 flex flex-col items-center gap-4 text-center">
        <div>
          <div className="mb-2 font-[450] text-[20px] text-white leading-none">
            {t('assets.deposit.title')} {tokenNameMap[token]}
          </div>
        </div>
        <QRCodeCanvas
          value={address || ''}
          size={248}
          marginSize={2}
          imageSettings={{
            src: tokenLogoMap[token],
            height: 35,
            width: 35,
            excavate: true,
          }}
          className="rounded-[10px]"
        />
      </div>
      <div className="mt-4 bg-gradient-to-r from-[#FF1D1D1A] to-[#BB00351A] flex items-center gap-1.5 rounded-lg p-2">
        <img src="/images/icons/danger.svg" alt="danger" className="w-4 h-4" />
        <div className="font-[350] text-[11px] text-white leading-[1.5]">{warningMessage}</div>
      </div>
      <div className="mt-4 bg-[#ECECED14] rounded-lg px-2.5 py-2">
        <div className="font-[350] text-[#FFFFFF80] text-[calc(13rem/16)]">{t('assets.deposit.address')}</div>
        <div className=" flex items-center justify-between gap-4">
          <span className="font-[350] text-[13px] text-white leading-[1.5] break-all flex-1">{address}</span>
          <div className="h-8 w-8 bg-[#FFFFFF14] rounded-full flex items-center justify-center cursor-pointer">
            <img
              src="/images/icons/copy2.svg?v=2"
              className="w-4 h-4 hover:scale-110"
              alt="copy"
              onClick={() => {
                navigator.clipboard.writeText(address || '').then()
                toast.success(t('assets.deposit.copyWalletAddress'))
              }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {chainId === ChainIds.Arbitrum && token === 'USDC' && (
          <div className="flex items-center justify-between">
            <div
              className="text-[#FFFFFFB2] text-[calc(12rem/16)] flex items-center gap-1 cursor-pointer"
              onClick={() => setOpenMinimumWarning(true)}
            >
              <span>{t('assets.deposit.minimumDepositAmount')}</span>
              <IconInfo />
            </div>
            <div className="text-white text-[calc(12rem/16)] font-medium">{t('assets.deposit.minimumUsdcAmount')}</div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{t('assets.deposit.arrivalTime')}</div>
          <div className="text-white text-[calc(12rem/16)] font-medium">{t('assets.deposit.aboutOneMinute')}</div>
        </div>
        {chainId === ChainIds.Arbitrum && token === 'USDC' && (
          <div className="flex items-center justify-between">
            <div className="text-[#FFFFFFB2] text-[calc(12rem/16)]">{t('assets.deposit.withdrawalTime')}</div>
            <div className="text-white text-[calc(12rem/16)] font-medium">{t('assets.deposit.aboutTwoMinutes')}</div>
          </div>
        )}
      </div>
      <MinimumDepositWarningDrawer open={openMinimumWarning} setOpen={setOpenMinimumWarning} />
    </div>
  )
}
