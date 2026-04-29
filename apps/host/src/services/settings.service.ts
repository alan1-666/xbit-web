import { gql, TypedDocumentNode } from '@apollo/client'
import { GeneralResponse } from '@/types/responses.ts'
import { QueryGetBrowserHistoryArgs, TokenBrowserHistoryDto } from '@/@generated/gql/graphql-meme2.ts'

export const getBrowsingHistory: TypedDocumentNode<
  GeneralResponse<'getBrowserHistory', TokenBrowserHistoryDto[]>,
  QueryGetBrowserHistoryArgs
> = gql`
  query GetBrowserHistory($input: TokenBrowserHistoryInput!) {
    getBrowserHistory(input: $input) {
      chainId
      symbol
      token
      createdTime
      image
      marketCap
      price24hChange
      dexes
      volume24h
      isFavorite
      categoryIds
    }
  }
`

export const userSettings = gql`
  query userSettings {
    userSettings {
      notificationPreferences {
        notificationTypeCode
        channel
        isEnabled
      }
      googleAuthenticator {
        isEnabled
      }
    }
  }
`

export const getClientLocation = gql`
  query GetClientLocation {
    getClientLocation {
      ip
      countryCode
    }
  }
`
