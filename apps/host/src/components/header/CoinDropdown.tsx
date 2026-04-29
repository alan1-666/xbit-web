import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CoinDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-[5px 8px 5px 10px] bg-[#ECECED14] rounded-[50px] gap-[4px] h-[26px] focus-visible:shadow-[none]"
        >
          <img
            src="/images/icons/icon-sol.svg"
            alt=""
            className="w-[11.45px] h-[10px]"
          />
          <span className="block text-[11px] text-[#ffffff] leading-[1] tracking-[0px] font-[300]">SOL</span>
          <img
            src="/images/icons/icon-arrow-down.svg"
            alt=""
            className="w-[16px] h-[16px]"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto">
        <DropdownMenuItem className="w-auto">
          <img
            src="/images/icons/icon-sol.svg"
            alt=""
            className="w-[11.45px] h-[10px]"
          />
          <span>SOL</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CoinDropdown