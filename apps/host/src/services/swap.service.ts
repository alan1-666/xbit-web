import { gql } from '@apollo/client'

export const getExchangeMeta = gql`
  query GetExchangeMeta {
    getExchangeMeta {
      tokens {
        id
        address
        blockChain
        symbol
        name
        image
        usdPrice
        decimals
        isPopular
        isSecondaryCoin
        coinSource
        coinSourceUrl
        supportedSwappers
        chainDetail {
          id
          name
          chainId
          defaultDecimals
          addressPatterns
          feeAssets
          logo
          displayName
          shortName
          sort
          color
          enabled
          type
          info
        }
      }
      swappers {
        id
        swapperId
        title
        logo
        swapperGroup
        types
        enabled
      }
      blockchains {
        id
        name
        chainId
        defaultDecimals
        addressPatterns
        feeAssets
        logo
        displayName
        shortName
        sort
        color
        enabled
        type
        info
      }
      popularTokens {
        id
        address
        blockChain
        symbol
        name
        image
        usdPrice
        decimals
        isPopular
        isSecondaryCoin
        coinSource
        coinSourceUrl
        supportedSwappers
      }
    }
  }
`

export const getAllPossibleRoutes = gql`
  query GetAllPossibleRoutes($input: GetAllPossibleRoutesRequest!) {
    getAllPossibleRoutes(input: $input) {
      from {
        blockchain
        symbol
        address
      }
      to {
        blockchain
        symbol
        address
      }
      requestAmount
      routeId
      results {
        requestId
        outputAmount
        resultType
        walletNotSupportingFromBlockchain
        missingBlockchains
        priceImpactUsd
        priceImpactUsdPercent
        swaps {
          swapperId
          swapperLogo
          swapperType
          from {
            symbol
            logo
            blockchainLogo
            address
            blockchain
            decimals
            usdPrice
          }
          to {
            symbol
            logo
            blockchainLogo
            address
            blockchain
            decimals
            usdPrice
          }
          fromAmount
          fromAmountPrecision
          fromAmountMinValue
          fromAmountMaxValue
          fromAmountRestrictionType
          toAmount
          fee {
            asset {
              blockchain
              symbol
              address
            }
            expenseType
            amount
            name
            meta {
              type
              gasLimit
              gasPrice
            }
            price
          }
          estimatedTimeInSeconds
          swapChainType
          routes {
            nodes {
              nodes {
                inputAmount
                marketId
                marketName
                outputAmount
                percent
                pools
              }
              from
              fromLogo
              fromAddress
              fromBlockchain
              to
              toLogo
              toAddress
              toBlockchain
            }
          }
          recommendedSlippage {
            error
            slippage
          }
          warnings
          timeStat {
            min
            avg
            max
          }
          includesDestinationTx
          internalSwaps {
            swapperId
            swapperLogo
            swapperType
            from {
              symbol
              logo
              blockchainLogo
              address
              blockchain
              decimals
              usdPrice
            }
            to {
              symbol
              logo
              blockchainLogo
              address
              blockchain
              decimals
              usdPrice
            }
            fromAmount
            fromAmountPrecision
            fromAmountMinValue
            fromAmountMaxValue
            fromAmountRestrictionType
            toAmount
            fee {
              asset {
                blockchain
                symbol
                address
              }
              expenseType
              amount
              name
              meta {
                type
                gasLimit
                gasPrice
              }
              price
            }
            estimatedTimeInSeconds
            swapChainType
            routes {
              nodes {
                nodes {
                  inputAmount
                  marketId
                  marketName
                  outputAmount
                  percent
                  pools
                }
                from
                fromLogo
                fromAddress
                fromBlockchain
                to
                toLogo
                toAddress
                toBlockchain
              }
            }
            recommendedSlippage
            warnings
            timeStat
            includesDestinationTx
            internalSwaps {
              # Recursive fields are possible, but often truncated in practice.
              # You may want to avoid infinite recursion.
              swapperId
            }
            maxRequiredSign
          }
          maxRequiredSign
        }
        scores {
          preferenceType
          score
        }
        tags {
          label
          value
        }
      }
      diagnosisMessages
      error
      errorCode
      traceId
    }
  }
`

export const confirmRoute = gql`
  mutation ConfirmRoute($input: ConfirmRouteRequest!) {
    confirmRoute(input: $input) {
      requestId
      status
      routeErr
    }
  }
`

export const createTx = gql`
  mutation CreateTx($input: CreateTxRequest!) {
    createTx(input: $input) {
      ok
      error
      errorCode
      traceId
      transaction {
        type
        blockChain
        isApprovalTx
        from
        to
        spender
        data
        value
        gasLimit
        gasPrice
        maxPriorityFeePerGas
        maxFeePerGas
        nonce
        identifier
        instructions
        recentBlockhash
        signatures
        serializedMessage
        txType
      }
      signUserTransactionEvm {
        user_id
        to
        data
        value
        chain
        maxFeePerGas
        maxPriorityFeePerGas
        gasLimit
        gasPrice
        from
        signed_transaction
      }
    }
  }
`

export const checkStatus = gql`
  query CheckStatus($input: CheckStatusRequest!) {
    checkStatus(input: $input) {
      status
      extraMessage
      failedType
      timestamp
      outputAmount
      diagnosisUrl
      steps
      outputType
      error
      errorCode
      traceId
      explorerUrl {
        url
        description
      }
      referrals {
        amount
        blockChain
        symbol
        address
        decimals
        type
      }
      newTx {
        data
        to
        value
        gasLimit
        gasPrice
        nonce
      }
      outputToken {
        blockchain
        symbol
        image
        address
        usdPrice
        decimals
        name
        isPopular
        isSecondaryCoin
        coinSource
        coinSourceUrl
        supportedSwappers
      }
      bridgeExtra {
        requireRefundAction
        srcTx
        destTx
      }
    }
  }
`

export const signTx = gql`
  mutation SignTx($input: CreateTxRequest!) {
    signTx(input: $input) {
      signature
      from
      to
      data
      value
      gasLimit
      gasPrice
      maxPriorityFeePerGas
      maxFeePerGas
      nonce
      blockChain
    }
  }
`

export const getExchangeMetaV2 = gql`
  query GetExchangeMetaV2 {
    getExchangeMetaV2 {
      chains {
        chainId
        chainImage
        chainName
        tokens {
          address
          symbol
          name
          image
          decimals
          usdPrice
          relayExtra {
            id
          }
          rangoExtra {
            id
          }
        }
      }
    }
  }
`
export const getQuoteV2 = gql`
  query GetQuoteV2($input: QuoteRequest!) {
    getQuoteV2(input: $input) {
      requestId
      type
      description
      errorCode
      outPutAmountFormatted
      gasTopupAmount
      gasTopupAmountFormatted
      gasTopupAmountUsd
      gasAmountFormatted
      platformFeeAmountFormat
      platformFeeSymbol
      thresholdCapacity
      items {
        from
        to
        data
        value
        valueAmountUsd
        valueAmountFormatted
        chainId
        gas
        gasAmountUsd
        gasAmountFormatted
        maxFeePerGas
        maxPriorityFeePerGas
        serializedMessage
        nonce
        blockHash
        transactionType
        estimatedTimeInSeconds
        isApprovalTx
        instructions {
          programId
          data
          keys {
            pubkey
            isSigner
            isWritable
          }
        }
      }
    }
  }
`

export const getCurrencies = gql`
  query RelayCurrencies {
    relayCurrencies {
      chains {
        chainId
        chainImage
        chainName
        tokenId
        decimals
        address
      }
      tokens {
        symbol
        name
        image
        chainList {
          chainId
          chainImage
          chainName
          tokenId
          decimals
          vmType
          address
        }
      }
      minBridgeUsd
    }
  }
`

export const getQuote = gql`
  query QuoteRelay($input: QuoteRelayRequest!) {
    quoteRelay(input: $input) {
      maxBridgeAmount
      totalImpactUsd
      totalImpactPercent
      timeEstimate
      currencyOutAmountUsd
      currencyOutAmountFormatted
      depositAddress
      depositSolAddress
      depositBtcAddress
      depositTvmAddress
      quote
      steps {
        id
        kind
        requestId
        items {
          from
          to
          data
          value
          chainId
          gas
          maxFeePerGas
          maxPriorityFeePerGas
          isApprovalTx
          serializedMessage
          nonce
          eip712PrimaryType
          instructions {
            programId
            data
            keys {
              pubkey
              isSigner
              isWritable
            }
          }
          sign {
            signatureKind
            primaryType
            types {
              nonceMapping {
                name
                type
              }
            }
            domain {
              name
              version
              chainId
              verifyingContract
            }
            value {
              chainId
              wallet
              nonce
              id
            }
          }
          post {
            endpoint
            method
            body {
              type
              walletChainId
              wallet
              nonce
              id
              signatureChainId
            }
          }
          action {
            type
            parameters {
              hyperliquidChain
              destination
              sourceDex
              destinationDex
              token
              amount
              fromSubAccount
              nonce
            }
          }
          eip712Types {
            hyperliquidTransactionSendAsset {
              name
              type
            }
          }
        }
      }
    }
  }
`

export const getRelayConfig = gql`
  query GetRelayConfig($input: ReqRelayConfig!) {
    getRelayConfig(input: $input) {
      enabled
      fee
      supportsExternalLiquidity
      user {
        balance
        maxBridgeAmount
      }
      solver {
        address
        balance
        capacityPerRequest
      }
    }
  }
`

export const getRelayPrice = gql`
  query GetRelayPrice($input: ReqRelayPrice!) {
    getRelayPrice(input: $input) {
      tokenId
      price
    }
  }
`

export const getSwapStatus = gql`
  query GetStatus($input: ReqStatus!) {
    getStatus(input: $input) {
      status
      inTxHashes
      txHashes
      time
      originChainId
      destinationChainId
    }
  }
`

export const checkStatusV2 = gql`
  query CheckStatusV2($input: CheckStatusRequest!) {
    checkStatusV2(input: $input) {
      status
      extraMessage
      failedType
      timestamp
      outputAmount
      diagnosisUrl
      steps
      outputType
      error
      errorCode
      traceId
      explorerUrl {
        url
        description
      }
      referrals {
        amount
        blockChain
        symbol
        address
        decimals
        type
      }
      bridgeExtra {
        requireRefundAction
        srcTx
        destTx
      }
      outputToken {
        blockchain
        symbol
        image
        address
        usdPrice
        decimals
        name
        isPopular
        isSecondaryCoin
        coinSource
        coinSourceUrl
        supportedSwappers
      }
      newTx {
        data
        to
        value
        gasLimit
        gasPrice
        nonce
      }
    }
  }
`

export const createFundingSwap = gql`
  mutation CreateFundingSwap($input: FundingSwapTransactionInput!) {
    createFundingSwap(input: $input) {
      id
      fromAddress
      chainId
      token
      amount
      fee
      crossChainFee
      crossChainFeeUnit
      toAddress
      toChainId
      toToken
      toAmount
      route
      createdAt
    }
  }
`
export const createFutureTransaction = gql`
  mutation CreateFutureTransaction($input: CreateFuturesTransactionInput!) {
    createFutureTransaction(input: $input) {
      type
      fromAddress
      chainId
      token
      amount
      fee
      toAddress
      toChainId
      txHash
      status
      errorCode
      errorMessage
      nonce
      createdAt
    }
  }
`
