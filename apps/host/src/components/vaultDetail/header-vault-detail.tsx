import { formatAddressWallet } from '@/lib/string'
import { ChevronLeft, CircleDollarSign, Database } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CopyBtn from '../common/CopyBtn'
import { cn } from '@/lib/utils'
const HeaderVaultDetail = () => {
  const navigate = useNavigate()

  const ItemCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => {
    const renderColor = () => {
      if (value.includes('-')) {
        return 'text-[#AB57FF]'
      } else if (value.includes('+')) {
        return 'text-[#00FFB4]'
      }
      return 'text-white'
    }

    return (
      <div className="flex gap-2">
        <div className="flex items-start">
          <div className="">{icon}</div>
        </div>
        <div className="">
          <div className="text-[#FFFFFFB2] text-[calc(1rem*(13/16))] app-font-regular">{title}</div>
          <div className={cn('text-[calc(1rem*(14/16))] font-bold', renderColor())}>{value}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 pt-2">
      <div className="flex items-center justify-between">
        <ChevronLeft className="cursor-pointer size-[24px]" onClick={() => navigate(-1)} />
        <div className="text-[calc(1rem*(14/16))] font-[500]">交易规则</div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="">
            <div className="text-[calc(1rem*(24/16))] font-[500]">KairoX量化2号</div>

            <div className="mt-3">
              <div className="text-[calc(1rem*(14/16))] text-[#FFFFFFCC]">您的余额</div>
              <div className="text-[calc(1rem*(24/16))] font-[500]">$93,382.23</div>
            </div>
          </div>
          <div className="">
            <div className="text-[calc(1rem*(13/16))] font-[500] px-2 py-0.5 bg-white rounded-[200px] text-[#141414] flex items-center gap-2">
              <span>{formatAddressWallet('9466qfaskdjdhskhdkaRmdfep', 6, 6)}</span>
              <CopyBtn text="9466qfaskdjdhskhdkaRmdfep" />
            </div>
            <div className="mt-3">
              <div className="text-[calc(1rem*(14/16))] text-[#FFFFFFCC]">盈亏</div>
              <div className="text-[calc(1rem*(24/16))] font-[500]">$848.23</div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between p-3.5 bg-HeaderVaultDetail rounded-[8px]">
          <div className="flex flex-col gap-3">
            <ItemCard icon={<CircleDollarSign className="size-4.5" />} title="总锁仓价值" value="$ 18,697,786.23" />
            <ItemCard icon={<Database className="size-4.5" />} title="近1月回报" value="+98.87%" />
          </div>
          <div className="flex flex-col gap-3">
            <ItemCard icon={<Database className="size-4.5" />} title="年化收益率" value="-0.24%" />
            <ItemCard icon={<CircleDollarSign className="size-4.5" />} title="近1月跑赢大盘" value="+90.23%" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderVaultDetail
