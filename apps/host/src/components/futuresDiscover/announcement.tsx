import { cn } from '@/lib/utils'
import Text from '../common/Text'

const Announcement = () => {
  return (
    <div className={cn('Signal-header -mt-3 z-2 relative rounded-tl-[8px] rounded-tr-[8px] p-3 flex flex-col gap-3')}>
      <Text text="公告" fontSize={20} fontWeight="semibold" className="pr-3" />
      <div className="flex flex-col gap-1">
        <Text text="KairoX关于BABY杠杆交易、永续合约及简单赚币上线的及简单赚币上线的公告" fontSize={15} />
        <Text text="2025/04/10" fontSize={12} color="#FFFFFF80" />
      </div>
      <div className="flex flex-col gap-1">
        <Text text="KairoX关于BABY杠杆交易、永续合约及简单赚币上线的及简单赚币上线的公告" fontSize={15} />
        <Text text="2025/04/10" fontSize={12} color="#FFFFFF80" />
      </div>
      <div className="flex flex-col gap-1">
        <Text text="KairoX关于BABY杠杆交易、永续合约及简单赚币上线的及简单赚币上线的公告" fontSize={15} />
        <Text text="2025/04/10" fontSize={12} color="#FFFFFF80" />
      </div>

      <div className="mt-3 rounded-[50px] h-[calc(1rem*(44/16))] hover:scale-[101%] transition-all duration-300 cursor-pointer flex gap-1 bg-[#ECECED14] justify-center items-center px-4 mx-auto w-40">
        <p className="text-[calc(1rem*(11/16))] text-[#FFFFFFB2]">查看更多</p>
        <img src="/images/listCoinCrypto/more-1.svg" alt="" className="size-6" />
      </div>
    </div>
  )
}

export default Announcement
