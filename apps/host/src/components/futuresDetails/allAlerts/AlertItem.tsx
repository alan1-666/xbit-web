import ImgWithFallback from '@/components/common/ImgWithFallback'
import { IconEmpty } from '@/components/icon'
import { Switch } from '@/components/ui/switch'
import { Configs } from '@/const/configs'
import { CheckCircle2, ChevronDown, Circle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

interface AlertItemProps {
  coin: any
  isEdit?: boolean
  selectedAlertIds: string[]
  onToggleSelectAlert: (coin: string, id: string) => void
  onToggleSelectAll?: (coin: string, checked: boolean) => void
}

const AlertItem = ({ coin, isEdit, selectedAlertIds, onToggleSelectAlert, onToggleSelectAll }: AlertItemProps) => {
  const [open, setOpen] = useState(true)
  const [alerts, setAlerts] = useState(coin.alerts || [])

  const getClassName = (type: number) => {
    switch (type) {
      case 1:
        return 'text-[#AB57FF]'
      case 2:
        return 'text-[#00FFB4]'
      case 3:
        return 'text-[#AB57FF]'
      default:
        return 'text-[#00FFB4]'
    }
  }

  const isHeaderChecked = useMemo(() => {
    if (alerts.length === 0) return false
    return selectedAlertIds.length === alerts.length
  }, [alerts, selectedAlertIds])

  const isHeaderIndeterminate = useMemo(() => {
    return selectedAlertIds.length > 0 && selectedAlertIds.length < alerts.length
  }, [alerts, selectedAlertIds])

  useEffect(() => {
    setAlerts(coin.alerts || [])
  }, [coin])

  const handleHeaderClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    const newChecked = !isHeaderChecked
    onToggleSelectAll?.(coin.id, newChecked)
  }

  const handleAlertCircleClick = (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSelectAlert(coin.id, alertId)
  }

  const renderHeaderIcon = () => {
    if (!isEdit || alerts.length === 0) {
      return <Circle className="text-[#878787] w-[calc(1rem*(18/16))] h-[calc(1rem*(18/16))]" />
    }

    if (isHeaderChecked) {
      return <CheckCircle2 className="text-[#00FFB4] w-[calc(1rem*(18/16))] h-[calc(1rem*(18/16))]" />
    }

    if (isHeaderIndeterminate) {
      return (
        <div className="relative w-[calc(1rem*(18/16))] h-[calc(1rem*(18/16))]">
          <Circle className="text-[#878787] w-full h-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#00FFB4] rounded-full" />
        </div>
      )
    }

    return <Circle className="text-[#878787] w-[calc(1rem*(18/16))] h-[calc(1rem*(18/16))]" />
  }

  return (
    <div className="rounded-[0.5rem] border border-[#ECECED14]">
      <div
        className="flex items-center justify-between bg-[#ECECED0A] border-b border-[#ECECED0A] p-3 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between gap-3">
          {isEdit && <div onClick={(e) => handleHeaderClick(e)}>{renderHeaderIcon()}</div>}
          <div className="flex items-center space-x-3">
            <ImgWithFallback
              src={`${Configs.getHyperliquidConfig().imgUrl}/${coin?.symbol}.svg`}
              srcFallback="/images/logo-pair-fallback.webp"
              sharedClassName="size-7"
            />
            <div className="font-bold text-base app-font-medium">{coin.symbol}USD永续</div>
          </div>
        </div>
        <ChevronDown
          className={`relative top-[1px] text-[#B9B9B9] ml-1 h-5 w-5 transition duration-300 ${open && 'rotate-180'}`}
          aria-hidden="true"
        />
      </div>
      {open && coin?.alerts?.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center py-7">
          <IconEmpty />
          <div className="text-[#FFFFFF80] text-xs">当前交易品种暂无预警</div>
        </div>
      )}
      {open &&
        alerts?.map((alert, index) => (
          <div
            key={alert.id}
            className="flex items-center gap-3 border-b border-[#ECECED14] mx-3 py-3.5 last:border-none"
          >
            {isEdit && (
              <div onClick={(e) => handleAlertCircleClick(alert.id, e)} className="cursor-pointer">
                {selectedAlertIds.includes(alert.id) ? (
                  <CheckCircle2 className="text-[#00FFB4] w-[calc(1rem*(18/16))] h-[calc(1rem*(18/16))]" />
                ) : (
                  <Circle className="text-[#878787] w-[calc(1rem*(18/16))] h-[calc(1rem*(18/16))]" />
                )}
              </div>
            )}
            <div className={`w-full flex items-center justify-between ${!isEdit && 'pl-10'}`}>
              <div>
                <div className="text-sm">
                  {alert.label} <span className={`${getClassName(alert?.type)} app-font-medium`}>{alert.value}</span>
                </div>
                <div className="pt-2 text-sm text-[#FFFFFFB2]">{alert.repeat ? '重复提醒' : '仅提醒一次'}</div>
              </div>
              <Switch
                checked={alert.enabled}
                className="w-12 h-[26.35px]"
                classNameThumb="h-[23px] w-[23px]"
                onCheckedChange={(checked) => {
                  const newAlerts = [...alerts]
                  newAlerts[index] = {
                    ...newAlerts[index],
                    enabled: checked,
                  }
                  setAlerts(newAlerts)
                }}
              />
            </div>
          </div>
        ))}
    </div>
  )
}

export default AlertItem
