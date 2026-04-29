export type GroupOption = {
  label: string
  value: string
}

export type AddressResponse = {
  id: string
  address: string
  remarkName?: string | null
  groupIds?: string[]
  ownerUserId?: string | null
  userAddress?: string | null
  profit1d?: number | null
  profit7d?: number | null
  profit30d?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type ListAddressesResp = {
  listAddresses: AddressResponse[]
}

export type ListAddressesVars = {
  groupId?: string
  ownerUserId?: string
  userId?: string
}

export type CreateAddressRequest = {
  address: string
  remarkName?: string | null
  groupIds?: string[] | null
}

export type CreateAddressMutationData = {
  createAddress: AddressResponse
}

export type CreateAddressMutationVars = {
  input: CreateAddressRequest
}
