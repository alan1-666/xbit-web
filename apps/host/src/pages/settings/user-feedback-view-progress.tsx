import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { useState } from 'react'
import { cn } from '@/lib/utils.ts'

const tabs = [{ key: 'all', label: '全部' }]

const feedbacks = [
  {
    id: '1',
    title: '反馈标题1',
    content: '这是反馈内容1',
    status: '处理中',
    createdAt: '2023-10-01T10:54:00Z',
  },
  {
    id: '2',
    title: '反馈标题2',
    content: '这是反馈内容2',
    status: '已解决',
    createdAt: '2023-10-02T11:20:00Z',
  },
]

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('all')
  return (
    <div className="w-full">
      <div className="flex items-center px-3">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={cn(
              'text-[calc(18rem/16)] font-medium text-[#FFFFFF] px-1 py-2 rounded-[8px] cursor-pointer relative',
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {activeTab === tab.key && <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-white" />}
          </div>
        ))}
      </div>
      <div className="w-full h-[1px] bg-white/10" />
    </div>
  )
}

export const UserFeedbackViewProgressPage = () => {
  return (
    <div className="w-full h-screen">
      <HeaderWithBack title="用户反馈进度" className="bg-transparent" />
      <Tabs />
      <div className="pt-2 px-3">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="p-4 border-b border-[#FFFFFF1A] last:border-b-0 hover:bg-[#232329] transition-colors cursor-pointer"
          >
            <h3 className="text-[calc(14rem/16)] font-semibold text-[#FFFFFFB2]">{feedback.title}</h3>
            <div className="text-[calc(14rem/16)] text-white mt-1">{feedback.content}</div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-[calc(12rem/16)] text-[#FFFFFFA6]">
                {new Date(feedback.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
