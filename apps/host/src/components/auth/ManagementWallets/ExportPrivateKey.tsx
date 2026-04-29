import { useEffect, useMemo, useState } from 'react'
import { Button } from '@components/ui/button.tsx'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@components/ui/drawer.tsx'
import { CopyButton } from '@/components/common/copy-button'
import { ChainType, UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { IconEyeSlash } from '@/components/icon'
import { _activeWallet, mappedTypeChain } from '@/redux/modules/newWallet.slice'
import SecurityCheckModal, { VefiryWalletResponse } from '../WalletBackup/SecurityCheckModal'
import { useTranslation } from 'react-i18next'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { useAppSelector } from '@/redux/store'
import { LIST_CHAIN_SUPPORTED, SupportedChain, TYPE_CHAIN } from '@/lib/blockchain'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive.ts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip.tsx'
import { IconKey } from '@components/icon'
import eventBus from '@/lib/eventBus.ts'
import { BACK_UP_MNEMONIC_STORAGE_KEY, OPEN_BACKUP_MODAL } from '@const/configs.ts'
import ConfirmClose from '@components/assets/notice/ConfirmClose.tsx'
import { useConfirmAssetBackup } from '@hooks/useCheckUserDeprecatedAsset.ts'

const ExportPrivateKey = ({ wallet, type }: { wallet: UserEmbeddedWalletDto; type?: 'button' | 'icon' | 'hidden' }) => {
  const { t } = useTranslation()
  const { isDesktop } = useResponsive()
  const [open, setOpen] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [openConfirmClose, setOpenConfirmClose] = useState(false)
  const [isShowPrivateKey, setIsShowPrivateKey] = useState(false)
  const activeChain = useAppSelector((state) => state.newWallet.activeChain)
  const [privateKey, setPrivateKey] = useState('')
  const handleVerifiedWallet = (response: VefiryWalletResponse) => {
    if (response?.privateKey) {
      let privateKey = response.privateKey
      if (wallet.chain === ChainType.Solana) {
        const seed = Uint8Array.from(Buffer.from(response.privateKey, 'hex'))
        const keypair = Keypair.fromSeed(seed)
        privateKey = bs58.encode(keypair.secretKey)
      }

      setOpen(false)
      setPrivateKey(privateKey)
      setOpenDrawer(true)
    }
  }

  const activeChainInfo = useMemo(() => {
    return LIST_CHAIN_SUPPORTED.find((item: SupportedChain) => mappedTypeChain(item.value) === wallet?.chain)
  }, [activeChain])

  const { mutate } = useConfirmAssetBackup()

  const handleSavePrivateKey = () => {
    setOpenDrawer(false)
    localStorage.setItem(BACK_UP_MNEMONIC_STORAGE_KEY, 'true')
    if (type === 'hidden') mutate()
  }

  const renderContent = () => {
    return (
      <div className="p-2.5 md:w-[768px]">
        <div className="flex items-center gap-2 w-full py-2.5 px-3.5 bg-[#ececed14] rounded-[8px]">
          <img
            src={activeChainInfo?.value === TYPE_CHAIN.SOLANA ? '/images/icons/ic-solana.svg' : activeChainInfo?.img}
            // src={activeChainInfo?.img}
            className="w-6 h-6 cursor-pointer"
            alt="arrow-left"
            onClick={() => setOpenDrawer(false)}
          />
          <p className="text-[14px] font-[380] text-white">{activeChainInfo?.label}</p>
        </div>
        <div className="mt-6">
          <p className="text-[13px] leading-none text-white/70">{t('walletBackup.exportPrivateKey.walletAddress')}</p>
          <div className="flex items-start justify-between gap-4 w-full py-2 px-2.5 bg-[#ececed14] mt-2.5 rounded-[8px]">
            <p className="text-[15px] font-medium text-white break-words line-clamp-3">{wallet?.walletAddress}</p>
            <div className="w-8 h-8 bg-[#ffffff14] flex items-center justify-center rounded-full shrink-0">
              <CopyButton text={wallet?.walletAddress} icon="/images/icons/ic-copy-green.svg" className="size-4!" />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between h-7">
            <p className="text-[13px] leading-none text-white/70">{t('walletBackup.exportPrivateKey.plaintext')}</p>
            {isShowPrivateKey && (
              <div
                className="flex items-center justify-center p-[7px] rounded-[200px] bg-[#ececed1f] gap-1 cursor-pointer"
                onClick={() => setIsShowPrivateKey(false)}
              >
                <p className="text-[14px] leading-none text-white/70">{t('walletBackup.exportPrivateKey.hide')}</p>
                <IconEyeSlash className="!size-3.5" />
              </div>
            )}
          </div>
          <div className="bg-[#ececed0a] mt-2.5 rounded-[8px] h-[144px] w-full">
            {isShowPrivateKey ? (
              <div className="flex gap-4 p-2.5 items-start">
                <div className="flex-1 break-words overflow-hidden">
                  <p className="text-[15px] text-white font-medium leading-normal break-words line-clamp-3">
                    {privateKey}
                  </p>
                </div>
                <div className="w-8 h-8 bg-[#ffffff14] flex items-center justify-center rounded-full shrink-0">
                  <CopyButton text={privateKey} icon="/images/icons/ic-copy-green.svg" className="!size-4" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-col h-full">
                <div className="w-16 h-16 flex items-center justify-center" onClick={() => setIsShowPrivateKey(true)}>
                  <img
                    src="/images/icons/ic-eye-slash.svg"
                    className="cursor-pointer"
                    alt="arrow-left"
                    // onClick={() => setOpenDrawer(false)}
                  />
                </div>
                <p className="text-[12px] text-white/65 leading-none">
                  {t('walletBackup.exportPrivateKey.viewMnemonic')}
                </p>
                <p className="text-[12px] text-white/65 leading-none mt-1.5">
                  {t('walletBackup.exportPrivateKey.confirmText')}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2.5 flex items-center bg-[#ececed0f] p-2.5 gap-1.5 rounded-[8px]">
          <img src="/images/tokenDetail/icon-danger.svg" className="w-4 h-4" alt="arrow-left" />
          <p className="text-[11px] font-medium text-white leading-none">
            {t('walletBackup.exportPrivateKey.ignoreLeaked')}
          </p>
        </div>
      </div>
    )
  }

  const renderChildren = () => {
    if (type === 'hidden') return null
    if (type === 'icon')
      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="size-4 text-[#79778C] hover:text-white" onClick={() => setOpen(true)}>
                <IconKey className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#212127] p-2 border border-[#79778C29] rounded-md font-[330] text-[12px] leading-1.5 text-[#908E98]">
              {t('walletBackup.exportPK.button')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    return (
      <div>
        <Button
          className="bg-[#ECECED1F] font-[350] text-white/80 text-[13px] leading-none rounded-[50px] hidden sm:block"
          onClick={() => setOpen(true)}
        >
          {t('walletBackup.exportPK.button')}
        </Button>
        <Button
          className="bg-[#ECECED1F] font-[350] text-white/80 text-[13px] leading-none rounded-[50px] block sm:hidden"
          onClick={() => setOpen(true)}
        >
          {t('walletBackup.exportPK.button')}
        </Button>
      </div>
    )
  }

  useEffect(() => {
    const openDrawerFn = () => {
      setOpen(true)
    }
    eventBus.on(OPEN_BACKUP_MODAL, openDrawerFn)
    return () => {
      eventBus.remove(OPEN_BACKUP_MODAL, openDrawerFn)
    }
  }, [])

  return (
    <>
      {isDesktop ? (
        <Dialog open={openDrawer} onOpenChange={setOpenDrawer}>
          <DialogContent
            className="p-0 min-w-[768px] overflow-hidden gap-0"
            showDialogPrimitiveClose={false}
            onInteractOutside={(event) => event?.preventDefault()}
          >
            <div className="relative p-3 border-b border-[#79778C29]">
              <div className="font-normal text-center text-white text-[18px] leading-none">
                {t('walletBackup.exportPrivateKey.title')}
              </div>
              <img
                src="/images/icons/icon-x.svg"
                className="w-6 h-6 cursor-pointer absolute right-2.5 top-2.5"
                onClick={() => setOpenConfirmClose(true)}
                alt=""
              />
            </div>
            {renderContent()}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
          <DrawerContent className="w-full bg-[#0A0A0A] max-w-[768px] mx-auto pb-6 h-full">
            <DrawerTitle></DrawerTitle>
            <DrawerHeader className="flex justify-between">
              <img
                src="/images/icons/arrow-left.svg"
                className="w-6 h-6 cursor-pointer"
                alt="arrow-left"
                onClick={() => setOpenConfirmClose(true)}
              />
              <p>{t('walletBackup.exportPrivateKey.title')}</p>
              <div className="w-6 h-6"></div>
            </DrawerHeader>
            {renderContent()}
          </DrawerContent>
        </Drawer>
      )}

      <SecurityCheckModal
        showModal={open}
        setShowModal={setOpen}
        selectedWallet={wallet}
        onVerifyWallet={handleVerifiedWallet}
        type="privateKey"
        children={renderChildren()}
      />

      <ConfirmClose
        open={openConfirmClose}
        setOpen={setOpenConfirmClose}
        title={t('notice.confirmClose')}
        content={t('notice.warningBackup')}
        onConfirm={handleSavePrivateKey}
      />
    </>
  )
}

export default ExportPrivateKey
