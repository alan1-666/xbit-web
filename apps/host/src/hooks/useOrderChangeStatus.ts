import { ConfigStatus } from "@/@generated/gql/graphql-trading"
import { tradingClient } from "@/lib/gql/apollo-client"
import { updateCopyTradeConfig } from "@/services/copytrade.service"
import { ApolloError, useMutation } from "@apollo/client"
import { useCallback, useState } from "react"

interface IOrderChangeStatus {
  changeStatus: (status: keyof typeof ConfigStatus) => Promise<any>
  loading: boolean
  error: ApolloError | null
}

export function useCreateOrder(): IOrderChangeStatus {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApolloError | null>(null)
  const [mutate] = useMutation(updateCopyTradeConfig, {
    client: tradingClient
  })

  const changeStatus = useCallback(
    async (input: keyof typeof ConfigStatus) => {
      setLoading(true)
      setError(null)
      try {
        const response = await mutate({
          variables: { input },
        })
        return response.data
      } catch (err) {
        setError(err as ApolloError)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutate]
  )

  return { changeStatus, loading, error }
}