export const MatchCardSkeleton = () => {
    return (
      <div className="flex flex-col bg-[#1C1F26] rounded-xl border border-white/5 overflow-hidden min-h-[142px] animate-pulse">
        {/* Header */}
        <div className="flex h-10 items-center justify-between px-3 bg-[#2C3038]">
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 bg-[#3A3E46] rounded" />
            <div className="h-4 w-8 bg-[#3A3E46] rounded" />
          </div>
          <div className="h-4 w-16 bg-[#3A3E46] rounded" />
        </div>
  
        {/* Body */}
        <div className="flex flex-col p-4 gap-3">
          {/* Team 1 */}
          <div className="flex items-center justify-between h-9">
             <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-full bg-[#3A3E46] shrink-0" />
                <div className="h-4 w-32 bg-[#3A3E46] rounded" />
             </div>
             <div className="h-8 w-16 bg-[#3A3E46] rounded ml-auto" />
          </div>
  
          {/* Team 2 */}
          <div className="flex items-center justify-between h-9">
             <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-full bg-[#3A3E46] shrink-0" />
                <div className="h-4 w-32 bg-[#3A3E46] rounded" />
             </div>
             <div className="h-8 w-16 bg-[#3A3E46] rounded ml-auto" />
          </div>
        </div>
      </div>
    )
  }
