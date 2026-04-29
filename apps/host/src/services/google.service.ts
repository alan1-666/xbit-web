import { gql } from '@apollo/client'

export const setupNew2FA = gql`
  query setupNew2FA {
    setupNew2FA {
      secretCode
      recoveryCodes
      uri
    }
  }
`

export const verify2FA = gql`
  query verify2FA($code: String!) {
    verify2FA(code: $code)
  }
`

export const disable2FA = gql`
  mutation disable2FA($code: String!) {
    disable2FA(otpCode: $code)
  }
`

export const verifyTOTP = gql`
  query verifyTOTP($code: String!) {
    verifyTOTP(code: $code)
  }
`

export const userIsGoogleAuthenticatorEnabled = gql`
  query userSettings {
    userSettings {
      googleAuthenticator {
        isEnabled
      }
    }
  }
`

export const getWalletWhitelist = gql`
  query getWalletWhitelist {
    getWalletWhitelist {
      whitelist {
        chainId
        walletAddress
      }
    }
  }
`

export const addWalletWhitelist = gql`
  mutation addWalletWhitelist($input: AddUserWalletWhitelistInput!) {
    addWalletWhitelist(input: $input) {
      whitelist {
        chainId
        walletAddress
      }
    }
  }
`
