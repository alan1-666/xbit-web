import {
  ApolloClient,
  ApolloClientOptions,
  ApolloQueryResult,
  createHttpLink,
  DefaultContext,
  FetchResult,
  InMemoryCache,
  MaybeMasked,
  MutationOptions,
  OperationVariables,
  QueryOptions,
  from,
  ApolloError,
  fromPromise,
  Operation,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GqlError } from './error'
import { ServiceConfig } from './service-config'
import { EVENT_MESSAGE_FORCE_LOGOUT, EVENT_MESSAGE_REFRESH_TOKEN } from '@/components/error-wapper'
import eventBus from '../eventBus'
import { refreshToken } from '@/hooks/useNewRefreshToken'
import { GraphQLFormattedError } from 'graphql/error'
import * as Sentry from '@sentry/react'

const clientCache = new InMemoryCache()
const meme2Cache = new InMemoryCache()
const tradingClientCache = new InMemoryCache()
const userClientCache = new InMemoryCache()
const futureClientCache = new InMemoryCache()
const symbolDexCache = new InMemoryCache()
const agentDexCache = new InMemoryCache()
const redpacketCache = new InMemoryCache()
const notificationClientCache = new InMemoryCache()
const walletCache = new InMemoryCache()
const dexHyperTraderCache = new InMemoryCache()
const affiliateClientCache = new InMemoryCache()
const hypertraderClientCache = new InMemoryCache()
const loyaltyClientCache = new InMemoryCache()
const adminClientCache = new InMemoryCache()
const predictionClientCache = new InMemoryCache()
const xpUserClientCache = new InMemoryCache()

let refreshingPromise: Promise<string | null> | null = null

function getRefreshedToken(): Promise<string | null> {
  if (!refreshingPromise) {
    refreshingPromise = refreshToken().finally(() => {
      refreshingPromise = null
    })
  }

  return refreshingPromise
}

class CgApolloClient<T> extends ApolloClient<T> {
  constructor(options: ApolloClientOptions<T>) {
    super(options)
  }

  async query<T = any, TVariables extends OperationVariables = OperationVariables>(
    options: QueryOptions<TVariables, T>,
  ): Promise<ApolloQueryResult<MaybeMasked<T>>> {
    try {
      return await super.query(options)
    } catch (err) {
      // console.log('Query error:', err)
      throw new GqlError(err as ApolloError).errors
    }
  }

  async mutate<
    TData = any,
    TVariables extends OperationVariables = OperationVariables,
    TContext extends Record<string, any> = DefaultContext,
  >(options: MutationOptions<TData, TVariables, TContext>): Promise<FetchResult<MaybeMasked<TData>>> {
    try {
      return await super.mutate(options)
    } catch (err) {
      console.log('Mutation error:', err)
      throw new GqlError(err as ApolloError).errors
    }
  }
}

const sendErrorsToSentry = (operation: Operation, errors: readonly GraphQLFormattedError[]) => {
  if (!errors || errors.length === 0) return
  // console.log('Send error log to Sentry', operation, errors)
  const errorTitle = `GraphQL Error: ${operation.operationName} - ${errors[0]?.message || 'Unknown error'}`
  Sentry.captureMessage(errorTitle, {
    level: 'error',
    extra: {
      type: 'graphql-error',
      errors: errors[0]?.message,
    },
  })
}

const sharedErrorLink = onError(({ networkError, operation, response, forward, graphQLErrors }) => {
  if (graphQLErrors) {
    sendErrorsToSentry(operation, graphQLErrors)
  }

  if (response?.errors) {
    const tokenError = response.errors.find(
      (error: any) =>
        error.extensions?.code === 'ErrAccessTokenInvalid' || error.extensions?.code === 'UNAUTHENTICATED',
    )
    if (tokenError && ServiceConfig.refreshToken && ServiceConfig.token) {
      return fromPromise(
        getRefreshedToken().then((newToken) => {
          if (!newToken) {
            eventBus.dispatch(EVENT_MESSAGE_FORCE_LOGOUT, {
              data: {
                isForceLogout: true,
              },
            })
            throw new Error('Unable to refresh token')
          }
          ServiceConfig.token = newToken
          eventBus.dispatch(EVENT_MESSAGE_REFRESH_TOKEN, {
            data: newToken,
          })
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: `Bearer ${newToken}`,
            },
          }))
          return forward(operation)
        }),
      ).flatMap((res) => res)
    }
  }
  if (
    networkError &&
    (networkError as any)?.result &&
    (networkError as any)?.result?.code &&
    ((networkError as any)?.result?.code === 'ErrAccessTokenInvalid' ||
      (networkError as any)?.result?.code === 'UNAUTHENTICATED')
  ) {
    if (ServiceConfig.refreshToken && ServiceConfig.token) {
      return fromPromise(
        getRefreshedToken().then((newToken) => {
          if (!newToken) {
            eventBus.dispatch(EVENT_MESSAGE_FORCE_LOGOUT, {
              data: {
                isForceLogout: true,
              },
            })
            throw new Error('Unable to refresh token')
          }
          ServiceConfig.token = newToken
          eventBus.dispatch(EVENT_MESSAGE_REFRESH_TOKEN, {
            data: newToken,
          })
          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: `Bearer ${newToken}`,
            },
          }))
          return forward(operation)
        }),
      ).flatMap((res) => res)
    }
  }

  if (response?.errors || networkError) {
    return
  }

  return forward(operation)
})

function createApolloClient(uri: string, cache: InMemoryCache) {
  const httpLink = createHttpLink({
    uri: (operation) => {
      return uri + '?op=' + operation.operationName
    },
  })
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${ServiceConfig.token}`,
      },
    }
  })
  return new CgApolloClient({
    link: from([sharedErrorLink, authLink, httpLink]),
    cache,
    connectToDevTools: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  })
}

function createApolloClientConsumer(uri: string, cache: InMemoryCache) {
  const httpLink = createHttpLink({
    uri: (operation) => uri + '?op=' + operation.operationName,
  })
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        'X-Consumer-Username': 'xbit',
        authorization: `Bearer ${ServiceConfig.token}`,
      },
    }
  })
  return new CgApolloClient({
    link: from([sharedErrorLink, authLink, httpLink]),
    cache,
    connectToDevTools: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  })
}

export const gqlClient = createApolloClient(import.meta.env.VITE_GRAPHQL_HTTP_URL, clientCache)
export const gqlMeme2 = createApolloClient(import.meta.env.VITE_GRAPHQL_MEME2_URL, meme2Cache)
export const tradingClient = createApolloClient(import.meta.env.VITE_GRAPHQL_TRADING_HTTP_URL, tradingClientCache)
export const userGqlClient = createApolloClient(import.meta.env.VITE_GRAPHQL_USER_HTTP_URL, userClientCache)
export const futureClient = createApolloClient(import.meta.env.VITE_GRAPHQL_FUTURE_HTTP_URL, futureClientCache)
export const walletClient = createApolloClient(import.meta.env.VITE_GRAPHQL_WALLET_HTTP_URL, walletCache)
export const dexHyperTraderClient = createApolloClient(import.meta.env.VITE_GRAPHQL_DEX_HYPERTRADER_HTTP_URL, dexHyperTraderCache)
export const symbolDexClient = createApolloClientConsumer(import.meta.env.VITE_GRAPHQL_HTTP_DEX_URL, symbolDexCache)
export const agentDexClient = createApolloClientConsumer(import.meta.env.VITE_GRAPHQL_AGENT_HTTP_URL, agentDexCache)
export const adminClient = createApolloClientConsumer(import.meta.env.VITE_GRAPHQL_ADMIN_HTTP_URL, adminClientCache)
export const redpacketClient = createApolloClientConsumer(import.meta.env.VITE_GRAPHQL_REDPACKET_HTTP_URL, redpacketCache)

export const notificationClient = createApolloClientConsumer(
  import.meta.env.VITE_GRAPHQL_NOTIFICATION_HTTP_URL,
  notificationClientCache,
)
export const affiliateClient = createApolloClientConsumer(
  import.meta.env.VITE_GRAPHQL_AFFILIATE_HTTP_URL,
  affiliateClientCache,
)
export const predictionClient = createApolloClient(
  import.meta.env.VITE_GRAPHQL_PREDICTION_HTTP_URL,
  predictionClientCache,
)
export const xpUserClient = createApolloClient(import.meta.env.VITE_GRAPHQL_XP_USER_HTTP_URL, xpUserClientCache)
export const webviewClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([createHttpLink({ uri: import.meta.env.VITE_GRAPHQL_HTTP_URL })]),
})
// loyalty query
export const loyaltyClient = createApolloClientConsumer(import.meta.env.VITE_APP_LOYALTY_HTTP_URL, loyaltyClientCache)

export const hypertraderClient = createApolloClient(
  import.meta.env.VITE_DEX_HYPERTRADER_GRAPHQL_URL,
  hypertraderClientCache,
)


// 代理相关gql client

// user Invite list
export const GetInvitationRecords = createApolloClientConsumer(
  import.meta.env.VITE_GRAPHQL_AGENT_HTTP_URL,
  agentDexCache,
)
