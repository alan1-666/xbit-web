import AppDrawer from '@/components/common/AppDrawer'
import ButtonGradient from '@/components/common/buttons/ButtonGradient'
import { IconCopySolid } from '@/components/icon'
import { cn } from '@/lib/utils'
import React, { SetStateAction, useState } from 'react'

interface SwitchWalletDrawerProps {
  open: boolean
  setOpenWalletDrawer: React.Dispatch<SetStateAction<boolean>>
}

interface WalletItem {
  id: string
  title: string
  icon: string
  name: string
  address: string
  balance: string
  tokenCount: number
}

const SwitchWalletDrawer: React.FC<SwitchWalletDrawerProps> = ({ open, setOpenWalletDrawer }) => {
  const wallets: WalletItem[] = [
    {
      id: '1',
      title: '钱包1',
      icon: '/images/wallets/telegram-connect.png',
      name: 'Telegram钱包',
      address: '296Xu...X8q',
      balance: '18,674.23',
      tokenCount: 5,
    },
    {
      id: '2',
      title: '钱包2',
      icon: '/images/wallets/boss-wallet.png',
      name: 'BOSS Wallet',
      address: '296Xu...X8q',
      balance: '789.23',
      tokenCount: 5,
    },
    {
      id: '3',
      title: '钱包2',
      icon: '/images/wallets/meta-mark-connect.png',
      name: 'MetaMask',
      address: '296Xu...X8q',
      balance: '12,901.48',
      tokenCount: 5,
    },
  ]

  const [selectedWalletId, setSelectedWalletId] = useState<string>('1')

  const WalletItem: React.FC<{ wallet: WalletItem }> = ({ wallet }) => {
    const isSelected = selectedWalletId === wallet.id

    return (
      <div>
        <h6 className="text-[#FFFFFF80] text-[16px]">{wallet.title}</h6>
        <div
          className={cn(
            'mt-2.5 flex items-center px-2.5 py-3 rounded-[8px]  relative gap-3 ',
            !isSelected ? 'cursor-pointer bg-[#ECECED0A]' : '',
          )}
          onClick={() => setSelectedWalletId(wallet.id)}
        >
          {isSelected && (
            <>
              <img
                src="/images/wallets/check-cirle.svg"
                alt=""
                className="top-1/2 right-2.5 absolute -translate-y-1/2"
              />
              <span
                style={{
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '8px',
                  padding: '1px',
                  background: 'linear-gradient(to right, #9945FF,#5497D5, #19FB9B)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  zIndex: 1,
                }}
              />
            </>
          )}
          <img src={wallet.icon} alt="wallet_icon" className="w-10 h-10 rounded-full" />
          <div>
            <div className="flex gap-1.5">
              <span className="text-sm font-medium">{wallet.name}</span>
              <span className="text-[#FFFFFF80] ml-2.5">{wallet.address}</span>
              <button>
                <IconCopySolid />
              </button>
            </div>
            <div className="inline-flex items-center mt-2">
              <span className="text-sm text-[#FFFFFFB2]">${wallet.balance}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppDrawer
      open={open}
      setOpen={setOpenWalletDrawer}
      title="切换钱包"
      drawerClassName="bg-[url('/images/tokenDetail/bg_top_100.png')] bg-no-repeat bg-center bg-cover"
      drawerHeaderClassName="py-[14px]"
      leftIcon={
        <button className="w-6 h-6" onClick={() => setOpenWalletDrawer(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.25 5L3.25 11.8772L10.25 19" stroke="white" strokeWidth="2" />
          </svg>
        </button>
      }
      rightIcon={<div></div>}
      drawerContent={
        <div>
          <div className="mt-5 flex flex-col gap-5">
            {wallets.map((wallet) => (
              <WalletItem key={wallet.id} wallet={wallet} />
            ))}
          </div>
          <div className="py-4 mt-5">
            <ButtonGradient className="rounded-full w-full !h-[44px] gap-0">
              <img src="/images/wallets/plus-icon.svg" className="w-4 h-4" alt="icon plus" />
              添加钱包
            </ButtonGradient>
          </div>
        </div>
      }
    />
  )
}

export default SwitchWalletDrawer
