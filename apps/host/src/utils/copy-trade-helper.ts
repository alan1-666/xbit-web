import { ConfigStatus } from "@/@generated/gql/graphql-trading"

 export function getStatusColor(status: ConfigStatus, isBg?: boolean): string {
    switch (status) {
      case ConfigStatus.Active:
        return isBg ? 'bg-rise' : 'text-rise'
      case ConfigStatus.Paused:
        return isBg ? 'bg-[#908E98]' : 'text-[#908E98]'
      case ConfigStatus.Canceled:
        return isBg ? 'bg-[#ff000080]' : 'text-[#ff000080]'
      default:
        return isBg ? 'bg-white' : 'text-white'
    }
  }
