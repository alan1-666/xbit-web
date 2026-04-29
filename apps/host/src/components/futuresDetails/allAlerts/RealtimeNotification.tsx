const RealtimeNotification = () => {
  return (
    <div className="p-2.5 flex gap-3 items-center bg-[linear-gradient(90deg,_rgba(255,39,61,0.2)_0%,_rgba(255,39,61,0.08)_100%)]">
      <div className="flex items-center justify-between w-full text-[#FFFFFFCC] text-sm leading-[calc(1rem*(14/16))]">
        <span>开启系统通知，实时接收消息推送</span>
        <span>开启通知</span>
      </div>
      <img src="/images/icons/icon-x.svg" className="w-5 h-5 cursor-pointer" alt="" />
    </div>
  )
}

export default RealtimeNotification
