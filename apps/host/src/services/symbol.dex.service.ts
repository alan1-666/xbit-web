import { gql } from '@apollo/client'

export const GET_FAVORITE_SYMBOLS = gql`
  query GetFavoriteSymbols {
    getFavoriteSymbols {
      list {
        symbol
        maxLeverage
        marketCap
        volume
        changPxPercent
        currentPrice
      }
    }
  }
`

export const GET_SYMBOL_LIST = gql`
  query GetSymbolList($input: SymbolListRequest!) {
    getSymbolList(input: $input) {
      list {
        symbol
        aliasName
        maxLeverage
        marketCap
        volume
        changPxPercent
        openInterest
        currentPrice
        type
        quoteSymbol
      }
    }
  }
`

export const UPSERT_FAVORITE_SYMBOL = gql`
  mutation UpsertFavoriteSymbol($input: UpsertFavoriteSymbolRequest!) {
    upsertFavoriteSymbol(input: $input) {
      error
      status
    }
  }
`

export const UPDATE_FAVORITE_SYMBOL_ORDER = gql`
  mutation UpdateFavoriteSymbolOrder($input: UpdateFavoriteSymbolOrderRequest!) {
    updateFavoriteSymbolOrder(input: $input) {
      status
      message
    }
  }
`

export const GET_CATEGORY_LIST = gql`
  query GetCategory {
    getCategory {
      categories
    }
  }
`
export const getUserSymbolPreference = gql`
  query GetUserSymbolPreference($input: UserSymbolPreferenceRequest!) {
    getUserSymbolPreference(input: $input) {
      isFavorite
      leverage
      isCross
    }
  }
`

export const mutationUserSymbolPreference = gql`
  mutation UpdateUserSymbolPreference($input: UpdateUserSymbolPreferenceRequest!) {
    updateUserSymbolPreference(input: $input) {
      isFavorite
      leverage
      isCross
    }
  }
`

export const SEARCH_SYMBOL_ENDPOINT = gql`
  query SearchSymbol($input: SearchSymbolRequest!) {
    searchSymbol(input: $input) {
      list {
        symbol
        maxLeverage
        marketCap
        volume
        changPxPercent
        currentPrice
      }
    }
  }
`

export const GET_POPULAR_SYMBOLS = gql`
  query GetPopularSymbol($input: PopularSymbolRequest!) {
    getPopularSymbol(input: $input) {
      list {
        symbol
        maxLeverage
        marketCap
        volume
        changPxPercent
        openInterest
        currentPrice
      }
    }
  }
`

export const GET_NEW_SYMBOLS = gql`
  query GetNewSymbol {
    getNewSymbol {
      list
    }
  }
`

export const GET_CLOID = gql`
  query GenerateCloid($input: GenerateCloidInput!) {
    generateCloid(input: $input) {
      count
      cloids
    }
  }
`

export const SUMBIT_HYPERLIQUID_ORDER = gql`
  mutation LogTransaction($input: [LogTransactionInput]!) {
    logTransaction(input: $input) {
      status
      error
    }
  }
`

export const GET_BANNERS = gql`
  query GetBanners($input: GetBannerInput!) {
    getBanners(input: $input) {
      data {
        id
        platform
        route
        enImageUrl
        enImage1Url
        zhImageUrl
        zhImage1Url
        category
        isActive
        startAt
        clickCount
        createdAt
        updatedAt
        sortIndex
      }
      message
    }
  }
`

export const ROUTE_BANNER = gql`
  mutation RouteBanner($input: RouteBannerInput!) {
    routeBanner(input: $input) {
      message
    }
  }
`

export const GET_HOT_SEARCHES = gql`
  query GetHotSearchs($input: HotSearchFilter!) {
    getHotSearches(input: $input) {
      message
      data {
        id
        board
        mode
        symbol
        chainId
        tokenContract
        tokenName
        displayText
        showFlame
      }
    }
  }
`
