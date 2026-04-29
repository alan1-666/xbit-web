import { gql, TypedDocumentNode } from '@apollo/client'
import { GeneralResponse } from '@/types/responses.ts'
import {
  ListInfluentialTwitterFollowerResponse,
  OnChainDataAnalyticDto,
  QueryGetOnChainDataAnalyticArgs,
  QueryListInfluentialTwitterFollowersArgs,
} from '@/@generated/gql/graphql-core.ts'

export const getOnChainDataAnalytic: TypedDocumentNode<
  GeneralResponse<'getOnChainDataAnalytic', OnChainDataAnalyticDto>,
  QueryGetOnChainDataAnalyticArgs
> = gql`
  query GetOnChainDataAnalytic($input: OnChainDataAnalyticInput!) {
    getOnChainDataAnalytic(input: $input) {
      chainId
      address
      twitterNameChangeCount
      numberOfRugPullWareHouseAddresses
      numberOfLinkedWallets
      linkedWalletsPercentage
      numberOfDevProjectsLaunched
      twitterAccountCreationDate
      devTokenHoldingPercentage
      insiderPercentage
      numberOfHolder
    }
  }
`

export const getListInfluentialTwitterFollowers: TypedDocumentNode<
  GeneralResponse<'listInfluentialTwitterFollowers', ListInfluentialTwitterFollowerResponse>,
  QueryListInfluentialTwitterFollowersArgs
> = gql`
  query ListInfluentialTwitterFollowers($input: ListInfluentialTwitterFollowersInput!) {
    listInfluentialTwitterFollowers(input: $input) {
      data {
        chainId
        address
        numberOfFollowers
        url
      }
      pagination {
        page
        limit
      }
    }
  }
`
