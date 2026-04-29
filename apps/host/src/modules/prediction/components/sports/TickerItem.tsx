import React from 'react'
import { GreyCircleIcon, SignalIcon } from '../icons'
import { ArrowDownIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar.tsx'

const TickerItem = ({
  status,
  statusColor = 'text-muted-foreground',
  volume,
  teams,
}: {
  status: React.ReactNode
  statusColor?: string
  volume: string
  teams: { name: string; price: string; logo: string }[]
}) => {
  return (
    <div className="group/item flex border-r border-border/40 cursor-pointer hover:bg-muted/30 transition-colors bg-card">
      <div className="flex flex-col gap-1.5 p-2 px-4 min-w-[240px]">
        <div className="flex justify-between text-[11px] font-medium leading-none">
          <span className={`${statusColor} flex items-center gap-1.5`}>{status}</span>
          <span className="text-muted-foreground">{volume} Vol.</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {teams.map((team, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Avatar className="w-4 h-3 rounded-[2px]">
                  <AvatarImage src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                  <AvatarFallback className="w-full h-full flex items-center justify-center bg-primary/20 text-[8px] font-bold rounded-[2px]">
                    {team.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-4 h-3 bg-primary/20 rounded-[2px] hidden"></div>
                <span className="font-medium text-foreground truncate max-w-[120px]">{team.name}</span>
              </div>
              <span className="font-bold text-foreground">{team.price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-0 group-hover/item:w-10 overflow-hidden transition-[width] duration-300 ease-out flex flex-col items-center justify-between border-l border-border/50 bg-muted/10">
        <div className="flex flex-col items-center justify-between w-10 h-full py-1.5">
          <button className="text-foreground hover:scale-110 transition-transform">
            <SignalIcon />
          </button>

          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <GreyCircleIcon />
          </button>

          <button className="text-foreground hover:translate-y-0.5 transition-transform">
           <ArrowDownIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TickerItem
