import { gql, TypedDocumentNode } from '@apollo/client'
import { GeneralResponse } from '@/types/responses.ts'
import {
  Notification,
  QueryListNotificationArgs,
  RegisterDeviceTokenInput,
} from '@/@generated/gql/graphql-notification.ts'
import { GeneralInput } from '@/types/requests.ts'

export const getNotificationsList: TypedDocumentNode<
  GeneralResponse<'ListNotification', Notification[]>,
  QueryListNotificationArgs
> = gql`
  query ListNotification($input: ListNotificationInput!) {
    ListNotification(input: $input) {
      id
      avatar
      title
      description
      type
      metadata
      read
      createdAt
    }
  }
`

export const registerTokenDevice: TypedDocumentNode<any, GeneralInput<RegisterDeviceTokenInput>> = gql`
  mutation RegisterDeviceToken($input: RegisterDeviceTokenInput!) {
    registerDeviceToken(input: $input)
  }
`

export const getUnreadNotificationCount: TypedDocumentNode<GeneralResponse<'getUnreadNotificationCount', number>> = gql`
  query GetUnreadNotificationCount {
    getUnreadNotificationCount
  }
`

export const readNotification = gql`
  mutation ReadNotification($id: String!) {
    readNotification(id: $id)
  }
`

export const toggleUnreadCountNotification = gql`
  mutation ToggleUnreadCountNotification($flag: Boolean!) {
    toggleUnreadCountNotification(flag: $flag)
  }
`

export const getActiveDeviceToken = gql`
  query GetActiveDeviceToken($input: GetActiveDeviceTokenInput!) {
    getActiveDeviceToken(input: $input) {
      id
      userId
      token
      provider
      platform
      appVersion
      deviceName
      fingerprint
      languageCode
      lastRegisteredAt
      createdAt
      updatedAt
    }
  }
`

export const getErrorMessages = gql`
  query GetErrorMessages {
    getErrorMessages
  }
`
