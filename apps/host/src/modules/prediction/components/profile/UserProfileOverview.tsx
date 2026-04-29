import ProfitLossChartCard from '../shared/ProfitLossChartCard'
import UserInfoCard from './UserInfoCard'

interface UserProfileOverviewProps {
  userId?: string
}

export const UserProfileOverview = ({ userId = '' }: UserProfileOverviewProps) => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
      {/* User Info Card */}
      <UserInfoCard userId={userId} />

      {/* Profit/Loss Card */}
      <ProfitLossChartCard userAddress={userId} />
    </div>
  )
}
