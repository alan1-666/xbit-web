import { KlineStickerDto, KlineStickerInput } from '@/@generated/gql/graphql-meme2'
import { gqlMeme2 } from '@/lib/gql/apollo-client'
import { getKlineStickersQuery } from '@/services/meme2-chart'
import { useQuery } from '@apollo/client'
import { useMemo } from 'react'

interface UseKlineStickersOptions {
  input: KlineStickerInput
  onCompleted?: (data: { getKlineSticker: Array<KlineStickerDto> }) => void
}
export const useKlineStickers = ({ input, onCompleted }: UseKlineStickersOptions) => {
  const skip = !input.token || !input.chainId || !input.type || input.type.length === 0 // avoid toggling on activeChain object identity

  const variables = useMemo(
    () => ({
      input,
    }),
    [input],
  )

  return useQuery<{
    getKlineSticker: Array<KlineStickerDto>
  }>(getKlineStickersQuery, {
    client: gqlMeme2,
    variables,
    skip,
    notifyOnNetworkStatusChange: false,
    returnPartialData: true,
    onCompleted: (data) => {
      onCompleted?.(data)
    },
  })
}
