import { cn } from '@/lib/utils'
import { useEffect, useState, useMemo } from 'react'
import { 
    UserRedPacketStatus, 
    ActivityHistoryResponse, 
    ActivityHistoryEntry,
    ActivityType,
    WithdrawalStatus
} from '@/@generated/gql/graphql-redpacket'
import { redpacketClient } from '@/lib/gql/apollo-client'
import { WITHDRAW_RED_PACKET_MUTATION, GET_USER_ACTIVITY_HISTORY, GET_RED_PACKET_STATUS_QUERY } from '@/services/redpacket.service.ts'
import { toast } from 'sonner'
import { IconEmpty } from '@/components/icon'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { WithdrawConfirmModal } from '../../ConfirmModal'
import { Skeleton } from '@/components/ui/skeleton'
import ls from '@/lib/local-storage'
import Loader from '@/components/common/Loader'
import DownloadModal from '@/pages/redpacket/components/h5/DownloadModal'
import { ShareXbitDrawer } from '@/components/settings/ShareXbitDrawer'

export enum ActivityStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Expired = 'EXPIRED',
  Opened = 'OPENED'
}



const HistoryItem = ({ iconType, title, label, time, amount, status, isLast }: 
  { iconType: ActivityType; title: ActivityType; label?: { text: string; color: string }; time: string; amount: string; status: ActivityStatus; isLast?: boolean }) => {
  const { t } = useTranslation()
  const renderIcon = () => {
    switch (iconType) {
      case ActivityType.TwitterBinding:
        return (
          <div className="w-4 h-4 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10.6666 14V12.6667C10.6666 11.9594 10.3856 11.2811 9.88554 10.781C9.38544 10.281 8.70716 10 7.99992 10H3.99992C3.29267 10 2.6144 10.281 2.1143 10.781C1.6142 11.2811 1.33325 11.9594 1.33325 12.6667V14" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M5.99992 7.33333C7.47268 7.33333 8.66659 6.13943 8.66659 4.66667C8.66659 3.19391 7.47268 2 5.99992 2C4.52716 2 3.33325 3.19391 3.33325 4.66667C3.33325 6.13943 4.52716 7.33333 5.99992 7.33333Z" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12.6667 5.3335V9.3335" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M14.6667 7.3335H10.6667" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        );
    case ActivityType.TwitterFollow:
      return (
        <div className="w-4 h-4 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10.6666 14V12.6667C10.6666 11.9594 10.3856 11.2811 9.88554 10.781C9.38544 10.281 8.70716 10 7.99992 10H3.99992C3.29267 10 2.6144 10.281 2.1143 10.781C1.6142 11.2811 1.33325 11.9594 1.33325 12.6667V14" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5.99992 7.33333C7.47268 7.33333 8.66659 6.13943 8.66659 4.66667C8.66659 3.19391 7.47268 2 5.99992 2C4.52716 2 3.33325 3.19391 3.33325 4.66667C3.33325 6.13943 4.52716 7.33333 5.99992 7.33333Z" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12.6667 5.3335V9.3335" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M14.6667 7.3335H10.6667" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      );
      case ActivityType.Trade:
        return (
          <div className="w-4 h-4 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14.6666 4.6665L8.99992 10.3332L5.66659 6.99984L1.33325 11.3332" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M10.6667 4.6665H14.6667V8.6665" stroke="#777777" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        );
      case ActivityType.Deposit:
        return (
          <div className="w-4 h-4 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M8.90918 3.71191V14.1059" stroke="#777777" stroke-width="1.48485" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M14.1061 8.90918L8.90913 14.1061L3.71216 8.90918" stroke="#777777" stroke-width="1.48485" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        );
      case ActivityType.LuckyDraw:
        return (
          <div className="w-4 h-4 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.3332 2.0957C11.9942 2.0957 12.6298 2.35026 13.1081 2.80652C13.5864 3.26278 13.8706 3.88571 13.9017 4.54599L13.9046 4.66713V11.3334C13.9046 11.9944 13.65 12.6301 13.1938 13.1083C12.7375 13.5866 12.1146 13.8708 11.4543 13.902L11.3332 13.9048H4.66689C4.00588 13.9048 3.37025 13.6503 2.89196 13.194C2.41367 12.7378 2.12946 12.1148 2.09832 11.4546L2.09546 11.3334V4.66713C2.09546 4.00612 2.35001 3.3705 2.80628 2.89221C3.26254 2.41392 3.88547 2.1297 4.54574 2.09856L4.66689 2.0957H11.3332ZM11.3332 3.23856H4.66689C4.30428 3.23849 3.95522 3.37632 3.69048 3.62409C3.42573 3.87186 3.26511 4.21103 3.24117 4.57285L3.23832 4.66713V11.3334C3.23825 11.696 3.37607 12.0451 3.62384 12.3098C3.87161 12.5746 4.21079 12.7352 4.5726 12.7591L4.66689 12.762H11.3332C11.6958 12.7621 12.0448 12.6242 12.3096 12.3765C12.5743 12.1287 12.735 11.7895 12.7589 11.4277L12.7617 11.3334V4.66713C12.7618 4.30453 12.624 3.95547 12.3762 3.69072C12.1284 3.42597 11.7893 3.26535 11.4275 3.24142L11.3332 3.23856ZM7.53889 4.99627C7.58838 4.92854 7.65218 4.87254 7.72575 4.83224C7.79933 4.79195 7.88087 4.76834 7.96459 4.7631C8.04832 4.75787 8.13216 4.77113 8.21018 4.80195C8.2882 4.83276 8.35848 4.88038 8.41603 4.94142L8.46175 4.99627L9.32403 6.17685L10.7143 6.63342C10.7891 6.65795 10.858 6.69766 10.9167 6.75006C10.9754 6.80246 11.0226 6.86642 11.0555 6.93793C11.0883 7.00944 11.106 7.08696 11.1075 7.16564C11.1089 7.24431 11.0942 7.32244 11.064 7.39513L11.0355 7.45399L10.9995 7.51113L10.1429 8.69685L10.1389 10.1597C10.1387 10.2385 10.1222 10.3163 10.0904 10.3884C10.0587 10.4605 10.0124 10.5252 9.95444 10.5786C9.89648 10.6319 9.82813 10.6727 9.75367 10.6983C9.67921 10.724 9.60025 10.734 9.52174 10.7277L9.45774 10.7186L9.3926 10.7014L7.99946 10.254L6.60746 10.7014C6.53249 10.7256 6.45333 10.7341 6.37494 10.7263C6.29655 10.7184 6.22062 10.6945 6.15194 10.6559C6.08325 10.6173 6.02328 10.5649 5.9758 10.5021C5.92832 10.4392 5.89435 10.3672 5.87603 10.2906L5.86517 10.2266L5.86117 10.1591L5.8566 8.69685L5.0006 7.51056C4.95447 7.44673 4.92203 7.37405 4.90532 7.29709C4.88861 7.22013 4.88799 7.14055 4.9035 7.06333C4.91901 6.98612 4.95031 6.91295 4.99544 6.8484C5.04056 6.78386 5.09855 6.72934 5.16574 6.68827L5.22289 6.65799L5.28574 6.63342L6.67546 6.17685L7.53832 4.99627H7.53889ZM8.00003 6.30142L7.48974 6.9997C7.43347 7.0767 7.35882 7.13838 7.2726 7.17913L7.20632 7.20542L6.3846 7.47513L6.89089 8.17685C6.9327 8.23465 6.96333 8.29977 6.98117 8.36885L6.99432 8.43799L6.99889 8.50942L7.00117 9.37399L7.82517 9.10942C7.89302 9.08762 7.96434 9.07871 8.03546 9.08313L8.10574 9.09227L8.17489 9.10942L8.99832 9.37399L9.00117 8.50942C9.00143 8.4382 9.01499 8.36765 9.04117 8.30142L9.07089 8.23685L9.10917 8.17685L9.61489 7.47513L8.79375 7.20542C8.726 7.18321 8.66301 7.14851 8.60803 7.10313L8.5566 7.05456L8.51089 6.9997L8.00003 6.30142Z" fill="#777777" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-4 h-4 relative overflow-hidden ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" className="rotate-180">
              <path d="M8.90918 3.71191V14.1059" stroke="#777777" stroke-width="1.48485" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M14.1061 8.90918L8.90913 14.1061L3.71216 8.90918" stroke="#777777" stroke-width="1.48485" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        );
    }
    
  };

  const renderStatusIcon = () => {
    if (status === ActivityStatus.Pending) {
      return (
        <div className="inline-flex justify-end items-center gap-1">
          <div className="w-4 h-4 relative overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.99992 14.6668C11.6818 14.6668 14.6666 11.6821 14.6666 8.00016C14.6666 4.31826 11.6818 1.3335 7.99992 1.3335C4.31802 1.3335 1.33325 4.31826 1.33325 8.00016C1.33325 11.6821 4.31802 14.6668 7.99992 14.6668Z" stroke="#FFAE00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M8 4V8L10.6667 6.66667" stroke="#FFAE00" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div className="text-right justify-start text-amber-500 text-sm font-medium leading-4">{t('red.packet.pending')}</div>
        </div>
      );
    } else {
      // 判断是否为负数（可能以 - 开头，或者 parseFloat 后小于 0）
      const isNegative = amount.startsWith('-') || parseFloat(amount) < 0
      const textColor = isNegative ? 'text-[#FE417A]' : 'text-emerald-600'
      
      return (
        <div className="inline-flex justify-end items-center gap-1">
          <div className={`text-right justify-start ${textColor} text-sm font-medium leading-4`}>{amount}</div>
        </div>
      );
    }
  };

  const renderStatus = () => {
    if (status === ActivityStatus.Pending) {
      return t('red.packet.WaitOpen')
    } else if (status === ActivityStatus.Opened || status === ActivityStatus.Completed) {
      if (iconType === ActivityType.Withdrawal) {
        return t('red.packet.completed')
      } else {
        return t('red.packet.opened')
      }
    } else if (status === ActivityStatus.Expired) {
      return t('red.packet.expired')
    } else if (status === ActivityStatus.Failed) {
      return t('red.packet.failed')
    }
  }

  return (
    <div className={cn("self-stretch px-4 py-3 inline-flex justify-between items-center", !isLast && "border-b border-white/20")}>
      <div className="flex justify-start items-center gap-2">
        <div className="p-1.5 bg-white/10 rounded-full flex justify-center items-center gap-2.5">
          {renderIcon()}
        </div>
        <div className="inline-flex flex-col justify-start items-start gap-1">
          <div className="inline-flex justify-start items-center gap-2">
            <div className="justify-start text-white text-sm font-medium leading-4">{title}</div>
            {label && (
              <div className={`px-1 py-0.5 bg-${label.color}/20 rounded flex justify-center items-center gap-0.5`}>
                {
                  label.text === 'Jackpot' && <div className="w-3.5 h-3.5 relative overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M0.354004 12.9475C0.16123 12.9475 0.00537109 12.7902 0.00537109 12.5975C0.00537109 12.4047 0.16123 12.2475 0.354004 12.2475H13.6171C13.8099 12.2475 13.9657 12.4047 13.9657 12.5975C13.9657 12.7902 13.8085 12.9475 13.6171 12.9475H0.354004ZM1.40127 8.04884L3.4958 10.1475C3.58057 10.4647 3.49033 10.7682 3.14717 10.8475L0.704004 11.5475C0.615137 11.5871 0.420996 11.4791 0.355371 11.1975C0.31709 11.1072 0.42373 10.9131 0.704004 10.8475L2.44854 10.1475L0.354004 8.04884C0.243262 7.70294 0.403223 7.34884 0.702637 7.34884H3.1458L1.75127 2.80158C1.68291 2.58146 2.03838 2.32716 2.4499 2.45158L5.5917 4.55021L6.63897 1.40158C6.77432 0.96681 7.22275 0.977747 7.3376 1.40158L8.73076 5.25021L11.1739 3.50158C11.6087 3.3799 11.9587 3.63966 11.8726 3.85158L10.8253 7.00021H12.9198C13.2124 6.99747 13.3751 7.33654 13.2685 7.70021L10.8253 10.4988L13.2685 10.8488C13.4995 10.8721 13.6362 11.0457 13.6171 11.1988C13.5938 11.4299 13.4202 11.568 13.2685 11.5488L10.1267 11.1988C9.83135 11.1647 9.69873 10.8447 9.77803 10.4988L12.2212 7.70021H10.4767C10.2415 7.69884 10.0733 7.47189 10.128 7.35021L10.8267 4.55158L8.73076 6.30021C8.39033 6.37267 8.12646 6.2797 8.03213 5.95021L6.98623 2.45158L5.93896 5.25021C5.84736 5.5879 5.58623 5.6713 5.24033 5.60021L2.79717 3.50158L3.84443 7.70021C3.89229 7.82736 3.72549 8.05021 3.4958 8.05021H1.40127V8.04884Z" fill="#00A45D" />
                    </svg>
                  </div>
                }

                <div className={`justify-start text-${label.color} text-xs font-normal leading-3`}>{label.text}</div>
              </div>
            )}
          </div>
          <div className="justify-start text-neutral-500 text-xs font-normal leading-3">{time}</div>
        </div>
      </div>
      <div className="inline-flex flex-col justify-start items-end gap-1">
        {renderStatusIcon()}
        <div className="text-right justify-start text-neutral-500 text-xs font-normal leading-4">{renderStatus()}</div>
      </div>
    </div>
  );
};

interface RewardsPageProps {
  withdrawalThreshold: number
  withdrawalEnabledWeb?: boolean
}

const RewardsPage = ({ withdrawalThreshold, withdrawalEnabledWeb }: RewardsPageProps) => {
  const { t } = useTranslation()

  const [redpacketStatus, setRedpacketStatus] = useState<UserRedPacketStatus | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryResponse | null>(null);
  const [isOpenWithdrawConfirmModal, setIsOpenWithdrawConfirmModal] = useState<boolean>(false)
  const [isOpenDownloadModal, setIsOpenDownloadModal] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // 本地存储的 key
  const ACTIVITY_HISTORY_CACHE_KEY = 'redpacket.activityHistory'
  
  // 初始化时检查是否有缓存，决定是否显示 loading
  const [loading, setLoading] = useState<boolean>(() => {
    // 首次访问时，如果没有缓存数据，显示 loading
    const hasCache = !!ls.get(ACTIVITY_HISTORY_CACHE_KEY)
    return !hasCache
  })
  
  const getItemTitle = (title: ActivityType) => {
    if (title === ActivityType.Deposit) return t('red.packet.deposit.title')
    if (title === ActivityType.Trade) return t('red.packet.trade.title')
    if (title === ActivityType.LuckyDraw) return t('red.packet.lucky.draw')
    if (title === ActivityType.TwitterBinding) return t('red.packet.connet.twitter')
    if (title === ActivityType.TwitterFollow) return t('red.packet.follw.official')
    if (title === ActivityType.Withdrawal) return t('withdrawal.button.withdraw')
    return title
  }
  const historyData: { iconType: ActivityType; title: ActivityType; label?: { text: string; color: string }; time: string; amount: string; status: ActivityStatus }[] = useMemo(() => {
    if (!activityHistory) return [];
    return activityHistory.activities.filter(item => item.status !== ActivityStatus.Failed)
    .map((activity: ActivityHistoryEntry) => {
      return {
        iconType: activity.type,
        title: getItemTitle(activity.type),
        label: activity.isJackpot ? { text: t('red.packet.jackpot.head'), color: 'emerald-600' } : undefined,
        time: dayjs(activity.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        amount:  activity.amount ? activity.type === ActivityType.Withdrawal ? `-${activity.amount}` : `+${activity.amount}` : '',
        status: activity.status as ActivityStatus, // PENDING, OPENED, EXPIRED, COMPLETED, FAILED
      }
    })
  }, [activityHistory, t]);

  const summary = activityHistory?.summary || {
    totalPackets: 0,
    totalWithdrawals: 0,
    totalWithdrawalSuccess: 0,
    totalWithdrawalFailed: 0,
  }
  const getUserRedpacketStatus = async () => {
    setIsLoading(true)
    try {
      const res = await redpacketClient.query({
        query: GET_RED_PACKET_STATUS_QUERY,
        variables: {},
      })
      setRedpacketStatus(res?.data?.getRedPacketStatus)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const getUserActivityHistory = async () => {
    try {
      const res = await redpacketClient.query({
        query: GET_USER_ACTIVITY_HISTORY,
        variables: {
          limit: 1000,
          offset: 0
        },
      })
      const newData = res?.data?.getActivityHistory
      if (newData) {
        setActivityHistory(newData)
        // 保存到本地存储
        ls.set(ACTIVITY_HISTORY_CACHE_KEY, newData)
      }
    } catch (error) {
      setActivityHistory(null)
    }
  }

  // 从本地存储加载数据
  const loadActivityHistoryFromCache = () => {
    try {
      const cachedData = ls.get(ACTIVITY_HISTORY_CACHE_KEY) as ActivityHistoryResponse | null
      if (cachedData) {
        setActivityHistory(cachedData)
      }
    } catch (error) {
      // 如果读取失败，忽略错误
    }
  }
  const handleRreshData = () => {
    getUserRedpacketStatus()
  }

  const availableBalance = Number(redpacketStatus?.availableBalance || 0)

  const handleClaim = async () => {
    try {
      const res = await redpacketClient.mutate({
        mutation: WITHDRAW_RED_PACKET_MUTATION,
        variables: {},
      })
      if (res.data?.withdrawRedPacket?.status !== WithdrawalStatus.Failed) {
        toast.success(t('red.packet.withdraw.result.tips'))
        if (res.data?.withdrawRedPacket?.status === WithdrawalStatus.Completed) {
          handleRreshData()
        }
      } else {
        toast.error('Withdraw request failed. Please try again later.')
      }

    } catch (error: any) {
      toast.error(error?.[0]?.message || 'Withdraw request failed. Please try again later.')
    }

  }

  const handleClickApp = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    const isAndroid = /android/i.test(userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream

    if (isAndroid) {
      window.open('https://play.google.com/store/apps/details?id=com.xtech.xbitmobile&hl=en', '_blank')
    } else if (isIOS) {
      window.open('https://apps.apple.com/vn/app/xbit-buy-bitcoin-perps-dex/id6747072897', '_blank')
    } else {
      window.location.href = 'https://app.xbit.com/apps'
    }
  }

  const hanleWithdrawClick = () => {
    const isWithdrawalEnabledWeb = withdrawalEnabledWeb !== false
    if (!isWithdrawalEnabledWeb) {
      setIsOpenDownloadModal(true)
      return
    }
    setIsOpenWithdrawConfirmModal(true)
  }
  const handleWithdrawConfirmModal = (status: boolean, action: 'cancel' | 'confirm') => {
      setIsOpenWithdrawConfirmModal(status)
      if (action === 'confirm') {
        handleClaim()
      }
    
  }


  useEffect(() => {
    // 先从本地存储加载 activityHistory 数据（立即显示，如果有缓存）
    loadActivityHistoryFromCache()
    
    // 调用 API 获取最新数据（静默更新，不显示 loading）
    const fetchData = async () => {
      try {
        // getUserRedpacketStatus 正常调用
        await getUserRedpacketStatus()
        // getUserActivityHistory 会静默更新缓存和UI
        await getUserActivityHistory()
      } finally {
        // 首次访问时，API 调用完成后关闭 loading
        setLoading(false)
      }
    }
    fetchData()
  }, [])


  return (
    <div className="flex flex-col h-full">
      <div className="w-full px-3 py-8 bg-neutral-950 inline-flex flex-col justify-start items-end gap-6 overflow-hidden">
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
          <div className="justify-start text-white text-xl font-medium">{t('red.packet.my.rewards')}</div>
          <div className="opacity-60 justify-start text-white text-xs font-normal">{t('red.packet.view.balance.history.tips')}</div>
        </div>
        <div className="relative bg-[url('/images/redpacket/bg-2.png')] bg-cover bg-center self-stretch px-5 py-8 rounded-3xl shadow-[inset_0px_11px_30px_0px_rgba(255,42,106,0.16)] outline outline-1 outline-offset-[-1px] outline-white/10 flex flex-col justify-center items-center gap-12 overflow-hidden min-h-[294px]">
          <div className="self-stretch flex flex-col justify-start items-start gap-8">
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <div className="inline-flex justify-start items-center gap-2">
                <div className="w-5 h-5 relative overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.6666 10.0002V6.66683H4.99992C4.55789 6.66683 4.13397 6.49123 3.82141 6.17867C3.50885 5.86611 3.33325 5.44219 3.33325 5.00016C3.33325 4.0835 4.08325 3.3335 4.99992 3.3335H14.9999V6.66683" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M3.33325 5V15C3.33325 15.9167 4.08325 16.6667 4.99992 16.6667H16.6666V13.3333" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M14.9999 10C14.5579 10 14.134 10.1756 13.8214 10.4882C13.5088 10.8007 13.3333 11.2246 13.3333 11.6667C13.3333 12.5833 14.0833 13.3333 14.9999 13.3333H18.3333V10H14.9999Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div className="opacity-60 justify-start text-white text-sm font-normal">{t('red.packet.packet.balance')}</div>
              </div>
              <div className="opacity-60 justify-start text-white text-sm font-normal">{t('red.packet.total.withdrawn')}: {redpacketStatus?.totalWithdrawn || 0}</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <div className="inline-flex justify-start items-end gap-[3px] h-[36px]">
                {isLoading ? <Loader className="size-2" />
                : 
                <>
                  <div className="text-right justify-start text-white text-4xl font-bold">{availableBalance}</div>
                  <div className="pb-1.5 flex justify-center items-center gap-2.5">
                    <div className="justify-start text-white text-xs font-normal">USDC</div>
                  </div>
                </>
                }
              </div>
              <div className="self-stretch opacity-60 justify-start text-white text-sm font-normal">{t('red.packet.withdraw.threshold')}: {withdrawalThreshold} USDC</div>
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-center items-center gap-2.5">
            <div className="self-stretch px-2 py-2 bg-white/10 rounded-[20px] shadow-[inset_0px_-1px_4px_0px_rgba(255,255,255,0.25),inset_2px_2px_4px_0px_rgba(255,255,255,0.25)] backdrop-blur-3px  flex flex-col justify-center items-center gap-2.5 overflow-hidden">
              <div className="inline-flex justify-center items-center gap-1.5">
                {
                  availableBalance < withdrawalThreshold && <div className=" relative overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M15.8333 9.1665H4.16667C3.24619 9.1665 2.5 9.9127 2.5 10.8332V16.6665C2.5 17.587 3.24619 18.3332 4.16667 18.3332H15.8333C16.7538 18.3332 17.5 17.587 17.5 16.6665V10.8332C17.5 9.9127 16.7538 9.1665 15.8333 9.1665Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M5.83325 9.1665V5.83317C5.83325 4.7281 6.27224 3.66829 7.05364 2.88689C7.83504 2.10549 8.89485 1.6665 9.99992 1.6665C11.105 1.6665 12.1648 2.10549 12.9462 2.88689C13.7276 3.66829 14.1666 4.7281 14.1666 5.83317V9.1665" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                }
                {
                  availableBalance < withdrawalThreshold && (() => {
                    const diff = withdrawalThreshold - availableBalance;
                    const formattedDiff = Number.isInteger(diff) ? diff.toString() : diff.toFixed(2);
                    return (
                      <div className="justify-start">
                        <span className="text-yellow-400 text-xs font-medium">{`${t('red.packet.need.title')}: ${formattedDiff}`}</span>
                        <span className="text-white text-xs font-medium"> {t('red.packet.need.more.to.withdraw')}</span>
                      </div>
                    );
                  })()
                }
                {
                  availableBalance >= withdrawalThreshold && <div className="justify-start inline-flex items-center">
                    <img className="w-6 h-5 mr-2.5" src="/images/redpacket/gift.png"/>
                    <span className="text-white text-xs font-medium cursor-pointer" onClick={() => hanleWithdrawClick()}>{t('red.packet.claim')}</span>
                  </div>
                }

              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch rounded-[20px] flex flex-col justify-start items-end gap-6">
          <div className="self-stretch bg-neutral-900 rounded-2xl flex flex-col justify-start items-center">
            <div className="self-stretch px-4 pt-6 pb-3 rounded-tl-3xl rounded-tr-3xl border-b border-white/10 flex flex-col justify-start items-start gap-1">
              <div className="self-stretch justify-start text-white text-xl font-semibold">{t('red.packet.history')}</div>
              <div className="self-stretch justify-start text-neutral-500 text-xs font-medium">{t('red.packet.packets',{num: summary.totalPackets})}, {t('red.packet.withdrawals',{num: summary.totalWithdrawalSuccess})}</div>
            </div>
            {
              loading ? (
                <div className="flex flex-col items-center justify-center w-full">
                  {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="self-stretch px-3 py-4 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                      <div className="self-stretch inline-flex justify-between items-center">
                        <div className="flex justify-start items-center gap-2">
                          <Skeleton className="w-5 h-5 rounded-lg" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    ))} 
                </div>
              ) : !historyData.length ? (
                <div className="flex flex-col items-center justify-center h-40 w-full">
                  <IconEmpty />
                  <span className="text-[#FFFFFF80] text-[0.75rem]">{t('futuresDetails.tips.noData')}</span>
                </div>
              ) : (
                historyData.map((item, index) => (
                  <HistoryItem key={index} {...item} isLast={index === historyData.length - 1} />
                ))
              )
            }
          </div>
          <div className="self-stretch px-5 py-4 bg-yellow-300/10 rounded-2xl outline outline-1 outline-offset-[-1px] outline-yellow-300/30 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              <div className="w-4 h-4 relative overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clip-path="url(#clip0_2308_32253)">
                    <path d="M3.33325 12.6668V6.00016C3.33325 3.42283 5.42259 1.3335 7.99992 1.3335C10.5773 1.3335 12.6666 3.42283 12.6666 6.00016V12.6668M1.33325 12.6668H14.6666" stroke="#FFDC3E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M7.99992 14.6665C8.92039 14.6665 9.66659 13.9203 9.66659 12.9998V12.6665H6.33325V12.9998C6.33325 13.9203 7.07945 14.6665 7.99992 14.6665Z" stroke="#FFDC3E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_2308_32253">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className="flex-1 justify-start text-yellow-300 text-sm font-normal">{t("red.packet.v2.coming.soon")}</div>
            </div>
          </div>
        </div>
      </div>
      <WithdrawConfirmModal 
        isOpen={isOpenWithdrawConfirmModal}
        onOpenChange={handleWithdrawConfirmModal}
        />
      <DownloadModal
        isOpen={isOpenDownloadModal}
        onOpenChange={() => setIsOpenDownloadModal(false)}
        onClickShare={() => setShowShare(true)}
        onClickApp={handleClickApp}
      />
      <ShareXbitDrawer open={showShare} setOpen={setShowShare} />
    </div>
  )
}

export default RewardsPage
