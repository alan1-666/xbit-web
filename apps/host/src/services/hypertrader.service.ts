import { gql, TypedDocumentNode } from '@apollo/client'
import type { Query, QueryGetUserPositionHoldingTimeArgs } from '@/@generated/gql/graphql-hypertrader'

export const getUserPositionHoldingTime: TypedDocumentNode<
  Pick<Query, 'getUserPositionHoldingTime'>,
  QueryGetUserPositionHoldingTimeArgs
> = gql`
  query GetUserPositionHoldingTime($userAddress: String!) {
    getUserPositionHoldingTime(userAddress: $userAddress) {
      id
      userAddress
      coin
      lastFillsId
      lastOpenTime
      timeSum
      totalHoldingTime
      status
      updatedAt
      createdAt
    }
  }
`

// 获取交易时段数据
export type TradingSessionTab = 'ONE_DAY' | 'SEVEN_DAYS' | 'THIRTY_DAYS' | 'ALL'

export type TradingSessionRow = {
  slot0004Count: number
  slot0408Count: number
  slot0812Count: number
  slot1216Count: number
  slot1620Count: number
  slot2024Count: number
  statDate?: string | null
}

export type GetTradingSessionResp = {
  getTradingSession: TradingSessionRow | null
}

export const getTradingSessionGql = gql`
  query GetTradingSession($userAddress: String!, $timeRange: TradingSessionTimeRange!) {
    getTradingSession(userAddress: $userAddress, timeRange: $timeRange) {
      slot0004Count
      slot0408Count
      slot0812Count
      slot1216Count
      slot1620Count
      slot2024Count
      statDate
    }
  }
`

// 聪明钱列表
export const getActiveSmartMoneyGql = gql`
  query GetActiveSmartMoney(
    $periodDays: Int
    $recentDays: Int
    $page: Int
    $pageSize: Int
    $userAddress: String
    $tagIds: [Int!]
    $sortBy: SmartMoneySortField
  ) {
    getActiveSmartMoney(
      periodDays: $periodDays
      recentDays: $recentDays
      page: $page
      pageSize: $pageSize
      userAddress: $userAddress
      tagIds: $tagIds
      sortBy: $sortBy
    ) {
      success
      message
      data {
        userAddress
        roi
        netPnl
        avgWinRate
        maxDrawdown
        periodDays
        sharpeRatio
        profitLossRatio
        profitFactor
        totalVolume
        avgDailyVolume
        tradingDays
        totalTrades
        uniqueCoinsCount
        avgTradesPerDay
        totalLongPnl
        totalShortPnl
        winningPnlTotal
        losingPnlTotal
        kolLabels
        kolLabelsDescription
        followerCount
        remarkName
        groupIds
        portfolioData
        lastOperation {
          time
          coin
          side
          direction
          size
          price
          pnl
          fee
          tradeType
        }
        tags {
          category
          name
          nameCn
          color
          priority
          description
        }
      }
      pagination {
        page
        pageSize
        total
        totalPages
      }
    }
  }
`

// 聪明钱列表标签定义
export const getTraderTagDefinitionsGql = gql`
  query GetTraderTagDefinitions {
    getTraderTagDefinitions {
      id
      category
      name
      nameCn
      color
      createdAt
    }
  }
`

export type TraderTagDefinition = {
  id: number
  category: string
  name: string
  nameCn?: string | null
  color?: string | null
  createdAt?: string | null
}

export type GetTraderTagDefinitionsResp = {
  getTraderTagDefinitions: TraderTagDefinition[]
}

// 获取当前用户下所有的地址组
export const getListAddressGroups = gql`
  query ListAddressGroups {
    listAddressGroups {
      id
      name
      isDefault
      createdAt
      updatedAt
    }
  }
`

export type AddressGroup = {
  id: string
  name: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type ListAddressGroupsResp = {
  listAddressGroups: AddressGroup[]
}

// 创建地址组
export const createAddressGroupGql = gql`
  mutation CreateAddressGroup($input: CreateAddressGroupRequest!) {
    createAddressGroup(input: $input) {
      id
      name
      userId
      isDefault
      createdAt
      updatedAt
    }
  }
`

export type CreateAddressGroupRequest = {
  name: string
  isDefault?: boolean
}

export type AddressGroupResponse = {
  id: string
  name: string
  userId: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type CreateAddressGroupResp = {
  createAddressGroup: AddressGroupResponse
}

// 按地址更新地址组
export const updateAddressGroupsForAddressGql = gql`
  mutation UpdateAddressGroupsForAddress($input: UpdateAddressGroupsForAddressRequest!) {
    updateAddressGroupsForAddress(input: $input) {
      addressId
      groupIds
      updatedAt
    }
  }
`

export type UpdateAddressGroupsForAddressRequest = {
  addressId: string
  userId: string
  groupIds: string[]
}

export type UpdateAddressGroupsForAddressResp = {
  updateAddressGroupsForAddress: {
    addressId: string
    groupIds: string[]
    updatedAt: string
  }
}

// 修改地址组
export const updateAddressGroupGql = gql`
  mutation UpdateAddressGroup($input: UpdateAddressGroupRequest!) {
    updateAddressGroup(input: $input) {
      id
      name
      isDefault
      updatedAt
    }
  }
`

export type UpdateAddressGroupRequest = {
  id: string
  name?: string
  isDefault?: boolean
}

// 根据地址获取交易者标签
export const getTraderTagsByAddressGql = gql`
  query GetTraderTagsByAddress($userAddress: String!) {
    getTraderTagsByAddress(userAddress: $userAddress) {
      category
      name
      nameCn
      color
      priority
      description
    }
  }
`

export type TraderTag = {
  category: string
  name: string
  nameCn?: string | null
  color?: string | null
  priority?: number | null
  description?: string | null
}

export type GetTraderTagsByAddressResp = {
  getTraderTagsByAddress: TraderTag[]
}

// 根据地址获取AI策略总结
export const analyzeSmartMoneyStrategyGql = gql`
  query AnalyzeSmartMoneyStrategy($userAddress: String!) {
    analyzeSmartMoneyStrategy(userAddress: $userAddress) {
      strategyCn
      strategyEn
      analyzedAt
    }
  }
`

export type SmartMoneyStrategy = {
  strategyCn: string
  strategyEn: string
  analyzedAt: string
}

export type AnalyzeSmartMoneyStrategyResp = {
  analyzeSmartMoneyStrategy: SmartMoneyStrategy
}

// 获取关注人数
export const GET_FOLLOWER_COUNT = gql`
  query GetFollowerCount($userAddress: String!) {
    getFollowerCount(userAddress: $userAddress) {
      userAddress
      count
    }
  }
`

// 更新地址分组批量操作
export const BATCH_UPDATE_ADDRESS_GROUPS = gql`
  mutation BatchUpdateAddressGroups($input: BatchUpdateAddressGroupsRequest!) {
    batchUpdateAddressGroups(input: $input) {
      id
      name
      userId
      isDefault
      createdAt
      updatedAt
    }
  }
`

// 多选地址分组批量操作
export const BATCH_CREATE_ADDRESSES = gql`
  mutation BatchCreateAddresses($input: BatchCreateAddressRequest!) {
    batchCreateAddresses(input: $input) {
      id
      address
      groupIds
      createdAt
      updatedAt
    }
  }
`

// 回填地址分组多选项
export const GET_FLOW_ADDRESS_ON_GROUP = gql`
  query GetFlowAddressOngroup($flowAddress: String!) {
    getFlowAddressOngroup(flowAddress: $flowAddress) {
      id
      name
      userId
      isDefault
      createdAt
      updatedAt
    }
  }
`

// 根据条件获取地址列表
export const LIST_ADDRESSES_GQL = gql`
  query ListAddresses($groupId: String) {
    listAddresses(groupId: $groupId) {
      id
      address
      remarkName
      groupIds
      ownerUserId
      userAddress
      profit1d
      profit7d
      profit30d
      createdAt
      updatedAt
    }
  }
`
export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($id: String!, $groupId: String!) {
    deleteAddress(id: $id, groupId: $groupId)
  }
`

export const DELETE_ADDRESS_GROUP = gql`
  mutation DeleteAddressGroup($id: String!) {
    deleteAddressGroup(id: $id)
  }
`

export const ADDRESS_FIELDS = gql`
  fragment AddressFields on AddressResponse {
    id
    address
    remarkName
    groupIds
    ownerUserId
    userAddress
    profit1d
    profit7d
    profit30d
    createdAt
    updatedAt
  }
`

export const CREATE_ADDRESS_MUTATION = gql`
  ${ADDRESS_FIELDS}
  mutation CreateAddress($input: CreateAddressRequest!) {
    createAddress(input: $input) {
      ...AddressFields
    }
  }
`

export const IMPORT_ADDRESSES_MUTATION = gql`
  mutation ImportAddresses($input: ImportAddressesRequest!) {
    importAddresses(input: $input) {
      totalCount
      successCount
      failedCount
      errors
      addresses {
        id
        address
        remarkName
        groupIds
        ownerUserId
        userAddress
        profit1d
        profit7d
        profit30d
        createdAt
        updatedAt
      }
    }
  }
`

export const EXPORT_ADDRESSES_MUTATION = gql`
  mutation ExportAddresses($input: ExportAddressesRequest!) {
    exportAddresses(input: $input) {
      format
      content
      count
    }
  }
`

export const UPDATE_FLOW_GROUP_ORDER_MUTATION = gql`
  mutation UpdateFlowGroupOrder($input: UpdateFlowGroupOrderRequest!) {
    updateFlowGroupOrder(input: $input) {
      id
      name
      userId
      isDefault
      order
      createdAt
      updatedAt
    }
  }
`

export const GET_FOLLOWED_ADDRESSES_POSITIONS_QUERY = gql`
  query GetFollowedAddressesPositions($groupId: String!) {
    getFollowedAddressesPositions(groupId: $groupId) {
      totalAddresses
      totalPositions
      lastUpdated
      positionGroups {
        coin
        addressCount
        positionCount
        totalSzi
        totalPositionValue
        totalUnrealizedPnl
        totalMarginUsed
        avgLeverage
        longPositionValue
        shortPositionValue
        longAvgLeverage
        shortAvgLeverage
        totalDiffPositionValue
        positions {
          address
          coin
          createdAt
          updatedAt
          positionType
          szi
          leverageType
          leverageValue
          entryPx
          positionValue
          unrealizedPnl
          returnOnEquity
          liquidationPx
          marginUsed
          maxLeverage
          openTime
          cumFundingAllTime
          cumFundingSinceOpen
          cumFundingSinceChange
          accountValue
          crossMaintenanceMarginUsed
          crossMarginRatio
        }
      }
    }
  }
`

export const GET_ADDRESS_QUERY = gql`
  query GetAddress($address: String!) {
    getAddress(address: $address) {
      id
      address
      remarkName
      groupIds
      ownerUserId
      userAddress
      profit1d
      profit7d
      profit30d
      createdAt
      updatedAt
    }
  }
`

export const ADDRESS_UPDATE_FIELDS = gql`
  fragment AddressFields on AddressResponse {
    id
    address
    remarkName
    groupIds
    ownerUserId
    userAddress
    profit1d
    profit7d
    profit30d
    createdAt
    updatedAt
  }
`

export const UPDATE_ADDRESS_MUTATION = gql`
  ${ADDRESS_UPDATE_FIELDS}

  mutation UpdateAddress($input: UpdateAddressRequest!) {
    updateAddress(input: $input) {
      ...AddressFields
    }
  }
`

export const GET_FOLLOWED_ADDRESSES_LATEST_POSITIONS = gql`
  query GetFollowedAddressesLatestPositions($groupId: String!) {
    getFollowedAddressesLatestPositions(groupId: $groupId) {
      totalCount
      positions {
        address
        coin
        createdAt
        updatedAt

        positionType
        szi
        leverageType
        leverageValue
        entryPx
        positionValue
        unrealizedPnl
        returnOnEquity
        liquidationPx
        marginUsed
        maxLeverage
        openTime
        cumFundingAllTime
        cumFundingSinceOpen
        cumFundingSinceChange
        accountValue
        crossMaintenanceMarginUsed
        crossMarginRatio

        px
        side
        time
        startPosition
        dir
        closedPnl

        hash
        oid
        tid
        crossed
        fee
        twapId
      }
    }
  }
`

export const getSmartMoneyRoiGql = gql`
  query GetSmartMoneyRoi($userAddress: String!) {
    getSmartMoneyRoi(userAddress: $userAddress) {
      success
      message
      data {
        userAddress
        roi
        periodDays
      }
    }
  }
`

export const getRecentActiveSmartMoneyGql = gql`
  query GetRecentActiveSmartMoney {
    getRecentActiveSmartMoney {
      success
      message
      data {
        userAddress
        roi
        netPnl
        avgWinRate
        maxDrawdown
        periodDays
        sharpeRatio
        profitLossRatio
        profitFactor
        totalVolume
        avgDailyVolume
        tradingDays
        totalTrades
        uniqueCoinsCount
        avgTradesPerDay
        totalLongPnl
        totalShortPnl
        winningPnlTotal
        losingPnlTotal
        kolLabels
        kolLabelsDescription
        followerCount
        remarkName
        groupIds
        lastOperation {
          time
          coin
          side
          direction
          size
          price
          pnl
          fee
          tradeType
        }
        tags {
          category
          name
          nameCn
          color
          priority
          description
        }
      }
      pagination {
        page
        pageSize
        total
        totalPages
      }
    }
  }
`

export const getSmartMoneyMetrics30dGql = gql`
  query GetSmartMoneyMetrics30d($userAddress: String!) {
    getSmartMoneyMetrics30d(userAddress: $userAddress) {
      success
      message
      data {
        userAddress
        roe30d
        winRate30d
        sharpeRatio30d
        maxDrawdown30d
        totalPnl30d
        profitFactor
        periodDays
      }
    }
  }
`

export const getMyFollowedSmartMoneyGql = gql`
  query GetMyFollowedSmartMoney(
    $periodDays: Int
    $recentDays: Int
    $page: Int
    $pageSize: Int
    $userAddress: String
    $tagIds: [Int!]
    $sortBy: SmartMoneySortField
  ) {
    getMyFollowedSmartMoney(
      periodDays: $periodDays
      recentDays: $recentDays
      page: $page
      pageSize: $pageSize
      tagIds: $tagIds
      sortBy: $sortBy
      userAddress: $userAddress
    ) {
      success
      message
      data {
        userAddress
        roi
        netPnl
        avgWinRate
        maxDrawdown
        periodDays
        sharpeRatio
        profitLossRatio
        profitFactor
        totalVolume
        avgDailyVolume
        tradingDays
        totalTrades
        uniqueCoinsCount
        avgTradesPerDay
        totalLongPnl
        totalShortPnl
        winningPnlTotal
        losingPnlTotal
        kolLabels
        kolLabelsDescription
        followerCount
        remarkName
        groupIds
        portfolioData
        lastOperation {
          time
          coin
          side
          direction
          size
          price
          pnl
          fee
          tradeType
        }
        tags {
          category
          name
          nameCn
          color
          priority
          description
        }
      }
      pagination {
        page
        pageSize
        total
        totalPages
      }
    }
  }
`
