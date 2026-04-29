type ItemNetworkProps = {
  iconUrl: string
  network: string
  isActive: boolean
}

const ItemNetwork = ({
  iconUrl,
  network,
  isActive
}: ItemNetworkProps) => {
  return (
    <div className="flex items-center justify-between py-3.5 border-b-[0.5px] border-b-[#ECECED14] cursor-pointer">
      <div className="flex items-center gap-2.5">
        <img
          src={iconUrl}
          alt="icon network"
          className="w-8 h-8 rounded-full overflow-hidden object-contain"
        />
        <div className="app-font-medium text-[calc(1rem*(16/16))] leading-[1] text-white">
          {network}
        </div>
      </div>
      {isActive && <img src="/images/icons/icon-tick-rounded.svg?v=2" alt="icon-tick" />}
    </div>
  )
}

export default ItemNetwork
