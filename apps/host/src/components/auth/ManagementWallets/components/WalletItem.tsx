import { UserEmbeddedWalletDto } from '@/@generated/gql/graphql-user'
import { CopyButton } from '@/components/common/copy-button'
import { convertChainTypeToTypeChain, getImgIconChain, getNativeTokenByActiveChain } from '@/lib/blockchain'
import { formatAmount } from '@/lib/format'
import { formatAddressWallet } from '@/lib/string'
// import { getAvatarFromAddress } from '@/utils/list-coin-helper'
import { memo, useEffect, useState } from 'react'
import EditWalletName from '../EditWalletName'
import ExportPrivateKey from '../ExportPrivateKey'
import { generateAvatar } from '@/utils/xbitAvatar/XbitAvatarGenerator.ts'

interface WalletItemProps {
  item: UserEmbeddedWalletDto
  index: number
  balance: number
}

const WalletItem = memo(({ item, index, balance }: WalletItemProps) => {
  const typeChain = convertChainTypeToTypeChain(item?.chain)
  const displayToken = getNativeTokenByActiveChain(typeChain)

  const [src, setSrc] = useState('')
  useEffect(() => {
    generateAvatar(item?.walletAddress).then(setSrc)
  }, [item?.walletAddress])

  return (
    <div className="flex items-center justify-between px-2.5 py-[14px] rounded-lg border-gradient cursor-pointer before:invisible hover:before:visible w-full">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <img data-avatar-type="wallet" src={src} className="w-10 h-10 rounded-full" alt="logo xbit" />
          <EditWalletName wallet={item}>
            <div className="absolute right-0 bottom-0 z-10 cursor-pointer p-0.5 bg-gray-800/80 rounded-full hover:bg-gray-700/80 transition-colors">
              <img src="/images/wallets/edit.svg" className="w-3 h-3" alt="edit name" />
            </div>
          </EditWalletName>
        </div>
        <div>
          <div className="flex flex-col md:flex-row md:items-end gap-2">
            <p className="text-base text-white leading-none truncate max-w-40 md:max-w-90">
              {item?.name || `钱包${index + 1}`}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="font-normal text-white/50 text-[12px] leading-none">
                {formatAddressWallet(item?.walletAddress)}
              </div>
              <CopyButton text={item?.walletAddress} className="h-[14px] w-[14px]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <img src={getImgIconChain(typeChain)} className="w-3 h-3" alt="" />
            <p className="text-white/70 text-[14px] leading-none">
              {formatAmount(balance, {
                roundMode: 'floor',
              })}
            </p>
            <p className="text-white/70 text-[14px] leading-none capitalize">{displayToken}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ExportPrivateKey wallet={item} />
        <div className="drag-handle">
          <img
            src="/images/icons/move-to-top.svg"
            alt="move-to-top"
            className="min-w-5 w-5 h-5 cursor-pointer"
            // onClick={handleMoveToTopClick}
          />
        </div>
      </div>
    </div>
  )
})

WalletItem.displayName = 'WalletItem'

export default WalletItem
