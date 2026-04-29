import AppDrawer from '@/components/common/AppDrawer'
import ButtonGradient from '@/components/common/buttons/ButtonGradient'
import { IconArrowRight, IconCopySolid } from '@/components/icon'
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
      balance: '0.0999',
      tokenCount: 5,
    },
    {
      id: '2',
      title: '钱包2',
      icon: '/images/wallets/okx-connect.png',
      name: 'OKX Wallet',
      address: '296Xu...X8q',
      balance: '0.0999',
      tokenCount: 5,
    },
    {
      id: '3',
      title: '钱包2',
      icon: '/images/wallets/meta-mark-connect.png',
      name: 'Telegram钱包',
      address: '296Xu...X8q',
      balance: '0.0999',
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
            'mt-2.5 flex items-center justify-between px-2.5 py-3 rounded-[8px]  relative ',
            !isSelected ? 'cursor-pointer bg-[#ECECED0A]' : '',
          )}
          onClick={() => setSelectedWalletId(wallet.id)}
        >
          {isSelected && (
            <>
              <img src="/images/icons/wallet-check.svg" alt="" className="top-0 right-0 absolute" />
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
                  zIndex: -1,
                }}
              />
            </>
          )}
          <img src={wallet.icon} alt="wallet_icon" className="w-10 h-10" />
          <div>
            <div className="flex gap-1.5">
              <span>{wallet.name}</span>
              <span className="text-[#FFFFFF80]">{wallet.address}</span>
              <button>
                <IconCopySolid />
              </button>
            </div>
            <div className="inline-flex items-center mt-2">
              <img src="/images/wallets/sw-solana.svg" className="w-[14px] h-[14px] " alt="icon solana" />
              <span className="text-sm text-[#FFFFFFB2]">{wallet.balance}</span>
            </div>
          </div>
          <div className="h-full flex items-end text-sm self-end">
            <img src="/images/wallets/sw-coin-unit.png" className="h-4 mr-1" alt="icon switch coin" />
            <span>{wallet.tokenCount}</span>
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
      rightIcon={<button>管理</button>}
      drawerContent={
        <div>
          <div className="flex justify-between">
            <div>
              <h5 className="text-[15px] text-white">资产总额</h5>
              <div className="text-[24px] text-white">$3.8912</div>
            </div>
            <button className="inline-flex items-center">
              <span className="py-1 pl-1.5 pr-2.5 inline-flex bg-[#ECECED14] rounded-[200px] items-center">
                <img src="/images/wallets/sw-solana.svg" className="w-[16px] h-[16px] " alt="icon solana" />
                <span className="text-sm text-white">Solana</span>
              </span>
              <IconArrowRight />
            </button>
          </div>
          <div className="mt-5 flex flex-col gap-5">
            {wallets.map((wallet) => (
              <WalletItem key={wallet.id} wallet={wallet} />
            ))}
          </div>
          <div className="py-4 mt-5">
            <ButtonGradient className="rounded-full w-full">添加钱包</ButtonGradient>
          </div>
        </div>
      }
    />
  )
}

export default SwitchWalletDrawer
