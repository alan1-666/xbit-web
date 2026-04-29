import LogoWithChain from '@components/common/LogoWithChain.tsx'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx'

export interface Network {
  chainId: number | string
  chainName: string
  chainImage: string
}

type Props = {
  networks: Network[]
  networkSelected: number | string
  onNetworkSelected: (network: string) => void
}

const SelectNetwork = ({ networks, networkSelected, onNetworkSelected }: Props) => {
  return (
    <Select defaultValue="0" value={networkSelected.toString()} onValueChange={onNetworkSelected}>
      <SelectTrigger className="border border-[#79778C29] rounded-[8px] px-3 py-2 h-10">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent className="max-h-[30vh] min-h-[190px] bg-[#212127] border border-[#58576029]">
        <SelectGroup>
          {networks.map((network) => (
            <SelectItem key={network.chainId.toString()} value={network.chainId.toString()}>
              <div className="flex items-center gap-2 capitalize">
                <LogoWithChain
                  logo={network.chainImage}
                  logoClassName="size-6 min-w-6 rounded-full"
                  name={network.chainName}
                />
                {network.chainName}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default SelectNetwork
