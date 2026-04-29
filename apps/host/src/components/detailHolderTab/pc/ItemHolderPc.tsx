import HolderWalletAddress from '@components/detailHolderTab/HolderWalletAddress.tsx'
import { HolderWithColor } from '@components/detailHolderTab/pc/HoldersTablePc.tsx'

type Props = {
  holder: HolderWithColor
  isFollowed?: boolean
}

const ItemHolderPc = ({ holder, isFollowed }: Props) => {
  const positionPercentage =
    holder?.balance && holder?.totalSupply && holder?.totalSupply !== 0
      ? (Number(holder?.balance) / Number(holder?.totalSupply)) * 100
      : 0
  return <HolderWalletAddress positionPercentage={positionPercentage} isFollowed={isFollowed} holder={holder} />
}

export default ItemHolderPc
