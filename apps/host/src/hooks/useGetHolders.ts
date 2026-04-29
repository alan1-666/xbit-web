import { GetHoldersResponse } from '@/types/responses.ts'
import { getHolder } from '@services/tokens.service.ts'
import { HolderInput } from '@/@generated/gql/graphql-meme2.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'
import { useQuery } from '@tanstack/react-query'

type useGetHoldersProps = {
  input: HolderInput
  skip?: boolean
}

const useGetHolders = (props: useGetHoldersProps) => {
  const { input, skip } = props

  return useQuery<GetHoldersResponse>({
    queryKey: ['getHolder', { ...input }],
    enabled: !skip || Number(input?.page) <= 5,
    queryFn: async () => {
      const response = await futureClient.query({
        query: getHolder,
        variables: {
          input,
        },
      })

      return response.data
    },
  })
}

export default useGetHolders
