import { ApolloError } from '@apollo/client'

export class AppError extends Error {
  code: string
  data: any
  constructor(code: string, message: string, data?: any) {
    super(message)
    this.code = code
    this.message = message
    this.data = data
  }
}

export interface GqlErrorItem {
  message: string
  code: string
  meta?: Record<string, any>
}

enum CommonError {
  Network = 'ERR_NETWORK',
}

export class GqlError extends Error {
  response: ApolloError

  constructor(err: ApolloError) {
    super(err + '')
    this.response = err
  }

  get errors(): GqlErrorItem[] {
    const err = this.response
    const { graphQLErrors, networkError, clientErrors } = err

    if (networkError) {
      const result = (networkError as any)?.result
      if (!result) {
        return [{ code: CommonError.Network, message: err.message }]
      }
      return result.errors?.map((e: any) => parseGqlError(e)) || [result]
    }

    if (graphQLErrors) {
      return graphQLErrors.map((e) => parseGqlError(e))
    }
    if (clientErrors) {
      return clientErrors.map((e) => parseGqlError(e))
    }
    return []
  }
}

function parseGqlError(e: any): GqlErrorItem {
  const { message, extensions } = e
  const code = (extensions as any).code as string
  const meta = (extensions as any).meta as Record<string, any>
  return { message, code, meta }
}
