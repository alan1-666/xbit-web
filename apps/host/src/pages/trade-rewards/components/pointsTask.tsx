import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTradeRewards } from '../hooks/useTradeRewards'
import { APP_PATH } from '@/lib/constant'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptyList } from '@/components/discover/EmptyList'
import { DialogControl } from '@/pages/trade-rewards'
import { logEvent2, ACTIONS } from '@services/google-analytics.service'
// 任务类型
type TaskType = 'DAILY' | 'COMMUNITY' | 'TRADING'


// 任务状态
type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED' | 'EXPIRED'

// 任务接口
interface Task {
  task: any,
  progress?: {
    status: TaskStatus
    progressValue: number
    targetValue: number
  }
}

// 获取当前语言
const getCurrentLanguage = () => {
  return localStorage.getItem('i18nextLng') || 'en'
  // return 'en'
}

// 按钮状态对应文案
const getButtonText = (task: Task) => {
  const { t } = useTranslation()
  const status = task.task?.buttonText
  if (status === 'view') {
    return t('Activityrewards.pointsTask.goView')
  } else if (status === 'trade') {
    return t('Activityrewards.pointsTask.goTrade')
  } else if (status === 'follow') {
    return t('Activityrewards.pointsTask.goFollow')
  } else if (status === 'share') {
    return t('Activityrewards.pointsTask.goShare')
  } else if (status === 'forward') {
    return t('Activityrewards.pointsTask.goForward')
  }else if (status === 'join') {
    return t('Activityrewards.pointsTask.goJoin')
  }
  else{
    return t('Activityrewards.pointsTask.goComplete')
  }
}

// 任务项骨架屏组件
const TaskItemSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#ECECED10] last:border-b-0 animate-pulse">
      {/* 左侧图标和信息骨架 */}
      <div className="flex items-center space-x-3">
        <div className='rounded-full w-[40px] h-[40px] bg-[#ECECED20]'>
        </div>
        <div>
          <div className="h-[14px] bg-[#ECECED20] rounded w-[140px] mb-2">
          </div>
          <div className="h-[13px] bg-[#ECECED20] rounded w-[80px]">
          </div>
        </div>
      </div>

      {/* 右侧按钮骨架 */}
      <div className="ml-2">
        <div className="h-[28px] bg-[#ECECED20] rounded-full w-[60px]">
        </div>
      </div>
    </div>
  )
}

// 任务项组件
const TaskItem: React.FC<{ task: Task; onAction: (task: Task) => void; taskType:TaskType }> = ({ task, onAction, taskType }) => {
  const { t } = useTranslation()
  const { name,taskIcon, points, frequency } = task?.task
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#ECECED10] last:border-b-0">
      {/* 左侧图标和信息 */}
      <div className="flex items-center space-x-3">
        <div className='rounded-full w-[40px] h-[40px]'>
          {(() => {
            const taskTypeImages = {
              DAILY: '/images/nodeAgent/daily.svg',
              COMMUNITY: '/images/nodeAgent/community.svg',
              TRADING: '/images/nodeAgent/trade.svg'
            }
            const imageSrc = taskTypeImages[taskType]
            return imageSrc ? (
              <img 
                src={taskIcon == "" ? imageSrc : taskIcon} 
                className="w-[40px] h-[40px] rounded-full" 
                alt="task-icon"
              />
            ) : null
          })()}
        </div>
     
        {/* {getTaskIcon(task)} */}
        <div>
          <div className="text-white text-[14px] line-clamp-1 max-w-[240px]">
            {name[getCurrentLanguage()]}
          </div>
          <div className="text-[#FFFFFFB2] text-[13px] flex items-center">
           {task.progress && frequency === 'PROGRESSIVE' &&  (
              <span className="mr-2">
                ({task.progress.progressValue}/{task.progress.targetValue})
              </span>
            )}
       
           {points !== 0 && (
            <span className="text-[#FFFFFF] text-[15px]">+{points} {t('Activityrewards.exp')}</span> 
           )}
          </div>
        </div>
      </div>

      {/* 右侧按钮 */}
      <div className="ml-2">
        {(task.progress?.status === 'CLAIMED' || task.progress?.status === 'COMPLETED') && task.task.frequency != "UNLIMITED" ? (
          <div className="border border-[#ECECED1F] text-[#FFFFFF80] py-1 text-center rounded-full text-[14px] w-[100px]">
            {t('Activityrewards.pointsTask.completed')}
          </div>
        ) : (
          <Button
            variant="gradient"
            onClick={() => onAction(task)}
            className="text-white py-1 rounded-full text-[14px] h-auto w-[100px] text-center"
          >
            {getButtonText(task)}
          </Button>
        )}
      </div>
    </div>
  )
}

// 主组件
interface PointsTaskProps {
  taskType: 'DAILY' | 'COMMUNITY' | 'TRADING'
  handleRefresh: () => void
  tasksList: any
}

const PointsTask: React.FC<PointsTaskProps & DialogControl> = ({ taskType, handleRefresh, tasksList, setOpen }) => {
  // const [tasksList, setTasksList] = useState<any>([])
  const { completeTask } = useTradeRewards()
  const navigate = useNavigate()

  // const getTasksList = async() => {
  //   const tasks:any = await fetchTasksByType(taskType)
  //   setTasksList(tasks)
  // }
  // console.log(tasksList,'tasksLists')


  const handleTaskAction = (task: Task) => {
    // 处理任务行为
    console.log('执行任务:', task)
    // 几种行为 执行不同操作
    // CLICK_VERIFY 点击验证
    // AUTO 自动验证
    // MANUAL 手动验证
    // 根据task.task.verificationMethod 判断验证方式
    logEvent2(ACTIONS.reward_task_click, {
      task_id: task?.task?.id,
      task_name: task?.task?.name?.en,
    })
    const verificationMethod = task.task.verificationMethod
    if (verificationMethod === 'CLICK_VERIFY') {
       window.open(task.task.externalLink, '_blank')
       completeTask(task.task.id)
      logEvent2(ACTIONS.reward_task_complete, {
        task_id: task?.task?.id,
        task_name: task?.task?.name?.en,
        reward_amount: task?.task?.points
      })
       handleRefresh?.()
    } else if (verificationMethod === 'AUTO') {
      if(task.task.buttonText != 'trade' && task.task.actionTarget != 'InvitationPage' ){
        completeTask(task.task.id)
        logEvent2(ACTIONS.reward_task_complete, {
          task_id: task?.task?.id,
          task_name: task?.task?.name?.en,
          reward_amount: task?.task?.points
        })
        handleRefresh?.()
      }
      setOpen?.(false)
      handleTaskJump(task.task.actionTarget)
    } else if (verificationMethod === 'MANUAL') {
     
    }
  }
  // 前后端约定的actionTarget
  // homePage 首页
  // memeHome meme首页
  // memeTrade meme交易页
  // FuturesTrade 合约交易页
  // market 市场页
  // 任务跳转
  const handleTaskJump = (actionTarget: string) => {
    if (actionTarget === 'homePage') {
      navigate(APP_PATH.FUTURES_DISCOVER)
    } else if (actionTarget === 'memeHome') {
      navigate(APP_PATH.MEME_DISCOVER)
    } else if (actionTarget === 'memeTrade') {
      navigate(APP_PATH.MEME_DISCOVER)
    } else if (actionTarget === 'FuturesTrade') {
      navigate(APP_PATH.FUTURES)
    } else if (actionTarget === 'market') {
      navigate(APP_PATH.MARKET)
    } else if (actionTarget === 'InvitationPage') {
      navigate(APP_PATH.INVITE_FRIENDS)
    } 
     else{
      return;
    }
  }
  return (
    <div className="">
      <div className="space-y-0">
        {!tasksList || tasksList.length <= 0 ? (
          <>
            {/* <TaskItemSkeleton />
            <TaskItemSkeleton />
            <TaskItemSkeleton /> */}
            <div className="flex justify-center items-center h-full">
              <EmptyList />
            </div>
          </>
        ) : (
          tasksList.map((task:any) => (
            <TaskItem
              key={task.task.id}
              task={task}
              onAction={handleTaskAction}
              taskType={taskType}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default PointsTask
