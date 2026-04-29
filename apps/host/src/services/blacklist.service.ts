import { gql, TypedDocumentNode } from '@apollo/client'
import {
  Mutation,
  MutationAddBlacklistAddressesArgs,
  MutationRemoveBlacklistAddressesArgs,
  Query,
  QueryGetBlacklistArgs,
} from '@/@generated/gql/graphql-future.ts'

export const getBlacklist: TypedDocumentNode<Pick<Query, 'getBlacklist'>, QueryGetBlacklistArgs> = gql`
  query GetBlacklist($input: GetBlacklistInput!) {
    getBlacklist(input: $input) {
      addresses {
        address
        chainId
        createdTime
      }
    }
  }
`

export const getAllBlacklist: TypedDocumentNode<
  { devs: Query['getBlacklist']; tokens: Query['getBlacklist'] },
  { chain: QueryGetBlacklistArgs['input']['chain'] }
> = gql`
  query GetBlacklist($chain: ChainType!) {
    devs: getBlacklist(input: { type: Dev, chain: $chain }) {
      addresses {
        address
        chainId
        createdTime
      }
    }
    tokens: getBlacklist(input: { type: Token, chain: $chain }) {
      addresses {
        address
        chainId
        createdTime
      }
    }
  }
`

export const addToBlacklist: TypedDocumentNode<Mutation['addBlacklistAddresses'], MutationAddBlacklistAddressesArgs> =
  gql`
    mutation AddBlacklistAddresses($req: UpdateBlacklistAddressesReq!) {
      addBlacklistAddresses(req: $req)
    }
  `

export const removeFromBlacklist: TypedDocumentNode<
  Mutation['removeBlacklistAddresses'],
  MutationRemoveBlacklistAddressesArgs
> = gql`
  mutation RemoveBlacklistAddresses($req: UpdateBlacklistAddressesReq!) {
    removeBlacklistAddresses(req: $req)
  }
`
