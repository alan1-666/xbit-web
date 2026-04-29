import TextBorder from '@/components/common/TextBorder'
import { cn } from '@/lib/utils'

const Header = () => {
  return (
    <div
      className={cn(
        `max-w-[100%] rounded-bl-none rounded-br-none rounded-tl-[8px] realative
                rounded-tr-[8px] bg-gradient-to-b from-[#3e3e3e82] to-[transparent]`,
      )}
    >
      <div className="relative right-0 ml-auto w-fit">
        <img className="ml-auto" src="/images/icons/icon-subtract.svg" alt="icon subtract" />
        <div className="absolute top-2.5 left-1/2 transform -translate-x-1/3 -translate-y-1/2 text-[calc(1rem*(12/16))] text-[#141414] ">
          做多
        </div>
      </div>

      <div className="px-2 py-4 -mt-6">
        <div className="flex gap-3 w-full items-center">
          <div className="flex gap-1 items-center">
            <span className="text-lg font-[500]">哪吒3号</span>
            <img src="/images/icons/ic-arrow-right-simple.svg" className="w-[16px] min-w-[16px]" alt="" />
          </div>
          <div className="flex gap-2 items-center">
            <TextBorder text="8连胜" />
            <TextBorder text="历史胜率 33.98%" />
          </div>

          <div className="text-[#00FFB4] font-[400] text-sm">·运行中</div>
        </div>
      </div>
      <div className="px-2 text-[calc(1rem*(20/16))] font-medium text-[#00FFB4] p-0.5 leading-[calc(1rem*(18/16))] flex gap-2">
        68,235.2
        <span className="bg-[#00FFB4] text-[calc(1rem*(10/16))] px-1 text-[#141414] rounded-[3px] leading-[1.6]">+1.98%</span>
      </div>
    </div>
  )
}

export default Header
