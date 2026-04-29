/**
 * 红包页面加载骨架屏
 */
const LoadingSkeleton = () => {
  return (
    <div className="bg-[#0A0A0A] min-h-[calc(100vh-60px)] animate-pulse">
      {/* 顶部导航区域 */}
      <div className="p-4 flex gap-2">
        <div className="h-10 bg-white/10 rounded-lg flex-1"></div>
        <div className="h-10 bg-white/10 rounded-lg flex-1"></div>
        <div className="h-10 bg-white/10 rounded-lg flex-1"></div>
      </div>

      {/* 主内容区域 */}
      <div className="p-4 space-y-4">
        {/* 大卡片 */}
        <div className="h-48 bg-white/10 rounded-2xl"></div>
        
        {/* 小卡片列表 */}
        <div className="space-y-3">
          <div className="h-24 bg-white/10 rounded-xl"></div>
          <div className="h-24 bg-white/10 rounded-xl"></div>
          <div className="h-24 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
