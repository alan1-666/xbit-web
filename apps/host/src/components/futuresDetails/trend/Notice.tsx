import { cn } from '@/lib/utils.ts'

type DetailNoticeProps = {
  containerClassName?: string
}
const DetailNotice = ({ containerClassName }: DetailNoticeProps) => {
  return (
    <div className={cn('flex items-center h-[20px] mb-[10px]', containerClassName)}>
      <img className="size-4 mr-1.5" src="/images/futuresDetail/notice-icon.svg" alt="icon notice" />
      <span className="flex-1 text-[calc(12rem/16)] leading-[calc(12rem/16)]">
        网站维护公告等重要事件，点击横幅跳到公告的详情页
      </span>
      <img className="ml-1.5" src="/images/futuresDetail/close-icon.svg" alt="icon close" />
    </div>
  )
}
export default DetailNotice
