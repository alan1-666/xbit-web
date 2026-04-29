import { gql, TypedDocumentNode } from '@apollo/client'
import { UserSettingsDto } from '@/@generated/gql/graphql-user.ts'
import { GeneralResponse } from '@/types/responses.ts'

export const userSettings: TypedDocumentNode<GeneralResponse<'userSettings', UserSettingsDto>> = gql`
  query UserSettings {
    userSettings {
      id
      notificationPreferences {
        id
        userId
        notificationTypeCode
        channel
        isEnabled
      }
      withdrawalWhitelistAddresses {
        id
        userId
        address
        nickname
      }
      googleAuthenticator {
        userId
        isEnabled
      }
    }
  }
`

export const updateNotificationPreferences = gql`
  mutation UpdatePreference($input: UpdatePreferenceInput!) {
    updatePreference(input: $input)
  }
`

export const getReferralCode = gql`
  query GetRerferrerCode($input: GetRerferrerCodeInput!) {
    GetRerferrerCode(input: $input) {
      referrerCode
    }
  }
`
