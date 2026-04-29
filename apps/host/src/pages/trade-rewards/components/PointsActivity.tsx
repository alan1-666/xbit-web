import { useTranslation } from 'react-i18next'
import MovingLineTabs from '@components/common/MovingLineTabs.tsx'
import { useState ,useEffect} from 'react'
import PointsTask from './pointsTask'
import { useTradeRewards } from '../hooks/useTradeRewards'
import { EmptyList } from '@components/discover/EmptyList.tsx'
import { useSelector } from 'react-redux'
import { DialogControl } from '..'

interface PointsTaskProps {
  taskType: 'DAILY' | 'COMMUNITY' | 'TRADING' 
  }
  
const PointsActivity = ({setOpen}: DialogControl) => {
  const { t } = useTranslation()
  const [currentTab, setCurrentTab] = useState('DAILY')
  const [refresh, setRefresh] = useState(false)
  const taskCategories = useSelector((state: any) => state.agent.taskCategories)
  const { fetchTasksByType, tasksList } = useTradeRewards()

  useEffect(() => {
    fetchTasksByType(currentTab)
  }, [])
  return (
    <div className="mt-3">
         {taskCategories.length <= 0 ? (
          <div className='flex justify-center items-center h-full'>
            <EmptyList />
          </div>
         ) : (
          <div>
            <div className='flex items-center justify-between  mb-4'>
              <MovingLineTabs
                  tabs={taskCategories}
                  containerClassName="bg-transparent justify-start after:hidden after:h-0 after:w-0 flex-1"
                  tabsListClassName="justify-start font-medium"
                  itemClassName="text-[14px]"
                  defaultTab={taskCategories[0]?.value}
                  onTabChange={(tab) => {
                    setCurrentTab(tab)
                    fetchTasksByType(tab)
                  }}
              />
              <div onClick={() => {
                  // 刷新 需要重新请求数据
                  setRefresh(true)
                  // 点击的时候 图标旋转
                  const img = document.querySelector('img') as HTMLImageElement
                  img.classList.add('animate-spin')
                  setTimeout(() => {
                      img.classList.remove('animate-spin')
                      setRefresh(false)
                  }, 800)
                  fetchTasksByType(currentTab)
              }}>
                  <img src="/images/nodeAgent/rotate-left.svg" className="w-[20] h-[20] origin-center" alt="rotate-left" />
              </div>
              </div>
              {/* Task List */}
              <PointsTask taskType={currentTab as PointsTaskProps['taskType']} handleRefresh={()=>fetchTasksByType(currentTab)} tasksList={tasksList} setOpen={setOpen} />
          </div>
         )}

    </div>
  )
}

export default PointsActivity