import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import AppDrawer from '@components/common/AppDrawer.tsx'
import { Dispatch, SetStateAction } from 'react'
import { formatAddressWallet } from '@/lib/string.ts'
import { CopyButton } from '@components/common/copy-button.tsx'
import { cn } from '@/lib/utils.ts'
import { IconSelected } from '@components/icon/gradient/IconSelected.tsx'
import { useTranslation } from 'react-i18next'
import { formatBalanceWallet } from '@/lib/number.ts'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { chain } from 'lodash-es'
import { TYPE_CHAIN } from '@/lib/blockchain'
import { ACCOUNT_TYPE } from '@/pages/withdrawal/index.tsx'


export interface SelectWalletDrawerProps {
  wallets: UserEmbeddedWalletDto[]
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onWalletSelected?: (wallet: UserEmbeddedWalletDto, type: ACCOUNT_TYPE) => void
  selectedWallet?: UserEmbeddedWalletDto
  balances: Record<string, number>
  usdBalances?: Record<string, number>
  token: string
  tokenLogo: string
  title: string
  isPC?: boolean
  selectedAccountType: ACCOUNT_TYPE
  futuresWithdrawable: string
  allowSelectContract?: boolean
}

export const SelectWalletDrawer = (props: SelectWalletDrawerProps) => {
  const { wallets, open, setOpen, onWalletSelected, selectedWallet, tokenLogo, balances, title, isPC, selectedAccountType, futuresWithdrawable, token, allowSelectContract } = props
  const { t } = useTranslation()
  /* console.log('token', token)
  console.log('wallets', wallets)
  console.log('selectedWallet', selectedWallet)
  console.log('tokenLogo', tokenLogo) */

  const RenderContent = () => {
    return (
      <div className="pb-6">
        <div className="text-[#FFFFFFB2] text-[calc(14rem/16)] font-medium mb-3">{t('assets.fundingAccount')}</div>
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className={cn(
                'flex items-center justify-between border border-transparent px-3 py-2.5 rounded-[8px] cursor-pointer relative h-[44px]',
                selectedWallet?.walletAddress === wallet.walletAddress && selectedAccountType === 'MEME'
                  ? 'border-gradient-toolbar-klineStyle bg-[#0F0F0F]'
                  : 'bg-[#ECECED14]',
              )}
              onClick={() => {
                setOpen(false)
                onWalletSelected?.(wallet, 'MEME')
              }}
            >
              <div className="flex items-center gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-[calc(14rem/16)] leading-3.5 font-medium">{wallet.name}</span>
                  <span className="text-[calc(12rem/16)] leading-3 font-normal text-[#FFFFFF80]">
                    {formatAddressWallet(wallet.walletAddress, 5, 5)}
                  </span>
                </div>
                <CopyButton text={wallet.walletAddress} className="opacity-55" />
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <img src={tokenLogo} className="size-3" alt="" />
                  <span className="text-[calc(14rem/16)] font-medium text-[#FFFFFFB2]">
                    {formatBalanceWallet({ balance: balances[wallet.walletAddress] ?? 0 })}
                  </span>
                </div>
              </div>
              {selectedWallet?.walletAddress === wallet.walletAddress && selectedAccountType === 'MEME' && (
                <IconSelected className="absolute top-0 right-0" />
              )}
            </div>
          ))}
          {
            selectedWallet?.chain === 'ARB' && token === 'USDC' && allowSelectContract && 
            <div
              className={cn(
                'flex items-center justify-between border border-transparent px-3 py-2.5 rounded-[8px] cursor-pointer relative h-[44px]',
                selectedAccountType === 'CONTRACT'
                  ? 'border-gradient-toolbar-klineStyle bg-[#0F0F0F]'
                  : 'bg-[#ECECED14]',
        
              )}
              onClick={() => {
                setOpen(false)
                onWalletSelected?.(selectedWallet, 'CONTRACT')
              }}
            >
              <div className="flex items-center gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-[calc(14rem/16)] leading-3.5 font-medium">{t('assets.transfers.contractAccount')}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <img src='/images/icons/chains/ic-usdc.svg' className="size-3" alt="" />
                  {futuresWithdrawable}
                </div>
              </div>

              {selectedAccountType === 'CONTRACT' && (
                <IconSelected className="absolute top-0 right-0" />
              )}
        
              
            </div>
          }

          
        </div>
      </div>
    )
  }

  if (isPC) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="px-3 pt-4" showDialogPrimitiveClose={false}>
          <RenderContent />
        </DialogContent>
      </Dialog>
    )
  }

  return <AppDrawer setOpen={setOpen} open={open} title={title} isShowBgImg={false} drawerContent={<RenderContent />} />
}
