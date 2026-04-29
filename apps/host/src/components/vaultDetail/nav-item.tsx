import { cn } from '@/lib/utils';

const NavItem = ({ title, isActive, onClick }: { title: string; isActive: boolean; onClick: () => void }) => {
  return (
    <div
      className={cn(
        'text-[calc(1rem*(13/16))] app-font-regular px-3 py-1 rounded-[200px] bg-[#ECECED1F] w-fit whitespace-nowrap transition-all duration-75 cursor-pointer',
        isActive ? 'text-[#00FFB4] bg-[#00FFB41A]' : 'text-[#FFFFFFB2]',
      )}
      onClick={onClick}
    >
      {title}
    </div>
  )
}

export default NavItem
