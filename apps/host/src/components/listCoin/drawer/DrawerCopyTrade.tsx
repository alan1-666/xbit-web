import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { t } from 'i18next'
import { WalletSettingsForm } from '@/components/copy-trading/wallet-settings'
import { useResponsive } from '@/hooks/hyperliquid/useResponsive'

type IProps = {
  open: boolean
  setOpen: (open: boolean) => void
  /**
   * currentId: is id of copy trade config for edit
   */
  currentId?: string
  /**
   * leaderAddress: is address of leader, if has will show form with initial value has leaderAddress
   */
  leaderAddress?: string
  onSuccess?: () => void
}

const DrawerCopyTrade = (props: IProps) => {
  const { open, setOpen, currentId, leaderAddress, onSuccess } = props
  const { isDesktop } = useResponsive()
  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerContent
        className="right-0 left-auto top-0 bottom-0 fixed z-10 outline-none w-full min-[400px]:w-[390px] flex mt-0 border-none px-[4px] bg-[#212127] rounded-none min-[400px]:rounded-t-[10px]"
        // The gap between the edge of the screen and the drawer is 8px in this case.
        style={{ '--initial-transform': 'calc(100% + 8px)' } as React.CSSProperties}
        overlayClassName="fixed inset-0 bg-black/75"
      >
        <DrawerHeader className="flex justify-between items-center">
          <DrawerTitle className="font-normal text-[#FBFBFB] text-[15px] flex-1">
            {t('walletCopy.settings.title')}
          </DrawerTitle>

          {/* <Button variant="ghost" size="icon" className="flex items-center gap-1 w-auto">
            <ArchiveBookIcon />
            <span>{t('walletCopy.settings.tutorial')}</span>
          </Button> */}
          <DrawerClose>
            <img src="/images/icons/icon-x-white.svg" className="size-3 cursor-pointer" alt="" />
          </DrawerClose>
        </DrawerHeader>
        <div className="px-0 flex-1">
          <WalletSettingsForm
            onCancel={() => setOpen(false)}
            isPC={isDesktop}
            currentId={currentId}
            leaderAddress={leaderAddress}
            onSuccess={onSuccess}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerCopyTrade
