export const FuturesCardSkeleton = () => {
    return (
      <div className="flex flex-col w-full h-full min-h-[180px] bg-[#1C1F26] rounded-xl border border-white/5 overflow-hidden animate-pulse">
        
        {/* Header */}
        <div className="flex w-full items-start relative gap-3 px-3 py-3 h-[60px]">
          <div className="rounded-md w-[38px] h-[38px] bg-[#2C3038]" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
              <div className="h-4 w-3/4 bg-[#2C3038] rounded" />
              <div className="h-3 w-1/2 bg-[#2C3038] rounded" />
          </div>
        </div>
  
        {/* Content: Outcome List */}
        <div className="flex flex-col w-full flex-1 border-t border-white/5 px-3 py-2 space-y-2">
            {[1, 2, 3].map((i) => (
               <div key={i} className="flex justify-between items-center h-8">
                   <div className="h-4 w-1/3 bg-[#2C3038] rounded" />
                   <div className="flex gap-2">
                       <div className="h-4 w-8 bg-[#2C3038] rounded" />
                       <div className="h-[26px] w-[44px] bg-[#2C3038] rounded" />
                       <div className="h-[26px] w-[44px] bg-[#2C3038] rounded" />
                   </div>
               </div>
            ))}
        </div>
  
        {/* Footer: Volume */}
        <div className="flex w-full items-center px-3 py-2 border-t border-white/5 bg-[#1C1F26] justify-between">
           <div className="h-3 w-20 bg-[#2C3038] rounded" />
           <div className="h-4 w-4 bg-[#2C3038] rounded-full" />
        </div>
  
      </div>
    )
  }
