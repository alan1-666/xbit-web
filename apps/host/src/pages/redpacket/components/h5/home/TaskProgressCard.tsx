import React from 'react'
import { ServiceConfig } from '@/lib/gql/service-config'
import {
  VERIFY_TWITTER_FOLLOW,
} from '@/services/redpacket.service.ts'
import { redpacketClient } from '@/lib/gql/apollo-client'
import { Item } from '@radix-ui/react-select'
import { useTranslation } from 'react-i18next'

const GALXE_URL = 'https://app.galxe.com/quest/jWuQhF89bUqUNRcBFWzwVC/GC9XPtY62o'

const TaskItem = ({ type, title, sub_title, reward, done }: { type: string; title: string; sub_title: string, reward: string; done?: boolean }) => {
  const { t } = useTranslation()
  const handleTaskClick = async () => {
    if (type === 'galxe') {
      window.open(GALXE_URL, '_blank', 'noopener,noreferrer')
    }
    // if (type === 'Connect') {
    //   const accessToken = ServiceConfig.token || ''

    //   const response = await fetch(`${import.meta.env.VITE_REDPACKET_HTTP_URL}/auth/twitter/initiate`, {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //   });
    //   const data = await response.json();
    //   const { auth_url } = data
    //   window.open(auth_url, '_blank')
    // }
    // if (type === 'Follow') {
    //   try {
    //     redpacketClient.mutate({
    //       mutation: VERIFY_TWITTER_FOLLOW,
    //       variables: {},
    //     })

    //   } catch (error: any) {
    //   }
    //   window.open('https://x.com/KairoX', '_blank')
    // }
  }
  return (
    <div className={`self-stretch p-3 ${done ? 'bg-green-950' : 'bg-[#262626]'} rounded-[20px] shadow-[inset_0px_-7px_15px_0px_rgba(255,255,255,0.06)] outline-1 outline-offset-[-1px] ${done ? 'outline-white/10' : 'outline-transparent'} inline-flex justify-between items-center overflow-hidden`}>
      <div className="flex justify-start items-center gap-2">
        <img className="w-10 h-10" src="/images/redpacket/galxe.png" alt="Galxe Icon"/>
        <div className="inline-flex flex-col justify-start items-start gap-1">
          <div className="justify-start text-white text-sm font-normal leading-4">{title}</div>
          {/* <div className="self-stretch opacity-60 justify-start text-white text-xs font-normal leading-4">{reward}</div> */}

          <div className='inline-flex justify-start items-start text-sm font-semibold gap-1'>
            {'->'} 
            <img className="w-6 h-6"  src="/images/redpacket/gift.png" />
            {sub_title}
          </div>
        </div>
        
      </div>
      {done ? (
        <div className="px-2 py-1 rounded-lg flex justify-center items-center gap-0.5 overflow-hidden">
          <div className="w-4 h-4 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.3333 4L6.00001 11.3333L2.66667 8" stroke="#11E086" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div className="justify-start text-emerald-500 text-xs font-medium">{t('red.packet.down')}</div>
        </div>
      ) : (
        <div className="px-3 py-1 bg-gradient-to-r from-[#F10609] to-[#FE3E3E] rounded-lg flex justify-start items-center gap-1 overflow-hidden">
          <div className="w-9 text-center justify-start text-white text-xs font-semibold cursor-pointer" onClick={handleTaskClick} >{t('red.packet.btn_go')}</div>
        </div>
      )}
    </div>
  )
}
const TaskProgressCard = ({ tasks }: { tasks: any[] }) => {
  const { t } = useTranslation()
  return (
    <div>
    {/* <div className="self-stretch px-3 py-6 bg-zinc-950 rounded-[20px] shadow-[inset_0px_-7px_15px_0px_rgba(255,255,255,0.06)] outline-1 outline-offset-[-1px] outline-white/20 inline-flex flex-col justify-start items-start gap-5 overflow-hidden"> */}
      {/* <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="justify-start text-white text-xl font-normal">{t('red.packet.task.progress')}</div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-3">
        {tasks.map((t, i) => (
          <TaskItem key={i} {...t} />
        ))}
      </div> */}
      <div className="relative w-full">
          <img className="w-full h-auto mx-auto" src="/images/redpacket/bonus.png"/>
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-full flex flex-col items-center px-4 mb-4 gap-1">
              <div className=" text-center justify-start text-white text-2xl font-bold">{t('red.packet.jackpot.bonus')}</div>
            <div className="text-center justify-start  text-white text-base font-normal">{t('red.packet.large.packets.tips')}</div>
          </div>
      </div>
      <div className="w-full opacity-60 text-center justify-start text-white text-[12px] font-normal mt-[20px] whitespace-pre-line">{t('red.packet.keep.inviting.friends.tips')}</div>
     {/* </div> */}
    </div>
  )
}

export default TaskProgressCard
