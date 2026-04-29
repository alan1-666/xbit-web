import { gql } from '@apollo/client'
import { TurnkeyIndexedDbClient } from '@turnkey/sdk-browser'

export const loginByTGMutation = gql`
  mutation loginByTelegram($userId: String!, $code: String!, $referrerCode: String, $fingerprint: String) {
    loginByTelegram(userId: $userId, code: $code, referrerCode: $referrerCode, fingerprint: $fingerprint) {
      accessToken
      refreshToken
      userId
      referrerCode
      fingerprint
    }
  }
`
export const loginByTGv2Mutation = gql`
  mutation loginTelegramV2($input: InputLoginTelegramV2Dto!) {
    loginTelegramV2(input: $input) {
      accessToken
      refreshToken
      userId
      referrerCode
      fingerprint
    }
  }
`

export const loginByWalletMutation = gql`
  mutation loginByWallet(
    $message: String!
    $signature: String!
    $chainType: ChainType!
    $referrerCode: String
    $fingerprint: String
  ) {
    loginByWallet(
      message: $message
      signature: $signature
      chainType: $chainType
      referrerCode: $referrerCode
      fingerprint: $fingerprint
    ) {
      accessToken
      refreshToken
      referrerCode
      fingerprint
    }
  }
`
export const loginByWalletV2Mutation = gql`
  mutation loginByWalletV2($input: InputLoginWalletV2Dto!) {
    loginByWalletV2(input: $input) {
      accessToken
      refreshToken
      userId
      referrerCode
      fingerprint
      subOrgId
      turnKeyResponse
      deletedAt
      verifyBetaAccess
      verifyToken
      contactLink
      userEmbeddedWallets {
        id
        chain
        walletAddress
        walletId
        walletAccountId
        hdPath
        name
        displayOrder
        balance
      }
    }
  }
`

// export const loginWithGoogleMutation = gql`
//   mutation loginWithGoogle($input: InputLoginGoogleDto!) {
//     loginWithGoogle(input: $input) {
//       accessToken
//       refreshToken
//       userId
//       referrerCode
//       fingerprint
//       subOrgId
//       turnKeyResponse {
//         userId
//         apiKeyId
//         credentialBundle
//       }
//     }
//   }
// `

export const loginWithGoogleMutation = gql`
  mutation loginWithGoogle($input: GetGoogleSubOrgInputDTO!) {
    loginWithGoogleV2(input: $input) {
      accessToken
      refreshToken
      userId
      referrerCode
      fingerprint
      subOrgId
      deletedAt
      verifyBetaAccess
      verifyToken
      contactLink
      turnKeyResponse {
        session
      }
      userEmbeddedWallets {
        id
        chain
        walletAddress
        walletId
        walletAccountId
        hdPath
        name
        displayOrder
        balance
      }
    }
  }
`

export const loginWithAppleMutation = gql`
  mutation loginWithApple($input: GetGoogleSubOrgInputDTO!) {
    loginWithApple(input: $input) {
      accessToken
      refreshToken
      userId
      referrerCode
      fingerprint
      subOrgId
      deletedAt
      verifyBetaAccess
      verifyToken
      contactLink
      turnKeyResponse {
        session
      }
      userEmbeddedWallets {
        id
        chain
        walletAddress
        walletId
        walletAccountId
        hdPath
        name
        displayOrder
        balance
      }
    }
  }
`

export const loginWithEmailOtpMutation = gql`
  mutation loginWithEmailOtp($input: LoginWithEmailOtpInputDTO!) {
    loginWithEmailOtpV2(input: $input) {
      accessToken
      refreshToken
      userId
      referrerCode
      fingerprint
      subOrgId
      deletedAt
      verifyBetaAccess
      verifyToken
      contactLink
      turnKeyResponse {
        session
      }
      userEmbeddedWallets {
        id
        chain
        walletAddress
        walletId
        walletAccountId
        hdPath
        name
        displayOrder
        balance
      }
    }
  }
`

export const createWalletSubOrgWalletMutation = gql`
  mutation createWalletSubOrgV2($input: GetWalletSubOrgInputDTO!) {
    createWalletSubOrgV2(input: $input) {
      subOrgId
      userId
      sessionExpiresIn
    }
  }
`
export const requestReverifyOtpMutation = gql`
  mutation requestReverifyOtp($input: RequestReverifyOtpInputDto!) {
    requestReverifyOtp(input: $input) {
      otpId
      userId
      subOrgId
      ttl
      email
    }
  }
`

export const createGoogleSubOrgWalletMutation = gql`
  mutation createGoogleSubOrg($input: GetGoogleSubOrgInputDTO!) {
    createGoogleSubOrg(input: $input) {
      subOrgId
      userId
    }
  }
`
export const initEmailOtpMutate = gql`
  mutation initEmailOtp($input: InitEmailOtpInputDTO!) {
    initEmailOtp(input: $input) {
      otpId
      userId
      subOrgId
      ttl
    }
  }
`

export const getAccessTokenMutation = gql`
  mutation getAccessToken($refreshToken: String!) {
    getAccessToken(refreshToken: $refreshToken) {
      accessToken
    }
  }
`

export const migrateTurnkeyAccountMutation = gql`
  mutation MigrateTurnkeyUserVersion {
    migrateTurnkeyUserVersion {
        result
    }
  }
`

export const getUserInfoQuery = gql`
  query account {
    account {
      id
      authProvider
      walletAddress
      googleId
      email
      avatar
      isExportedWallet
      isFirstLogin
      turnkeyVersion
      subOrgId
      turnkeyRootUserId
      userManagedWallets {
        id
        chain
        walletAddress
        balance
      }
      userEmbeddedWallets {
        id
        chain
        name
        walletAddress
        balance
        walletId
        walletAccountId
        hdPath
      }
    }
  }
`

export const getNonceQuery = gql`
  query getNonce($wallAddress: String!) {
    getNonce(wallAddress: $wallAddress)
  }
`
export const checkRegisteredWalletMutaion = gql`
  mutation checkRegisteredWallet($walletAddress: String!, $chainType: AuthChainType!) {
    checkRegisteredWallet(walletAddress: $walletAddress, chainType: $chainType) {
      exists
      subOrgId
      expirationSeconds
    }
  }
`

export const approveExportPassphraseMutaion = gql`
  mutation approveExportPassphrase($input: ExportPassphraseInput!) {
    approveExportPassphrase(input: $input) {
      activityId
      passphrase
    }
  }
`

export const reverifyUserAuthenticationMutaion = gql`
  mutation reverifyUserAuthentication($input: ReverifyUserAuthenticationDto!) {
    reverifyUserAuthentication(input: $input) {
      result
    }
  }
`

export const approveExportPrivateKeyMutaion = gql`
  mutation approveExportPrivateKey($input: ExportPrivateKeyInput!) {
    approveExportPrivateKey(input: $input) {
      activityId
      privateKey
    }
  }
`

export const approveExportPrivateKeyWithoutVerifyMutate = gql`
  mutation approveExportPrivateKeyWithoutVerify($input: ExportPrivateKeyWithoutVerifyInput!) {
    approveExportPrivateKeyWithoutVerify(input: $input) {
      activityId
      privateKey
    }
  }
`
export const updateWalletOrderMutation = gql`
  mutation updateWalletOrder($input: UpdateWalletOrderInputDTO!) {
    updateWalletOrder(input: $input) {
      success
      message
      updatedCount
    }
  }
`

export const markedAsExportedPassphraseMutation = gql`
  mutation markedAsExportedPassphrase {
    markedAsExportedPassphrase {
      updated
    }
  }
`

export const checkHyperLiquidWallet = gql`
  mutation CheckHyperLiquidWallet {
    checkHyperLiquidWallet {
      approvedAgent
      setReferral
      setFeeBuilder
      agent
      agentName
      feeBuilderAddress
      feeBuilderPercent
      referralCode
    }
  }
`

export const updateHyperLiquidWalletMutation = gql`
  mutation updateHyperLiquidWallet($input: InputPerpetualStatusDTO!) {
    updateHyperLiquidWallet(input: $input) {
      approvedAgent
      setReferral
      setFeeBuilder
      agent
      agentName
      feeBuilderAddress
      feeBuilderPercent
      referralCode
    }
  }
`

export const signHyperLiquidCancelOrderMutation = gql`
  mutation signHyperLiquidCancelOrder($input: InputSignCancelOrderDTO!) {
    signHyperLiquidCancelOrder(input: $input) {
      signature {
        r
        s
        v
      }
      userId
    }
  }
`

export const signHyperLiquidCreateOrderMutation = gql`
  mutation signHyperLiquidCreateOrder($input: InputSignCreateOrderDTO!) {
    signHyperLiquidCreateOrder(input: $input) {
      signature {
        r
        s
        v
      }
      userId
    }
  }
`

export const approveCreateWalletMutation = gql`
  mutation approveCreateWallet($input: ApproveCreateWalletInput!) {
    approveCreateWallet(input: $input) {
      wallet {
        id
        chain
        walletAddress
        walletId
        walletAccountId
        hdPath
        name
      }
    }
  }
`
export const signHyperLiquidUpdateLeveragerMutation = gql`
  mutation signHyperLiquidUpdateLeverage($input: InputSignUpdateLeverageDTO!) {
    signHyperLiquidUpdateLeverage(input: $input) {
      signature {
        r
        s
        v
      }
      userId
    }
  }
`

export const updateEmbeddedWalletNameMutation = gql`
  mutation updateEmbeddedWalletName($input: UpdateEmbeddedWalletNameInputDTO!) {
    updateEmbeddedWalletName(input: $input) {
      id
      chain
      walletAddress
      walletId
      walletAccountId
      hdPath
      name
    }
  }
`
export const approveHyperLiquidApproveAgentMutation = gql`
  mutation approveHyperLiquidApproveAgent($input: InputSignApproveAgentDTO!) {
    approveHyperLiquidApproveAgent(input: $input) {
      signature {
        r
        s
        v
      }
      userId
    }
  }
`

export const approveHyperLiquidFeeBuilderMutation = gql`
  mutation approveHyperLiquidFeeBuilder($input: InputSignApproveFeeBuilderDTO!) {
    approveHyperLiquidFeeBuilder(input: $input) {
      signature {
        r
        s
        v
      }
      userId
    }
  }
`
export const approveWithdrawHyperLiquid = gql`
  mutation ApproveWithdrawHyperLiquid($input: ApproveDepositHyperLiquidInput!) {
    approveWithdrawHyperLiquid(input: $input) {
      signedTransaction
    }
  }
`

export const logoutWithTurnkey = async (indexedDBClient: TurnkeyIndexedDbClient | undefined, turnKeyUserId: string) => {
  try {
    if (!indexedDBClient) {
      return
    }
  
    const publicKey = await indexedDBClient.getPublicKey()
  
    if (!publicKey) {
      return
    }
  
    const {apiKeys} = await indexedDBClient.getApiKeys({
      userId: turnKeyUserId,
    })
  
    const currentApiKey = apiKeys.find((key) => key.credential.publicKey === publicKey && key.expirationSeconds)
    if (currentApiKey) {
      await indexedDBClient.deleteApiKeys({
        apiKeyIds: [currentApiKey.apiKeyId],
        userId: turnKeyUserId,
      })
    }
  } catch (error) {
    // prevent break main business logic
    console.error(error)
  }
}

export const VerifyBetaAccessCode = gql`
  mutation VerifyBetaAccessCode($input: VerifyBetaAccessCodeDTO!) {
    verifyBetaAccessCode(input: $input) {
      accessToken
      refreshToken
      userId
      referrerCode
      fingerprint
      subOrgId
      deletedAt
      userEmbeddedWallets {
        id
        chain
        walletAddress
        walletId
        walletAccountId
        hdPath
        name
        displayOrder
        balance
      }
    }
  }
`
