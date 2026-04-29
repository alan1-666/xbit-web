import { gql, TypedDocumentNode } from '@apollo/client'
import {
  GetAiAnalyzedInfoResponse,
  GetAllCategoriesInput,
  GetCategoryStatisticsResponse,
  GetPortfolioManyWalletResponse,
  GetTokensByCategoryResponse,
  GetTokenSnipersResponse,
} from '@/types/responses.ts'
import { GeneralInput, GetCategoryStatisticsInput, GetTokensByCategoryInput } from '@/types/requests.ts'
import {
  Query,
  QueryGetTokenPoolInfoArgs,
  QueryGetTokenPortraitArgs,
  QueryGetDevHoldArgs,
  // QueryGetTradingTransactionsArgs,
  TokenSniperInput,
  QueryGetPricesArgs,
  QueryGetTokenCreatedByDevArgs,
  QueryGetPortfolioArgs,
  QueryGetPortfolioManyWalletArgs,
  QueryGetWalletInfoArgs,
} from '@/@generated/gql/graphql-core.ts'
import { AiAnalyzedInfoInput } from '@/@generated/gql/graphql-core.ts'
import {
  Query as Meme2Query,
  QueryGetFavoriteTokenArgs,
  QueryGetFollowedTransactionsArgs,
  QueryGetTokenSymbolsArgs,
  QueryGetTokenTrendingArgs,
} from '@/@generated/gql/graphql-meme2.ts'
import {
  Query as FutureQuery,
  QuerySearchSimilarArgs,
  QueryGetDevHoldArgs as FutureQueryGetDevHoldArgs,
  QueryTokensByCategoryArgs,
  QueryGetTradingTransactionsArgs,
} from '@/@generated/gql/graphql-future.ts'

export const getTrendingTokens = gql`
  query GetTokenTrending($input: TokenTrendingInput!) {
    getTokenTrending(input: $input) {
      limit
      page
      data {
        avatarUrl
        chainId
        token
        name
        image
        symbol
        price1mChange
        price5mChange
        price6hChange
        price1hChange
        price24hChange
        txs1h
        txs1m
        txs24h
        txs5m
        txs6h
        volume1m
        volume5m
        volume1h
        volume6h
        volume24h
        marketcap
        liquidity
        numberOfHolder
        dexes
        createdTime
        tweetId
        twitterNameChangeCount
        twitterUrl
        website
        trendingScore1h
        trendingScore1m
        trendingScore24h
        trendingScore5m
        trendingScore6h
        advertisesOnDex
        ohlc {
          ts
          open
          usdVolume
        }
      }
    }
  }
`

export const getTrendingTokensWithDebug = gql`
  query GetTokenTrendingWithDebug($input: TokenTrendingInput!) {
    getTokenTrending(input: $input) {
      limit
      page
      data {
        avatarUrl
        chainId
        token
        name
        image
        symbol
        firstPrice
        price
        price1mAgo
        price5mAgo
        price1hAgo
        price1mChange
        price5mChange
        price6hChange
        price1hChange
        price24hChange
        price24hAgo
        txs1h
        txs1m
        txs24h
        txs5m
        txs6h
        buyTxs1m
        buyTxs5m
        buyTxs1h
        buyTxs6h
        buyTxs24h
        sellTxs1m
        sellTxs5m
        sellTxs1h
        sellTxs6h
        sellTxs24h
        volume1m
        volume5m
        volume1h
        volume6h
        volume24h
        marketcap
        liquidity
        initLiquidity
        internalMarketProgress
        isFavorite
        numberOfHolder
        dexes
        createdTime
        tweetId
        twitterNameChangeCount
        twitterUrl
        website
        trendingScore1h
        trendingScore1m
        trendingScore24h
        trendingScore5m
        trendingScore6h
        bundlerHoldingPercent
        ohlc {
          ts
          token
          open
          usdVolume
        }
        debug {
          calculatedAt
          score
          debugData {
            txCount
            volUsd
            priceChange
            holderGrowthPercentage
            liqMCPercentage
            zTx
            zVol
            zPrice
            zHolder
            zLiq
            cappedZTx
            cappedZVol
            cappedZPrice
            cappedZHolder
            cappedZLiq
            liquidityPenalty
            volumeMultiplier
            transactionMultiplier
            ageBoost
            agePenalty
            securityBoost
            avgTx
            sdTx
            avgVol
            sdVol
            avgPriceChange
            sdPriceChange
            avgHg
            sdHg
            avgLq
            sdLq
            baseScore
            normalizedBase
            finalScore
            tokenAge
            tokenCreatedAt
            timeframeWindow
          }
        }
      }
    }
  }
`

export const getNewTokens = gql`
  query GetNewToken($input: TokenFilterInput!) {
    getNewToken(input: $input) {
      page
      limit
      data {
        chainId
        token
        price
        price1mChange
        price5mChange
        price1hChange
        price6hChange
        price24hChange
        buyTxs1m
        buyTxs5m
        buyTxs1h
        buyTxs6h
        buyTxs24h
        sellTxs1m
        sellTxs5m
        sellTxs1h
        sellTxs6h
        sellTxs24h
        volume1m
        volume5m
        volume1h
        volume6h
        volume24h
        marketcap
        liquidity
        internalMarketProgress
        isFavorite
        numberOfHolder
        dexes
        createdTime
        name
        image
        symbol
        ohlc {
          ts
          open
          usdVolume
        }
      }
    }
  }
`

export const getTokens = gql`
  query Tokens($input: TokenInput!) {
    tokens(token: $input) {
      data {
        address
        chainId
        symbol
        name
        decimals
        logo
        totalSupply
        tags
        mintDisable
        isBlacklisted
        isHoneypot
        burnRatio
        burnStatus
        top10HolderRate
        ratTraderAmountRate
      }
      page
      limit
    }
  }
`

export const getTokenPriceOHLC = gql`
  query GetOHLC($input: OHLCInput!) {
    getOHLC(input: $input) {
      close
    }
  }
`

export const getTokenData = gql`
  query GetTokenDetail($input: TokenDetailInput!) {
    getTokenDetail(token: $input) {
      address
      chainId
      name
      symbol
      isBlacklisted
      totalSupply
      info {
        logoUrl
      }
    }
  }
`

export const getTokenPrice = gql`
  query GetTokenDetail($input: TokenDetailInput!) {
    getTokenDetail(token: $input) {
      price
    }
  }
`

export const getTokensPrices = gql`
  query getTokensPrices($tokens: [String!]!, $chainId: Int!) {
    getPrices(tokens: $tokens, chainId: $chainId) {
      price
      token
    }
  }
`

export const getTokenMetadata = gql`
  query getTokenMetadata($input: String!, $chainId: Int!) {
    getTokenMetadata(address: $input, chainId: $chainId) {
      symbol
      chainId
      totalSupply
    }
  }
`

export const getTokenDetail = gql`
  query GetTokenDetail($input: TokenDetailInput!) {
    getTokenDetail(token: $input) {
      address
      chainId
      symbol
      name
      decimals
      totalSupply
      tags
      mintDisable
      isBlacklisted
      isHoneypot
      isFavorite
      ownershipRenounced
      isHotToken
      isOG
      isExclusive
      burnRatio
      burnStatus
      top10HolderRate
      ratTraderAmountRate
      volume24h
      marketCap
      buyTxs
      sellTxs
      price
      price1hChange
      price5mChange
      price6hChange
      price24hChange
      createdTime
      dexes
      internalMarketProgress
      liquidity
      turnoverRate24h
      circulatingSupply
      openPrice
      athPrice
      atlPrice
      marketCap
      holders
      devHold
      topTrending
      numberProTrader
      turnoverRate24h
      circulatingSupply
      openPrice
      athPrice
      atlPrice
      marketCap
      holders
      topTrending
      openPrice24h
      openTime24h
      creator
      contractCreator
      contractOwner
      metadataCustom
      isMigrated
      totalFee
      numberMigratedTokenByDev
      info {
        avatarUrl
        logoUrl
        bannerUrl
        dexScreenerBoosts
        socials {
          url
          type
        }
        websites {
          url
          label
        }
        avatarUrl
      }
      health {
        noBlackListWhiteListFunction
        notMint
        burnt
        top10
      }
      totalTransactions {
        numberOfPurchases5m
        numberOfPurchases1h
        numberOfPurchases6h
        numberOfPurchases24h
        numberOfSales5m
        numberOfSales1h
        numberOfSales6h
        numberOfSales24h
      }
      totalAmount {
        totalBuyAmount5m
        totalBuyAmount1h
        totalBuyAmount6h
        totalBuyAmount24h
        totalSellAmount5m
        totalSellAmount1h
        totalSellAmount6h
        totalSellAmount24h
      }
      numberUniqueAddresses {
        numberOfBuyAddress5m
        numberOfBuyAddress1h
        numberOfBuyAddress6h
        numberOfBuyAddress24h
        numberOfSellAddress5m
        numberOfSellAddress1h
        numberOfSellAddress6h
        numberOfSellAddress24h
      }
      security {
        buyTax
        sellTax
      }
    }
  }
`

export const getTokenDetailMCAndPrice: TypedDocumentNode<Pick<Query, 'getTokenDetail'>> = gql`
  query GetTokenDetailMCAndPrice($input: TokenDetailInput!) {
    getTokenDetail(token: $input) {
      price
      totalSupply
      circulatingSupply
      symbol
      chainId
      info {
        logoUrl
      }
    }
  }
`

export const getTokenInsight = gql`
  query GetTokenInsight($input: TokenDetailInput!) {
    getTokenInsight(token: $input) {
      top10Holder
      DevHold
      Holders
      Sniper
      Insider
      Bundler
      LPBurned
      LPMint
      DexPaid
    }
  }
`

export const getMemeTokens = gql`
  query GetMemeToken($input: MemeInput!) {
    getMemeToken(input: $input) {
      page
      limit
      data {
        chainId
        token
        buyTxs1m
        buyTxs5m
        buyTxs1h
        buyTxs6h
        buyTxs24h
        sellTxs1m
        sellTxs5m
        sellTxs1h
        sellTxs6h
        sellTxs24h
        volume1m
        volume5m
        volume1h
        volume6h
        volume24h
        marketcap
        liquidity
        internalMarketProgress
        isFavorite
        numberOfHolder
        dexes
        createdTime
        name
        image
        avatarUrl
        thumbnailUrl
        symbol
        marketCap5mChangeUsd
        txBySniperPct
        devHold
        tweetId
        twitterNameChangeCount
        twitterUrl
        website
        sameSourceWallet
        smartMoneyPct
        smartMoneyHolder
        devLaunched
        devMigrated
        insider
        top10Holder
        decimals
        totalSupply
        sniperHoldPct
        sniperHoldAmount
        sniperCount
        advertisesOnDex
        migratedAt
        creator
        bundlerHoldingPercent
        botHolder
        memeTooltip {
          bundlerCount
          bundlerHoldAmount
          devHoldAmount
          insiderCount
          insiderHoldAmount
          top10HolderAmount
        }
      }
    }
  }
`

export const getFavoriteTokens: TypedDocumentNode<Pick<Query, 'getFavoriteToken'>, QueryGetFavoriteTokenArgs> = gql`
  query GetFavoriteToken($input: TokenFilterInput!) {
    getFavoriteToken(input: $input) {
      page
      limit
      data {
        chainId
        creator
        token
        price
        price1mChange
        price5mChange
        price1hChange
        price6hChange
        price24hChange
        txs1m
        txs5m
        txs1h
        txs6h
        txs24h
        volume1m
        volume5m
        volume1h
        volume6h
        volume24h
        marketcap
        liquidity
        isFavorite
        numberOfHolder
        dexes
        createdTime
        name
        image
        symbol
        isFavorite
        tweetId
        twitterNameChangeCount
        twitterUrl
        website
        advertisesOnDex
        ohlc {
          ts
          open
          usdVolume
        }
        metadataCustom
        advertisesOnDex
      }
    }
  }
`

export const getSimpleFavoriteTokens: TypedDocumentNode<
  Pick<Meme2Query, 'getFavoriteToken'>,
  QueryGetFavoriteTokenArgs
> = gql`
  query GetFavoriteToken($input: TokenFilterInput!) {
    getFavoriteToken(input: $input) {
      data {
        chainId
        token
        name
        symbol
        image
        isFavorite
        marketcap
        price24hChange
      }
    }
  }
`

export const addTokenToFavorite = gql`
  mutation AddToFavorite($token: String!, $chain: ChainType) {
    addToFavorite(tokens: $token, chain: $chain)
  }
`

export const removeTokenFromFavorite = gql`
  mutation RemoveTokenFavorite($token: String!, $chain: ChainType) {
    removeTokenFavorite(tokens: $token, chain: $chain)
  }
`

export const updateFavoriteTokenOrder = gql`
  mutation UpdateFavoriteTokenOrder($input: UpdateFavoriteTokenOrderInput!) {
    updateFavoriteTokenOrder(input: $input)
  }
`

export const searchTokens = gql`
  query SearchToken($input: String!) {
    searchToken(input: $input) {
      chainId
      token
      price
      price24hChange
      txs24h
      volume24h
      marketcap
      liquidity
      numberOfHolder
      isFavorite
      dexes
      createdTime
      name
      image
      symbol
    }
  }
`

export const searchTokensV2 = gql`
  query SearchTokenLite($input: String!) {
    searchTokenLite(input: $input) {
      chainId
      token
      name
      symbol
      image
      price
      price24hChange
      marketcap
      volume24h
      isFavorite
      dexes
      openPrice24h
      metadataCustom
    }
  }
`
export const searchTokensV3 = gql`
  query SearchUniversal($input: SearchInput!) {
    searchUniversal(input: $input) {
      data {
        ... on SearchData {
          chainId
          token
          name
          symbol
          image
          price
          price24hChange
          openPrice24h
          marketcap
          volume24h
          createdTime
          dexes
          metadataCustom
          isXStock
          isFavorite
        }
        ... on SearchWalletData {
          address
          balance
          numTracked
          numAlias
          alias
        }
      }
    }
  }
`

export const searchTokensPc = gql`
  query SearchUniversal($input: SearchInput!) {
    searchUniversal(input: $input) {
      data {
        ... on SearchData {
          chainId
          token
          name
          symbol
          image
          thumbnailUrl
          avatarUrl
          price
          price24hChange
          openPrice24h
          marketcap
          volume24h
          isHotToken
          createdTime
          dexes
          metadataCustom
          twitterUrl
          twitterId
          telegramUrl
          liquidity
          isXStock
          isFavorite
        }
        ... on SearchWalletData {
          chainId
          address
          balance
          numTracked
          numAlias
          alias
        }
      }
    }
  }
`
export const getPortfolioOverview = gql`
  query getPortfolioOverview($input: SearchPortfolioOverviewInput!) {
    getPortfolioOverview(input: $input) {
      page
      limit
      data {
        token
        symbol
        price
        decimals
        totalBaseAmount
        totalUsdValue
        logoUrl
        chainId
        isXStock
        holdingRatio
        price24hChange
        liquidity
        lowLiquidity
        isQuoteToken
      }
      totalHoldingTokens
    }
  }
`

export const getPortfolio: TypedDocumentNode<Pick<Query, 'getPortfolio'>, QueryGetPortfolioArgs> = gql`
  query getPortfolio($input: SearchPortfolioInput!) {
    getPortfolio(input: $input) {
      page
      limit
      data {
        userAddress
        token
        symbol
        decimals
        totalBaseAmount
        avgPriceUsd
        totalBuyBaseAmount
        totalSellBaseAmount
        avgMarketCap
        totalUsdValue
        totalBuyQty
        totalBuyUsd
        totalSellQty
        totalSellUsd
        totalTradedQty
        chainId
        updatedAt
        realizedPnL
        logoUrl
        maxHoldingQty
        price
        price24hChange
        isXStock
        lastTxTime
        totalFee
        totalFeeUsd
        lowLiquidity
        holdingTime
        balanceUpdatedTime
        avatarUrl
        isQuoteToken
      }
      addressMetadata {
        chainId
        completedTxs
        userAddress
      }
      totalHoldingTokens
    }
  }
`

export const getListPortfoliosByTokens: TypedDocumentNode<
  GetPortfolioManyWalletResponse,
  QueryGetPortfolioManyWalletArgs
> = gql`
  query getPortfolioManyWallet($input: PortfolioManyWalletInput!) {
    getPortfolioManyWallet(input: $input) {
      data {
        totalHoldingTokens
        data {
          userAddress
          token
          symbol
          decimals
          totalBaseAmount
          avgPriceUsd
          totalBuyBaseAmount
          totalSellBaseAmount
          avgMarketCap
          totalUsdValue
          totalBuyQty
          totalBuyUsd
          totalSellQty
          totalSellUsd
          totalTradedQty
          chainId
          updatedAt
          realizedPnL
          logoUrl
          maxHoldingQty
          price
          price24hChange
        }
      }
    }
  }
`

export const getOHLC = gql`
  query GetOHLC($input: OHLCInput!) {
    getOHLC(input: $input) {
      open
      close
      ts
      usdVolume
    }
  }
`

export const getPopularTokens = gql`
  query GetPopularTokens {
    getPopularTokens {
      token
      chainId
      symbol
      name
      logoUrl
      hot
    }
  }
`

export const getCategories: TypedDocumentNode<Pick<Meme2Query, 'getAllCategories'>, GetAllCategoriesInput> = gql`
  query GetAllCategories($input: AllCategoriesInput!) {
    getAllCategories(input: $input) {
      data {
        categoryId
        marketCap
        volume24h
        price24hChange
        priceUpCount
        priceDownCount
        name
        topGainers {
          logoUrl
          name
          symbol
          price24hChange
          address
        }
        top1TokenSymbol
        top1TokenAddress
        top1TokenName
        top1TokenLogo
        top1TokenP24hChange
        volume1hHistory
        price1hChangeHistory
        tokensCount
      }
      limit
      page
    }
  }
`

export const getCategoryStatistics: TypedDocumentNode<GetCategoryStatisticsResponse, GetCategoryStatisticsInput> = gql`
  query GetCategoryStatistic($input: CategoryStatisticInput!) {
    getCategoryStatistic(input: $input) {
      marketCap
      volume24h
      price24hChange
      priceUpCount
      priceDownCount
      tokensCount
    }
  }
`

export const getTokensByCategory: TypedDocumentNode<GetTokensByCategoryResponse, GetTokensByCategoryInput> = gql`
  query TokensByCategory($input: TokensByCategoryInput!) {
    tokensByCategory(input: $input) {
      page
      limit
      data {
        address
        marketCap
        volume24h
        price24hChange
        chainId
        name
        logoUrl
        price
        symbol
      }
    }
  }
`

export const getFullyTokensByCategory = gql`
  query TokensByCategory($input: TokensByCategoryInput!) {
    tokensByCategory(input: $input) {
      page
      limit
      data {
        marketCap
        volume1m
        volume5m
        volume1h
        volume6h
        volume24h
        price1mChange
        price5mChange
        price1hChange
        price6hChange
        price24hChange
        buyTxs1m
        buyTxs5m
        buyTxs1h
        buyTxs6h
        buyTxs24h
        sellTxs1m
        sellTxs5m
        sellTxs1h
        sellTxs6h
        sellTxs24h
        trendingScore1m
        trendingScore5m
        trendingScore1h
        trendingScore6h
        trendingScore24h
        chainId
        name
        symbol
        address
        logoUrl
        price
        liquidity
        numberOfHolder
        createdTime
        createdTimeRaw
        tweetId
        twitterUrl
        twitterNameChangeCount
        website
        advertisesOnDex
        mint
        burnt
        blacklist
        bundlerHoldingPercent
        top10Holder
        devHold
        sameSourceWallet
        insider
        devLaunched
        sniperHoldPct
        dexes
        isFavorite
        creator
        devMigrated
        smartMoneyHolder
        telegram
        favoriteAt
      }
    }
  }
`

export const getXStocksTokens: TypedDocumentNode<
  Pick<FutureQuery, 'tokensByCategory'>,
  QueryTokensByCategoryArgs
> = gql`
  query XStocksTokens($input: TokensByCategoryInput!) {
    tokensByCategory(input: $input) {
      page
      limit
      data {
        address
        marketCap
        volume24h
        price24hChange
        chainId
        name
        logoUrl
        price
        symbol
        liquidity
        isFavorite
        favoriteAt
      }
    }
  }
`

export const getTradeHistory = gql`
  query GetTradeHistory($input: TokenTradeHistoryInput!) {
    getTradeHistory(input: $input) {
      page
      limit
      data {
        timestamp
        type
        tradeValue
        price
        quantity
        wallet
        maxHoldingQty
        balance
        marketCap
      }
    }
  }
`

export const getSmartMoneys = gql`
  query GetSmartMoneyActions($filter: SmartMoneyActionFilterInput!) {
    getSmartMoneyActions(filter: $filter) {
      actions {
        timestamp
        address
        baseAmount
        token {
          address
          name
          totalSupply
          info {
            logoUrl
          }
        }
        txType
        usdAmount
      }
    }
  }
`

export const getSmartMoneyTradeHistories = gql`
  query getSmartMoneyTradeHistories($req: SmartMoneyTradeHistoryReq!) {
    getSmartMoneyTradeHistories(req: $req) {
      address
      timestamp
      type
      amount
      usdAmount
      usdPrice
      token {
        logo
        address
        totalSupply
      }
    }
  }
`

export const getAIAnalyzedInfo = gql`
  query GetAiAnalyzedInfo($input: AiAnalyzedInfoInput!) {
    getAiAnalyzedInfo(input: $input) {
      chainId
      address
      themeNarrativeAnalytic
      socialWebsiteAnalytic
      avatarAnalytic
    }
  }
`

export const getTokenOfficialInformation = gql`
  query GetTokenOfficialInformation($address: String!, $chainId: Int!) {
    getTokenOfficialInformation(address: $address, chainId: $chainId) {
      openingDate
      contractAddress
      poolAddress
      addPoolTime
      projectPartyDevAddress
      balanceProjectPartyDev
      devEntrepreneurshipHistory
      projectPartyDevHistory
      socials {
        url
        type
        registrationDate
        numberFollowers
        numberPosts
        averageViewPerPost
        averageCommentsPerPost
        averageLikesPerPost
        averageForwardingPerPost
        nameChanges
      }
    }
  }
`

export const getTokenSnipers: TypedDocumentNode<GetTokenSnipersResponse, GeneralInput<TokenSniperInput>> = gql`
  query GetTokenSniper($input: TokenSniperInput!) {
    getTokenSniper(input: $input) {
      totalBought
      currentTotalHolding
      top10Holders
      top100Holders
      traders {
        address
        status
        isSniper
      }
    }
  }
`

export const getTransactions = gql`
  query GetTransactions($input: TransactionInput!) {
    getTransactions(input: $input) {
      fromTimestamp
      data {
        timestamp
        chainId
        txHash
        logIndex
        baseToken
        quoteToken
        pair
        type
        maker
        baseAmount
        quoteAmount
        price
        usdAmount
        usdPrice
        liquidity
        holderPct
        isInsider
        isNativeWallet
      }
    }
  }
`

export const getTrending24hTokens = gql`
  query GetTokenTrending($input: TokenTrendingInput!) {
    getTokenTrending(input: $input) {
      data {
        image
        symbol
        createdTime
        token
        marketcap
        price
        price24hChange
        isFavorite
        chainId
      }
    }
  }
`

export const GetTokenTrendingSearchBar = gql`
  query GetTokenTrendingSearchBar($input: TokenTrendingInput!) {
    getTokenTrendingSearchBar(input: $input) {
      data {
        image
        symbol
        createdTime
        token
        marketcap
        price
        price24hChange
        isFavorite
        chainId
        openPrice24h
        dexes
        volume24h
        metadataCustom
        name
      }
    }
  }
`

export const GetTokenTrendingSearchBarPC = gql`
  query GetTokenTrendingSearchBar($input: TokenTrendingInput!) {
    getTokenTrendingSearchBar(input: $input) {
      data {
        image
        symbol
        createdTime
        token
        marketcap
        price
        price24hChange
        isFavorite
        chainId
        openPrice24h
        dexes
        volume24h
        metadataCustom
        twitterUrl
        twitterId
        telegramUrl
        isHot
        liquidity
        name
        isXStock
      }
    }
  }
`

export const getAiAnalyzedInfo: TypedDocumentNode<GetAiAnalyzedInfoResponse, GeneralInput<AiAnalyzedInfoInput>> = gql`
  query GetAiAnalyzedInfo($input: AiAnalyzedInfoInput!) {
    getAiAnalyzedInfo(input: $input) {
      address
      avatarAnalytic
      chainId
      socialWebsiteAnalytic
      themeNarrativeAnalytic
    }
  }
`

export const getFollowedHolder = gql`
  query GetFollowedHolder($input: HolderInput!) {
    getFollowedHolder(input: $input) {
      page
      limit
      data {
        address
        token
        tokenAccount
        balance
        buys
        sells
        rawBalance
        createdAt
        updatedAt
        chainId
        avgPriceUsd
        avgMarketCap
        symbol
        totalUsdValue
        totalBuyQty
        totalBuyUsd
        totalSellQty
        totalSellUsd
        totalTradedQty
        maxHoldingQty
        realizedPnL
        nativeBalance
        realizedProfit
        unrealizedProfit
        totalProfit
        numberTransaction
        sourceOfFunding
        totalSupply
        decimal
        statistic {
          totalBuyTxs24h
          totalSellTxs24h
          totalBuyTxs
          totalSellTxs
          startTimeHolding
        }
      }
    }
  }
`

export const getHolder = gql`
  query GetHolder($input: HolderInput!) {
    getHolder(input: $input) {
      page
      limit
      data {
        address
        token
        tokenAccount
        balance
        buys
        sells
        rawBalance
        createdAt
        updatedAt
        chainId
        avgPriceUsd
        avgMarketCap
        symbol
        totalUsdValue
        totalBuyQty
        totalBuyUsd
        totalSellQty
        totalSellUsd
        totalTradedQty
        maxHoldingQty
        realizedPnL
        nativeBalance
        realizedProfit
        unrealizedProfit
        totalProfit
        numberTransaction
        sourceOfFunding
        sourceOfFundingTxTime
        sourceOfFundingTxHash
        totalSupply
        decimal
        label
        labels
        solCreatedAt
        nativeCreatedAt
        tokenSource
        tokenSourceTime
        tokenSourceTxHash
        netInflow
        holdingDuration
        statistic {
          totalBuyTxs24h
          totalSellTxs24h
          totalBuyTxs
          totalSellTxs
          startTimeHolding
        }
      }
    }
  }
`

export const getFollowedTransactions: TypedDocumentNode<
  Pick<Meme2Query, 'getFollowedTransactions'>,
  QueryGetFollowedTransactionsArgs
> = gql`
  query GetFollowedTransactions($input: TransactionInput!) {
    getFollowedTransactions(input: $input) {
      fromTimestamp
      data {
        timestamp
        chainId
        txHash
        logIndex
        baseToken
        quoteToken
        pair
        type
        maker
        baseAmount
        quoteAmount
        price
        usdAmount
        usdPrice
        liquidity
        isPoolContract
        holdingProgress
        tx24h
        decimals
        totalSupply
        holderPct
        isTopTrader
        isSmartMoney
        isKOL
        isNewActivity
        isNativeWallet
        isInsider
        isFreshWallet
        isDev
        isWhale
        isHugeValue
        dex
        nativePrice
        nativeAmount
      }
    }
  }
`

export const getTradingTransactions: TypedDocumentNode<
  Pick<FutureQuery, 'getTradingTransactions'>,
  QueryGetTradingTransactionsArgs
> = gql`
  query GetTradingTransactions($input: TradingTransactionInput!) {
    getTradingTransactions(input: $input) {
      cursor
      data {
        timestamp
        chainId
        txHash
        logIndex
        eventIndex
        baseToken
        quoteToken
        pair
        type
        maker
        baseAmount
        quoteAmount
        price
        usdAmount
        usdPrice
        liquidity
        isHugeValue
        isWhale
        isDev
        isFreshWallet
        isInsider
        isNativeWallet
        isNewActivity
        holderPct
        isPoolContract
        isKOL
        isSmartMoney
        isTopTrader
        isSniper
        isBundler
        isPoolContract
        holderPct
        totalSupply
        decimals
        tx24h
        holdingProgress
        nativeAmount
        nativePrice
        isSingleSideTransaction
        dex
        MakerAlias
        totalFee
        totalFeeUSD
        isKlineTx
        reasonFiltering
      }
    }
  }
`

export const getTokenSymbols: TypedDocumentNode<Pick<Meme2Query, 'getTokenSymbols'>, QueryGetTokenSymbolsArgs> = gql`
  query GetTokenSymbols($tokens: [String!]!, $chainId: Int!) {
    getTokenSymbols(tokens: $tokens, chainId: $chainId) {
      token
      symbol
      chainId
    }
  }
`

export const getPoolTransactions: TypedDocumentNode<Pick<Meme2Query, 'getPoolTransactions'>> = gql`
  query GetPoolTransactions($input: PoolTransactionInput!) {
    getPoolTransactions(input: $input) {
      data {
        timestamp
        chainId
        txHash
        logIndex
        baseToken
        quoteToken
        pair
        type
        maker
        baseAmount
        quoteAmount
        price
        usdAmount
        usdPrice
        isSingleSideTransaction
        dex
        MakerAlias
        totalAddBaseLiq
        totalAddQuoteLiq
      }
      numberOfPools
      fromTimestamp
      liquidity
    }
  }
`

export const getPollTxInfo: TypedDocumentNode<Pick<Query, 'getPoolTransactions'>> = gql`
  query GetPoolTransactions($input: PoolTransactionInput!) {
    getPoolTransactions(input: $input) {
      numberOfPools
      fromTimestamp
      liquidity
    }
  }
`

export const getWalletStatistics = gql`
  query GetWalletStatistic($input: WalletStatisticInput!) {
    getWalletStatistic(input: $input) {
      totalBuyTxs
      totalSellTxs
      pnl
      totalUsdBuyAmount
      totalUsdSellAmount
      maxHolding
      currentHolding
      avgBuyMarketCap
      avgSellMarketCap
      holdingDuration
      label
      labels
      walletAddress
    }
  }
`

export const getWalletTokenStatistic = gql`
  query GetWalletTokenStatistic($token: String!, $chainId: Int!, $address: String!) {
    getWalletTokenStatistic(token: $token, chainId: $chainId, address: $address) {
      totalProfit
      balance
      holdingDuration
      buys
      totalUsdBuyAmount
      totalBuyAmount
      sells
      totalUsdSellAmount
      totalSellAmount
      maxHoldingQty
    }
  }
`

export const getHolderCharts = gql`
  query GetHolderChart($input: HolderChartInput!) {
    getHolderChart(input: $input) {
      numberOfHolderHistory
      top10HolderHistory
      averageHoldingPerWalletHistory
      insiderHoldingHistory
      phishingWalletHistory
      bundleHistory
      botHistory
      newWalletHistory
      inactiveWalletHistory
      steps
    }
  }
`

export const getTokenPools: TypedDocumentNode<Pick<Query, 'getTokenPoolInfo'>, QueryGetTokenPoolInfoArgs> = gql`
  query GetTokenPoolInfo($input: TokenDetailInput!) {
    getTokenPoolInfo(input: $input) {
      address
      chainId
      baseToken
      createdAt
      quoteToken
      quoteTokenPrice
      quoteSymbol
      baseSymbol
      baseTokenLiquidity
      quoteLiquidity
      usdLiquidity
      dex
    }
  }
`

export const getTokenPortrait: TypedDocumentNode<Pick<Query, 'getTokenPortrait'>, QueryGetTokenPortraitArgs> = gql`
  query GetTokenPortrait($input: GetTokenPortraitInput!) {
    getTokenPortrait(input: $input) {
      walletActive1h
      launchedOnPump
      lowLiquidity
      devAddLiquidity
      devStatus
      devAction
      abandoned
      ageSinceCreation
      advertisesOnDex
      updatedSocialOnDex
      officialTwitter
      officialTelegram
      officialWebsite
      explorer
      tweetId
      bannerUrl
      twitterNameChangeCount
    }
  }
`

export const getListTokenStatistics: TypedDocumentNode<Pick<Query, 'getDevHold'>, QueryGetDevHoldArgs> = gql`
  query GetListTokenStatistic($input: DevHoldInput!) {
    getDevHold(input: $input) {
      token
      devHold
    }
  }
`

export const getPrices = gql`
  query getPrices($tokens: [String!]!, $chainId: Int!) {
    getPrices(tokens: $tokens, chainId: $chainId) {
      token
      chainId
      price
    }
  }
`
export const getManyToken = gql`
  query getManyToken($input: GetManyTokenInput!) {
    getManyToken(input: $input) {
      address
      chainId
      name
      symbol
      logo
      isBlacklisted
      decimals
      totalSupply
      tags
    }
  }
`

export const getTokenPrices: TypedDocumentNode<Pick<Query, 'getPrices'>, QueryGetPricesArgs> = gql`
  query GetPrices($tokens: [String!]!, $chainId: Int!) {
    getPrices(tokens: $tokens, chainId: $chainId) {
      token
      chainId
      price
      price24hAgo
    }
  }
`

export const getManyTokenSimple = gql`
  query GetManyToken($input: GetManyTokenInput!) {
    getManyToken(input: $input) {
      symbol
      address
      info {
        logoUrl
      }
    }
  }
`

export const getTokenCreatedByDev: TypedDocumentNode<
  Pick<Query, 'getTokenCreatedByDev'>,
  QueryGetTokenCreatedByDevArgs
> = gql`
  query GetTokenCreatedByDev($input: TokenCreatedByDevInput!) {
    getTokenCreatedByDev(input: $input) {
      address
      symbol
      createdAt
      marketCap
      rug
      rugTime
      rugReason
      total
      totalRug
      totalActive
    }
  }
`

export const getListDex = gql`
  query GetListDex($token: String!, $chainId: Int!) {
    getListDex(token: $token, chainId: $chainId) {
      dex
      factory
      pair
    }
  }
`

export const getLiquidityChart = gql`
  query GetLiquidityChart($input: GetLiquidityChartInput!) {
    getLiquidityChart(input: $input) {
      token
      liquiditySum1h
      liquidity1hAt
    }
  }
`

export const getWalletInfo: TypedDocumentNode<Pick<Query, 'getWalletInfo'>, QueryGetWalletInfoArgs> = gql`
  query GetWalletInfo($input: WalletInfoInput!) {
    getWalletInfo(input: $input) {
      totalBuyTxs
      totalSellTxs
      totalUsdBuyAmount
      totalUsdSellAmount
      maxHolding
      currentHolding
      holdingDuration
      label
    }
  }
`

export const getFullyTrendingTokens = gql`
  query GetTokenTrending($input: TokenTrendingInput!) {
    getTokenTrending(input: $input) {
      limit
      page
      data {
        avatarUrl
        chainId
        token
        name
        image
        symbol
        price
        price1mChange
        price5mChange
        price6hChange
        price1hChange
        price24hChange
        buyTxs1m
        buyTxs5m
        buyTxs1h
        buyTxs6h
        buyTxs24h
        sellTxs1m
        sellTxs5m
        sellTxs1h
        sellTxs6h
        sellTxs24h
        volume1m
        volume5m
        volume1h
        volume6h
        volume24h
        marketcap
        liquidity
        numberOfHolder
        dexes
        createdTime
        tweetId
        twitterNameChangeCount
        twitterUrl
        website
        trendingScore1h
        trendingScore1m
        trendingScore24h
        trendingScore5m
        trendingScore6h
        advertisesOnDex
        mint
        blacklist
        burnt
        bundlerHoldingPercent
        top10Holder
        devHold
        insider
        sameSourceWallet
        devLaunched
        devMigrated
        sniperHoldPct
        isFavorite
        creator
        bundlerHoldingPercent
        smartMoneyHolder
        botHolder
        ohlc {
          ts
          open
          usdVolume
        }
      }
    }
  }
`

export const getFullyTrendingTokensWithDebug = gql`
  query GetTokenTrending($input: TokenTrendingInput!) {
    getTokenTrending(input: $input) {
      limit
      page
      data {
        avatarUrl
        chainId
        token
        name
        image
        symbol
        price
        price1mChange
        price5mChange
        price6hChange
        price1hChange
        price24hChange
        buyTxs1m
        buyTxs5m
        buyTxs1h
        buyTxs6h
        buyTxs24h
        sellTxs1m
        sellTxs5m
        sellTxs1h
        sellTxs6h
        sellTxs24h
        volume1m
        volume5m
        volume1h
        volume6h
        volume24h
        marketcap
        liquidity
        numberOfHolder
        dexes
        createdTime
        tweetId
        twitterNameChangeCount
        twitterUrl
        website
        trendingScore1h
        trendingScore1m
        trendingScore24h
        trendingScore5m
        trendingScore6h
        advertisesOnDex
        mint
        blacklist
        burnt
        bundlerHoldingPercent
        devHold
        insider
        sameSourceWallet
        devLaunched
        devMigrated
        sniperHoldPct
        top10Holder
        isFavorite
        creator
        bundlerHoldingPercent
        smartMoneyHolder
        botHolder
        ohlc {
          ts
          open
          usdVolume
        }
        debug {
          calculatedAt
          score
          debugData {
            txCount
            volUsd
            priceChange
            holderGrowthPercentage
            liqMCPercentage
            zTx
            zVol
            zPrice
            zHolder
            zLiq
            cappedZTx
            cappedZVol
            cappedZPrice
            cappedZHolder
            cappedZLiq
            liquidityPenalty
            volumeMultiplier
            transactionMultiplier
            ageBoost
            agePenalty
            securityBoost
            avgTx
            sdTx
            avgVol
            sdVol
            avgPriceChange
            sdPriceChange
            avgHg
            sdHg
            avgLq
            sdLq
            baseScore
            normalizedBase
            finalScore
            tokenAge
            tokenCreatedAt
            timeframeWindow
          }
        }
      }
    }
  }
`

export const getSimilarTokens: TypedDocumentNode<Pick<FutureQuery, 'searchSimilar'>, QuerySearchSimilarArgs> = gql`
  query SearchSimilar($input: SearchSimilarInput!) {
    searchSimilar(input: $input) {
      data {
        token
        name
        symbol
        image
        createdAt
        marketCap
        lastTxAt
      }
    }
  }
`

export const getDevHoldings: TypedDocumentNode<Pick<FutureQuery, 'getDevHold'>, FutureQueryGetDevHoldArgs> = gql`
  query GetDevHold($input: DevHoldInput!) {
    getDevHold(input: $input) {
      fundingAddress
      transferIn
      time
    }
  }
`

export const getBundle = gql`
  query GetBundle($input: BundleInput!) {
    getBundle(input: $input) {
      athHold
      totalBundler
      bundledTotal
      bundledToken
    }
  }
`
export const getSmartMoneyHolderCount: TypedDocumentNode = gql`
  query GetSmartMoneyHolderCount($req: GetHolderCountReq!) {
    getSmartMoneyHolderCount(req: $req)
  }
`

export const getTop100HolderStatistics: TypedDocumentNode = gql`
  query GetTop100HolderStatistic($token: String!, $chainId: Int!) {
    getTop100HolderStatistic(token: $token, chainId: $chainId) {
      totalHoldingPct
      averageBuyPrice
      averageBuyPrice24hChangePct
      averageSellPrice
      averageSellPrice24hChangePct
    }
  }
`

export const getWalletStatisticsPC = gql`
  query GetWalletStatistic($input: WalletStatisticInput!) {
    getWalletStatistic(input: $input) {
      totalBuyTxs
      totalSellTxs
      pnl
      totalUsdBuyAmount
      totalUsdSellAmount
      maxHolding
      currentHolding
      avgBuyMarketCap
      avgSellMarketCap
      holdingDuration
      label
      labels
      walletAddress
      tracked
      noted
      winrate7d
      pnl7d
      trades7d
      tokens7d
      avgHolding7d
    }
  }
`

export const getWalletInfo2: TypedDocumentNode<Pick<Query, 'getWalletInfo'>, QueryGetWalletInfoArgs> = gql`
  query GetWalletInfo($input: WalletInfoInput!) {
    getWalletInfo(input: $input) {
      avgBuyMarketCap
      avgSellMarketCap
      maxHolding
      totalBuyTxs
      totalSellTxs
      totalUsdBuyAmount
      totalUsdSellAmount
      totalFee
      totalFeeUSD
      holdingDuration
      winrate7d
      pnl
      pnl7d
      trades7d
      tokens7d
      avgHolding7d
      whaleTrack
      walletAddress
      label
      currentHolding
      noted
      tracked
    }
  }
`

export const getMemeTrendingTokens: TypedDocumentNode<
  Pick<Meme2Query, 'getTokenTrending'>,
  QueryGetTokenTrendingArgs
> = gql`
  query GetTokenTrending($input: TokenTrendingInput!) {
    getTokenTrending(input: $input) {
      page
      limit
      data {
        chainId
        token
        symbol
        marketcap
        liquidity
        price
        price1hChange
        avatarUrl
        image
        dexes
      }
    }
  }
`
