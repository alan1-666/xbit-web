import { useQuery } from '@tanstack/react-query'
import { userService } from '@/modules/prediction/services/user.service.ts'
import { CalculateMarketPriceInput, CalculateMarketPriceResponseDto } from '@/@generated/gql/graphql-xpUser'

export const useCalculatePolymarketPrice = (input: CalculateMarketPriceInput, enabled: boolean = true) => {
  return useQuery<CalculateMarketPriceResponseDto | undefined>({
    queryKey: ['prediction', 'calculate-polymarket-price', input],
    queryFn: () => userService.calculatePolymarketPrice(input),
    enabled,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    refetchIntervalInBackground: false, // Do not refetch when the app is in the background
  })
}
