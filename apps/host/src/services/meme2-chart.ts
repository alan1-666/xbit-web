import { gql } from "@apollo/client";

export const getKlineStickersQuery = gql`
  query GetKlineSticker($input: KlineStickerInput!) {
    getKlineSticker(input: $input) {
      ts
      data {
        walletAddress
        nativeAmount
        tokenAmount
        usdAmount
        type
        userType
        txs
      }
    }
  }
`