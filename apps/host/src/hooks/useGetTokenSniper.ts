import { getTokenSnipers } from '@services/tokens.service.ts'
import { ChainIds } from '@/types/enums.ts'
import { gqlMeme2 } from '@/lib/gql/apollo-client.ts'
import { useQuery } from '@tanstack/react-query'

type useGetTokenSniperProps = {
  address: string
  chainId: ChainIds
}

const useGetTokenSniper = (props: useGetTokenSniperProps) => {
  const { address, chainId } = props
  return useQuery({
    queryKey: ['getTokenSniper', chainId, address],
    enabled: !!address && !!chainId,
    queryFn: async () => {
      const response = await gqlMeme2.query({
        query: getTokenSnipers,
        variables: {
          input: {
            tokenAddress: address,
            chainId: chainId,
          },
        },
      })

      return response.data
    },
  })
}

export default useGetTokenSniper
