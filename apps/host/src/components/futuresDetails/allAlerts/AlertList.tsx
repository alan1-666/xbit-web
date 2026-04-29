import { Button } from '@/components/ui/button'
import AlertItem from './AlertItem'
import { Dispatch, SetStateAction, useState } from 'react'
import CreateAlertDrawer from './CreateAlertDrawer'
import { CheckCircle2, Circle } from 'lucide-react'

const alertsData = [
    {
    id: 'sol',
    symbol: 'SOL',
    icon: 'sol',
    alerts: [],
  },
  {
    id: 'btc',
    symbol: 'BTC',
    icon: 'btc',
    alerts: [
      {
        id: 'btc-1',
        label: '价格上涨至',
        value: '10,000',
        color: 'text-green-400',
        repeat: false,
        enabled: true,
        type: 0,
      },
      {
        id: 'btc-2',
        label: '价格下跌至',
        value: '9,000',
        color: 'text-purple-400',
        repeat: true,
        enabled: false,
        type: 1,
      },
      {
        id: 'btc-3',
        label: '24小时涨幅超过',
        value: '5%',
        color: 'text-green-400',
        repeat: true,
        enabled: false,
        type: 2,
      },
    ],
  },
  {
    id: 'eth',
    symbol: 'ETH',
    icon: 'eth',
    alerts: [
      {
        id: 'eth-1',
        label: '24h涨幅超过',
        value: '12%',
        color: 'text-green-400',
        repeat: false,
        enabled: true,
        type: 2,
      },
      {
        id: 'eth-2',
        label: '24h跌幅超过',
        value: '10%',
        color: 'text-purple-400',
        repeat: true,
        enabled: true,
        type: 1,
      },
      {
        id: 'eth-3',
        label: '价格下跌至',
        value: '9,000',
        color: 'text-purple-400',
        repeat: true,
        enabled: false,
        type: 1,
      },
    ],
  }
]

interface AlertListProps {
  isEdit: boolean
  setIsEdit: Dispatch<SetStateAction<boolean>>
}

const AlertList = ({ isEdit, setIsEdit }: AlertListProps) => {
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedAlertIds, setSelectedAlertIds] = useState<{ [coinId: string]: string[] }>({})

  const toggleSelectAlert = (coinId: string, alertId: string) => {
    setSelectedAlertIds((prev) => {
      const current = prev[coinId] || []
      if (current.includes(alertId)) {
        return { ...prev, [coinId]: current.filter((id) => id !== alertId) }
      } else {
        return { ...prev, [coinId]: [...current, alertId] }
      }
    })
  }

  const toggleSelectAll = (coinId: string, checked: boolean) => {
    const coin = alertsData.find((c) => c.id === coinId)
    if (!coin) return
    const allIds = coin.alerts.map((alert) => alert.id)
    setSelectedAlertIds((prev) => ({
      ...prev,
      [coinId]: checked ? allIds : [],
    }))
  }

  const handleCheckAll = () => {
    const newSelectedAlertIds: { [coinId: string]: string[] } = {}
    alertsData.forEach((coin) => {
      if (coin.alerts.length > 0) {
        newSelectedAlertIds[coin.id] = coin.alerts.map((alert) => alert.id)
      }
    })
    setSelectedAlertIds(newSelectedAlertIds)
  }

  const handleUncheckAll = () => {
    setSelectedAlertIds({})
  }

  const getTotalSelectedCount = () => {
    return Object.values(selectedAlertIds).reduce((total, ids) => total + ids.length, 0)
  }

  const getTotalAlertsCount = () => {
    return alertsData.reduce((total, coin) => total + coin.alerts.length, 0)
  }

  const isAllSelected = getTotalSelectedCount() === getTotalAlertsCount() && getTotalAlertsCount() > 0

  return (
    <div className="pb-24">
      <div className="mt-4 px-3 flex flex-col gap-2.5">
        {alertsData.map((coin) => (
          <AlertItem
            key={coin?.id}
            coin={coin}
            isEdit={isEdit}
            selectedAlertIds={selectedAlertIds[coin.id] || []}
            onToggleSelectAlert={toggleSelectAlert}
            onToggleSelectAll={toggleSelectAll}
          />
        ))}
      </div>
      <div className="fixed bottom-0 left-0 w-full bg-[#0A0A0A] flex justify-center">
        <div className="w-full max-w-[744px] pt-3 pb-6 px-3">
          {isEdit ? (
            <div className="flex items-center justify-between gap-2">
              <div
                className="flex gap-1 items-center cursor-pointer"
                onClick={isAllSelected ? handleUncheckAll : handleCheckAll}
              >
                {isAllSelected ? (
                  <CheckCircle2 className="text-[#00FFB4] w-5 h-5" />
                ) : (
                  <Circle className="text-[#878787] w-5 h-5" />
                )}
                <span>全选</span>
              </div>
              <Button
                variant="gradient"
                className="rounded-[50px] h-11 max-w-40 text-tertiary gap-0"
                onClick={() => setIsEdit(false)}
              >
                <span>删除</span>
                {getTotalSelectedCount() > 0 && <span>{`(${getTotalSelectedCount()})`}</span>}
              </Button>
            </div>
          ) : (
            <Button
              variant="gradient"
              className="rounded-[50px] h-11 w-full text-tertiary"
              onClick={() => setOpenCreate(true)}
            >
              添加
            </Button>
          )}
        </div>
      </div>
      {openCreate && <CreateAlertDrawer open={openCreate} setOpen={setOpenCreate} />}
    </div>
  )
}

export default AlertList
