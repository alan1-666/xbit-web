import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import '../style.css'

const filterGroups = [
  {
    title: '金库来源',
    options: [
      { id: 'all', label: '全部' },
      { id: 'official', label: '官方' },
      { id: 'unofficial', label: '非官方' },
    ],
  },
  {
    title: '年化收益率',
    options: [
      { id: 'all', label: '全部' },
      { id: '0-50', label: '0-50%' },
      { id: '50-100', label: '50-100%' },
      { id: '100-200', label: '100-200%' },
      { id: '200-300', label: '200-300%' },
      { id: '300-plus', label: '>300%' },
    ],
  },
  {
    title: '总锁仓价值(TVL)',
    options: [
      { id: 'all', label: '全部' },
      { id: '10k-plus', label: '>$10k' },
      { id: '50k-plus', label: '>$50k' },
      { id: '100k-plus', label: '>$100k' },
      { id: '300k-plus', label: '>$300k' },
      { id: '500k-plus', label: '>$500k' },
    ],
  },
  {
    title: '近1个月回报',
    options: [
      { id: 'all', label: '全部' },
      { id: '0-50', label: '0-50%' },
      { id: '50-100', label: '50-100%' },
      { id: '100-200', label: '100-200%' },
      { id: '200-300', label: '200-300%' },
      { id: '300-plus', label: '>300%' },
    ],
  },
  {
    title: '7日最大回撤',
    options: [
      { id: 'all', label: '全部' },
      { id: '0-20', label: '0-20%' },
      { id: '20-40', label: '20-40%' },
      { id: '40-60', label: '40-60%' },
      { id: '60-plus', label: '>60%' },
    ],
  },
  {
    title: '金库状态',
    options: [
      { id: 'all', label: '全部' },
      { id: 'running', label: '运行中' },
      { id: 'closed', label: '已关闭' },
    ],
  },
]

const RenderFilterOptions = ({ title, options }: { title: string; options: { id: string; label: string }[] }) => {
  const [activeOption, setActiveOption] = useState<string>(options[0].id)

  const handleOptionClick = (optionId: string) => {
    setActiveOption(optionId)
  }

  return (
    <div>
      <div className="text-[calc(1rem*(16/16))] font-[500] mb-1.5">{title}</div>
      <div className="grid grid-cols-3 gap-2 mb-1">
        {options.map((option) => (
          <div
            key={option.id}
            className={cn(
              'text-[calc(1rem*(14/16))] rounded-[6px] flex items-center justify-center bg-[#ECECED14] cursor-pointer px-[16px] py-[8px] transition-all duration-300 relative',
              activeOption === option.id && 'gradient-border-item-filter',
            )}
            onClick={() => handleOptionClick(option.id)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )
}
const DrawerFilter = () => {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div className="h-[26px] w-[24px] px-1 rounded-[4px] bg-[#ECECED14] flex items-center justify-center cursor-pointer">
            <img
              src="/images/futuresDetail/filter-icon.png"
              alt="filter"
              className="size-full flex-shrink-0 object-contain"
            />
          </div>
        </DrawerTrigger>
        <DrawerContent className="w-full bg-[url('/images/bg-drawer-gradient.png')] bg-no-repeat bg-cover max-w-[768px] mx-auto rounded-t-[35px]">
          <DrawerHeader className="py-1 px-3.5  flex w-full items-center justify-end">
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt=""
            />
          </DrawerHeader>
          <div className="px-3 flex flex-col gap-3">
            {filterGroups.map((group) => (
              <RenderFilterOptions key={group.title} title={group.title} options={group.options} />
            ))}
            <div className="grid grid-cols-2 gap-2 mt-5 mb-4 px-3">
              <Button
                variant="borderGradient"
                className="text-(--text-primary) w-full rounded-[50px] h-[calc(1rem*(44/16))]"
                onClick={() => setOpen(false)}
              >
                重置
              </Button>
              <Button
                variant="gradient"
                className=" text-tertiary w-full rounded-[50px] h-[calc(1rem*(44/16))]"
                // onClick={() => handleConfirmOrder()}
              >
                确定
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default DrawerFilter
