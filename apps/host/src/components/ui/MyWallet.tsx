// import { getBlockchainLogo2 } from "@/utils/helpers"
// import ChainCurrencyIcon from "../common/ChainCurrencyIcon"
// import { ChainIds } from "@/types/enums"

type IProps = {
  userAddress: string
  avatar?: string
}

export default function MyWallet(props: IProps) {
  const { userAddress, avatar } = props
  return (
    <div className="flex items-center w-full">
      {/* <IconTelegramLogin /> */}
      {/* <ChainCurrencyIcon currencyIcon={getBlockchainLogo2(chainId)} avatarClassName="rounded-lg" /> */}
      {avatar && <img src={avatar} alt="Avatar" className="w-6 h-6 rounded-full" />}
      <span>{userAddress?.slice(-5)}</span>
    </div>
  )
}
