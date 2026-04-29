import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  DecimalScalar: { input: any; output: any; }
};

export type ApproveCreateWalletInput = {
  activityId: Scalars['String']['input'];
  /** New wallet name, max length is 127 */
  name: Scalars['String']['input'];
};

export type ApproveDepositHyperLiquidInput = {
  /** Activity ID for the withdrawal request in Turnkey */
  activityId: Scalars['String']['input'];
  /** Number of USDC amount */
  amount: Scalars['Float']['input'];
  /** Wallet address of account that is used to withdraw */
  wallet: Scalars['String']['input'];
};

export type ApproveDepositHyperLiquidResponse = {
  __typename?: 'ApproveDepositHyperLiquidResponse';
  /** Signed transaction string */
  signedTransaction: Scalars['String']['output'];
};

export type ApprovedCreateWalletResponse = {
  __typename?: 'ApprovedCreateWalletResponse';
  wallet: UserEmbeddedWallet;
};

export type ApprovedPassphraseResponse = {
  __typename?: 'ApprovedPassphraseResponse';
  activityId: Scalars['String']['output'];
  passphrase: Scalars['String']['output'];
};

export type ApprovedPrivateKeyResponse = {
  __typename?: 'ApprovedPrivateKeyResponse';
  activityId: Scalars['String']['output'];
  privateKey: Scalars['String']['output'];
};

/** Supported provider for authentication */
export enum AuthChainType {
  ChainEvm = 'CHAIN_EVM',
  ChainSol = 'CHAIN_SOL',
  ChainTron = 'CHAIN_TRON'
}

/** Supported provider for authentication */
export enum AuthProvider {
  Apple = 'APPLE',
  ChainEvm = 'CHAIN_EVM',
  ChainSol = 'CHAIN_SOL',
  ChainTron = 'CHAIN_TRON',
  Email = 'EMAIL',
  Google = 'GOOGLE',
  Telegram = 'TELEGRAM'
}

export type BuilderInput = {
  b: Scalars['String']['input'];
  f: Scalars['Float']['input'];
};

export type CancelActionInput = {
  cancels: Array<CancelInput>;
  type: Scalars['String']['input'];
};

export type CancelInput = {
  a: Scalars['Int']['input'];
  o: Scalars['Float']['input'];
};

/** Supported blockchain types */
export enum ChainType {
  Arb = 'ARB',
  Bsc = 'BSC',
  Btc = 'BTC',
  Evm = 'EVM',
  Mon = 'MON',
  Solana = 'SOLANA',
  Tron = 'TRON'
}

export type CheckWeb3UserExistsResponse = {
  __typename?: 'CheckWeb3UserExistsResponse';
  /** Whether user exists for the given wallet address */
  exists: Scalars['Boolean']['output'];
  /** Session expire time in seconds */
  expirationSeconds?: Maybe<Scalars['String']['output']>;
  /** Sub organization ID associated with the user, if applicable */
  subOrgId?: Maybe<Scalars['String']['output']>;
};

export type CreateServiceExternalWalletInput = {
  chain: Scalars['String']['input'];
  provider: SupportedExternalWalletProvider;
};

export type ExportPassphraseInput = {
  activityId: Scalars['String']['input'];
  /** Is user login by OKX wallet */
  isOkxWallet?: InputMaybe<Scalars['Boolean']['input']>;
  /** Message was signed by user */
  message?: InputMaybe<Scalars['String']['input']>;
  /** OIDC token for user who is authenticated by Google */
  oidcToken?: InputMaybe<Scalars['String']['input']>;
  /** OTP code for user who is authenticated by email OTP */
  otpCode?: InputMaybe<Scalars['String']['input']>;
  /** OTP ID for user who is authenticated by email OTP */
  otpId?: InputMaybe<Scalars['String']['input']>;
  publicKey: Scalars['String']['input'];
  /** Signature of signing request if user login by 3rd wallet */
  signature?: InputMaybe<Scalars['String']['input']>;
};

export type ExportPrivateKeyInput = {
  activityId: Scalars['String']['input'];
  /** Is user login by OKX wallet */
  isOkxWallet?: InputMaybe<Scalars['Boolean']['input']>;
  /** Message was signed by user */
  message?: InputMaybe<Scalars['String']['input']>;
  /** OIDC token for user who is authenticated by Google */
  oidcToken?: InputMaybe<Scalars['String']['input']>;
  /** OTP code for user who is authenticated by email OTP */
  otpCode?: InputMaybe<Scalars['String']['input']>;
  /** OTP ID for user who is authenticated by email OTP */
  otpId?: InputMaybe<Scalars['String']['input']>;
  publicKey: Scalars['String']['input'];
  /** Signature of signing request if user login by 3rd wallet */
  signature?: InputMaybe<Scalars['String']['input']>;
};

export type ExportPrivateKeyWithoutVerifyInput = {
  activityId: Scalars['String']['input'];
  publicKey: Scalars['String']['input'];
};

export type GetGoogleSubOrgInputDto = {
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  idToken: Scalars['String']['input'];
  /** Client platform type */
  platform?: InputMaybe<Platform>;
  referrerCode?: InputMaybe<Scalars['String']['input']>;
  /** Target public key */
  targetPublicKey: Scalars['String']['input'];
};

export type GetWalletSubOrgInputDto = {
  chainType: ChainType;
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  /** Using okx wallet to signing */
  isOkxWallet?: Scalars['Boolean']['input'];
  /** Request signing message */
  message: Scalars['String']['input'];
  referrerCode?: InputMaybe<Scalars['String']['input']>;
  /** Signature of message */
  signature: Scalars['String']['input'];
};

export type InitEmailOtpInputDto = {
  /** Email address */
  email: Scalars['String']['input'];
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  referrerCode?: InputMaybe<Scalars['String']['input']>;
};

export type InitOtpAuthResponseDto = {
  __typename?: 'InitOtpAuthResponseDto';
  /** User email address */
  email?: Maybe<Scalars['String']['output']>;
  /** OTP ID for verification */
  otpId: Scalars['String']['output'];
  /** Sub-organization ID */
  subOrgId: Scalars['String']['output'];
  /** Lifetime of otp in seconds */
  ttl: Scalars['Float']['output'];
  /** User ID in the system */
  userId: Scalars['String']['output'];
};

export type InputLoginWalletV2Dto = {
  /** Session expire time in seconds */
  expirationSeconds: Scalars['String']['input'];
  /** Sub Organization ID */
  organizationId: Scalars['String']['input'];
  /** Client platform type */
  platform?: InputMaybe<Platform>;
  /** Public key to address Turnkey session */
  publicKey: Scalars['String']['input'];
  /** Stamp header name */
  stampHeaderName: Scalars['String']['input'];
  /** Stamp header value */
  stampHeaderValue: Scalars['String']['input'];
  /** Request timestamp in milliseconds */
  timestampMs: Scalars['String']['input'];
  /** URL for the API call */
  url: Scalars['String']['input'];
};

export type InputPerpetualStatusDto = {
  agentExpiredAt?: InputMaybe<Scalars['Float']['input']>;
  feeBuilderAddress: Scalars['String']['input'];
  feeBuilderPercent: Scalars['Float']['input'];
  referralCode: Scalars['String']['input'];
  setFeeBuilder: Scalars['Boolean']['input'];
  setReferral: Scalars['Boolean']['input'];
};

export type InputSignApproveAgentDto = {
  /** The ID of the activity that submitted to Turnkey from FE thru signRawPayload methods */
  activityId: Scalars['String']['input'];
  /** The address of the agent wallet that needs to approve. BE uses to validate transaction */
  agentAddress: Scalars['String']['input'];
  /** The name of the agent wallet that needs to approve. BE uses to validate transaction */
  agentName: Scalars['String']['input'];
  /** The nonce of transaction that was built from FE. BE uses to validate transaction */
  nonce: Scalars['Float']['input'];
};

/** Note that builder address needs to matched with config in BE */
export type InputSignApproveFeeBuilderDto = {
  /** The ID of the activity that submitted to Turnkey from FE thru signRawPayload methods */
  activityId: Scalars['String']['input'];
  /** The nonce of transaction that was built from FE. BE uses to validate transaction */
  nonce: Scalars['Float']['input'];
};

/** Note that referral code needs to matched with config in BE */
export type InputSignApproveReferralDto = {
  /** The ID of the activity that submitted to Turnkey from FE thru signRawPayload methods */
  activityId: Scalars['String']['input'];
  /** The nonce of transaction that was built from FE. BE uses to validate transaction */
  nonce: Scalars['Float']['input'];
};

export type InputSignCancelOrderDto = {
  action: CancelActionInput;
  nonce: Scalars['Float']['input'];
  vaultAddress?: InputMaybe<Scalars['String']['input']>;
};

export type InputSignCreateOrderDto = {
  action: OrderRequestInput;
  nonce: Scalars['Float']['input'];
  vaultAddress?: InputMaybe<Scalars['String']['input']>;
};

export type InputSignUpdateLeverageDto = {
  action: UpdateLeverageActionInput;
  nonce: Scalars['Float']['input'];
  vaultAddress?: InputMaybe<Scalars['String']['input']>;
};

export type LimitInput = {
  tif: Scalars['String']['input'];
};

export type LoginDto = {
  __typename?: 'LoginDTO';
  accessToken: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  fingerprint?: Maybe<Scalars['String']['output']>;
  referrerCode?: Maybe<Scalars['String']['output']>;
  refreshToken: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type LoginEmailOtpDto = {
  __typename?: 'LoginEmailOtpDTO';
  accessToken?: Maybe<Scalars['String']['output']>;
  /** Link to contact XBIT's customer support */
  contactLink: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  fingerprint?: Maybe<Scalars['String']['output']>;
  referrerCode?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  subOrgId: Scalars['String']['output'];
  turnKeyResponse: TurnKeyLogEmailOtpResponseDto;
  userEmbeddedWallets: Array<UserEmbeddedWalletDto>;
  userId: Scalars['String']['output'];
  /** If value is true, user need to verify invitation code to access site */
  verifyBetaAccess: Scalars['Boolean']['output'];
  /** Unique token used to verify beta access invitation code */
  verifyToken?: Maybe<Scalars['String']['output']>;
};

export type LoginGoogleDto = {
  __typename?: 'LoginGoogleDTO';
  accessToken?: Maybe<Scalars['String']['output']>;
  /** Link to contact XBIT's customer support */
  contactLink: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  fingerprint?: Maybe<Scalars['String']['output']>;
  referrerCode?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  subOrgId: Scalars['String']['output'];
  turnKeyResponse: TurnKeyCredentialResponseDto;
  userEmbeddedWallets: Array<UserEmbeddedWalletDto>;
  userId: Scalars['String']['output'];
  /** If value is true, user need to verify invitation code to access site */
  verifyBetaAccess: Scalars['Boolean']['output'];
  /** Unique token used to verify beta access invitation code */
  verifyToken?: Maybe<Scalars['String']['output']>;
};

export type LoginV2Dto = {
  __typename?: 'LoginV2DTO';
  accessToken?: Maybe<Scalars['String']['output']>;
  /** Link to contact XBIT's customer support */
  contactLink: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  fingerprint?: Maybe<Scalars['String']['output']>;
  referrerCode?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  subOrgId: Scalars['String']['output'];
  turnKeyResponse: Scalars['String']['output'];
  userEmbeddedWallets: Array<UserEmbeddedWalletDto>;
  userId: Scalars['String']['output'];
  /** If value is true, user need to verify invitation code to access site */
  verifyBetaAccess: Scalars['Boolean']['output'];
  /** Unique token used to verify beta access invitation code */
  verifyToken?: Maybe<Scalars['String']['output']>;
};

export type LoginWithEmailOtpInputDto = {
  /** Email address */
  email: Scalars['String']['input'];
  /** OTP code received by user */
  otpCode: Scalars['String']['input'];
  /** OTP ID from initialization */
  otpId: Scalars['String']['input'];
  /** Client platform type */
  platform?: InputMaybe<Platform>;
  /** Target public key for credential encryption */
  targetPublicKey: Scalars['String']['input'];
};

export type MarkAccountDeleteResponse = {
  __typename?: 'MarkAccountDeleteResponse';
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  success: Scalars['Boolean']['output'];
};

export type MarkedAsExportedPassphraseResponse = {
  __typename?: 'MarkedAsExportedPassphraseResponse';
  updated: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  approveCreateWallet: ApprovedCreateWalletResponse;
  approveExportPassphrase: ApprovedPassphraseResponse;
  approveExportPrivateKey: ApprovedPrivateKeyResponse;
  approveExportPrivateKeyWithoutVerify: ApprovedPrivateKeyResponse;
  approveHyperLiquidApproveAgent: SignatureDto;
  approveHyperLiquidFeeBuilder: SignatureDto;
  approveHyperLiquidReferral: SignatureDto;
  approveWithdrawHyperLiquid: ApproveDepositHyperLiquidResponse;
  checkHyperLiquidWallet: PerpetualStatusDto;
  checkRegisteredWallet: CheckWeb3UserExistsResponse;
  createServiceExternalWallet: ServiceExternalWalletDto;
  createWalletSubOrg: SubOrgResponseDto;
  createWalletSubOrgV2: SubOrgResponseDto;
  disable2FA: Scalars['Boolean']['output'];
  getAccessToken: RefreshAccessTokenDto;
  initEmailOtp: InitOtpAuthResponseDto;
  loginByTelegram: LoginDto;
  loginByWallet: LoginDto;
  loginByWalletV2: LoginV2Dto;
  loginWithApple: LoginGoogleDto;
  loginWithEmailOtp: LoginEmailOtpDto;
  loginWithEmailOtpV2: LoginEmailOtpDto;
  loginWithGoogle: LoginGoogleDto;
  loginWithGoogleV2: LoginGoogleDto;
  markAccountDelete: MarkAccountDeleteResponse;
  markedAsExportedPassphrase: MarkedAsExportedPassphraseResponse;
  migrateTurnkeyUserVersion: TurnkeyResultResponse;
  reactivateAccount: ReactivateAccountResponse;
  requestReverifyOtp: InitOtpAuthResponseDto;
  reverifyUserAuthentication: TurnkeyResultResponse;
  signHyperLiquidCancelOrder: SignedCancelOrderDto;
  signHyperLiquidCreateOrder: SignedCreateOrderDto;
  signHyperLiquidUpdateLeverage: SignedCancelOrderDto;
  updateEmbeddedWalletName: UserEmbeddedWallet;
  updateHyperLiquidWallet: PerpetualStatusDto;
  updatePreference: Scalars['Boolean']['output'];
  updateWalletOrder: UpdateWalletOrderResponseDto;
  verifyBetaAccessCode: VerifyBetaAccessCodeResponse;
};


export type MutationApproveCreateWalletArgs = {
  input: ApproveCreateWalletInput;
};


export type MutationApproveExportPassphraseArgs = {
  input: ExportPassphraseInput;
};


export type MutationApproveExportPrivateKeyArgs = {
  input: ExportPrivateKeyInput;
};


export type MutationApproveExportPrivateKeyWithoutVerifyArgs = {
  input: ExportPrivateKeyWithoutVerifyInput;
};


export type MutationApproveHyperLiquidApproveAgentArgs = {
  input: InputSignApproveAgentDto;
};


export type MutationApproveHyperLiquidFeeBuilderArgs = {
  input: InputSignApproveFeeBuilderDto;
};


export type MutationApproveHyperLiquidReferralArgs = {
  input: InputSignApproveReferralDto;
};


export type MutationApproveWithdrawHyperLiquidArgs = {
  input: ApproveDepositHyperLiquidInput;
};


export type MutationCheckRegisteredWalletArgs = {
  chainType: AuthChainType;
  walletAddress: Scalars['String']['input'];
};


export type MutationCreateServiceExternalWalletArgs = {
  input: CreateServiceExternalWalletInput;
};


export type MutationCreateWalletSubOrgArgs = {
  input: GetWalletSubOrgInputDto;
};


export type MutationCreateWalletSubOrgV2Args = {
  input: GetWalletSubOrgInputDto;
};


export type MutationDisable2FaArgs = {
  otpCode: Scalars['String']['input'];
};


export type MutationGetAccessTokenArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationInitEmailOtpArgs = {
  input: InitEmailOtpInputDto;
};


export type MutationLoginByTelegramArgs = {
  code: Scalars['String']['input'];
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  referrerCode?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationLoginByWalletArgs = {
  chainType: ChainType;
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  isOkxWallet?: Scalars['Boolean']['input'];
  message: Scalars['String']['input'];
  platform?: InputMaybe<Platform>;
  referrerCode?: InputMaybe<Scalars['String']['input']>;
  signature: Scalars['String']['input'];
};


export type MutationLoginByWalletV2Args = {
  input: InputLoginWalletV2Dto;
};


export type MutationLoginWithAppleArgs = {
  input: GetGoogleSubOrgInputDto;
};


export type MutationLoginWithEmailOtpArgs = {
  input: LoginWithEmailOtpInputDto;
};


export type MutationLoginWithEmailOtpV2Args = {
  input: LoginWithEmailOtpInputDto;
};


export type MutationLoginWithGoogleArgs = {
  input: GetGoogleSubOrgInputDto;
};


export type MutationLoginWithGoogleV2Args = {
  input: GetGoogleSubOrgInputDto;
};


export type MutationRequestReverifyOtpArgs = {
  input: RequestReverifyOtpInputDto;
};


export type MutationReverifyUserAuthenticationArgs = {
  input: ReverifyUserAuthenticationDto;
};


export type MutationSignHyperLiquidCancelOrderArgs = {
  input: InputSignCancelOrderDto;
};


export type MutationSignHyperLiquidCreateOrderArgs = {
  input: InputSignCreateOrderDto;
};


export type MutationSignHyperLiquidUpdateLeverageArgs = {
  input: InputSignUpdateLeverageDto;
};


export type MutationUpdateEmbeddedWalletNameArgs = {
  input: UpdateEmbeddedWalletNameInputDto;
};


export type MutationUpdateHyperLiquidWalletArgs = {
  input: InputPerpetualStatusDto;
};


export type MutationUpdatePreferenceArgs = {
  input: UpdatePreferenceInput;
};


export type MutationUpdateWalletOrderArgs = {
  input: UpdateWalletOrderInputDto;
};


export type MutationVerifyBetaAccessCodeArgs = {
  input: VerifyBetaAccessCodeDto;
};

export type NotificationType = {
  __typename?: 'NotificationType';
  categoryCode: Scalars['String']['output'];
  categoryName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Notification type category code */
export enum NotificationTypeCategoryCode {
  CopyTrade = 'CopyTrade',
  FuturesSignal = 'FuturesSignal',
  Others = 'Others',
  PriceChange = 'PriceChange',
  SmartMoneyActivity = 'SmartMoneyActivity'
}

export type OrderInput = {
  a: Scalars['Float']['input'];
  b: Scalars['Boolean']['input'];
  c?: InputMaybe<Scalars['String']['input']>;
  p: Scalars['String']['input'];
  r: Scalars['Boolean']['input'];
  s: Scalars['String']['input'];
  t: OrderTypeInput;
};

export type OrderRequestInput = {
  builder?: InputMaybe<BuilderInput>;
  grouping?: InputMaybe<Scalars['String']['input']>;
  orders: Array<OrderInput>;
  type: Scalars['String']['input'];
};

export type OrderTypeInput = {
  limit?: InputMaybe<LimitInput>;
  trigger?: InputMaybe<TriggerInput>;
};

export type PerpetualStatusDto = {
  __typename?: 'PerpetualStatusDTO';
  agent?: Maybe<Scalars['String']['output']>;
  agentName: Scalars['String']['output'];
  approvedAgent: Scalars['Boolean']['output'];
  feeBuilderAddress: Scalars['String']['output'];
  feeBuilderPercent: Scalars['Float']['output'];
  referralCode: Scalars['String']['output'];
  setFeeBuilder: Scalars['Boolean']['output'];
  setReferral: Scalars['Boolean']['output'];
};

/** Client platform types */
export enum Platform {
  H5 = 'H5',
  Mobile = 'MOBILE',
  Web = 'WEB'
}

export type Query = {
  __typename?: 'Query';
  account: User;
  getNonce: Scalars['String']['output'];
  setupNew2FA: SetupNew2FaResponse;
  userSettings: UserSettingsDto;
  verify2FA: Scalars['Boolean']['output'];
  verifyTOTP: Scalars['Boolean']['output'];
};


export type QueryGetNonceArgs = {
  wallAddress: Scalars['String']['input'];
};


export type QueryVerify2FaArgs = {
  code: Scalars['String']['input'];
};


export type QueryVerifyTotpArgs = {
  code: Scalars['String']['input'];
};

export type ReactivateAccountResponse = {
  __typename?: 'ReactivateAccountResponse';
  reactivatedAt: Scalars['DateTime']['output'];
  success: Scalars['Boolean']['output'];
};

export type RefreshAccessTokenDto = {
  __typename?: 'RefreshAccessTokenDTO';
  accessToken: Scalars['String']['output'];
};

export type RequestReverifyOtpInputDto = {
  fingerprint?: InputMaybe<Scalars['String']['input']>;
};

export type ReverifyUserAuthenticationDto = {
  /** Is user login by OKX wallet */
  isOkxWallet?: InputMaybe<Scalars['Boolean']['input']>;
  /** Message was signed by user */
  message?: InputMaybe<Scalars['String']['input']>;
  /** OIDC token for user authenticated by Google */
  oidcToken?: InputMaybe<Scalars['String']['input']>;
  /** OTP code for user authenticated by email OTP */
  otpCode?: InputMaybe<Scalars['String']['input']>;
  /** OTP ID for user authenticated by email OTP */
  otpId?: InputMaybe<Scalars['String']['input']>;
  /** Signature of signing request if user login by 3rd wallet */
  signature?: InputMaybe<Scalars['String']['input']>;
};

export type ServiceExternalWalletDto = {
  __typename?: 'ServiceExternalWalletDTO';
  chain: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
};

export type SetupNew2FaResponse = {
  __typename?: 'SetupNew2FAResponse';
  recoveryCodes: Array<Scalars['String']['output']>;
  secretCode: Scalars['String']['output'];
  uri: Scalars['String']['output'];
};

/** Signature of Hyperliquid transaction that uses to submit to Hyperliquid API */
export type SignatureDto = {
  __typename?: 'SignatureDTO';
  signature: SignatureType;
  userId: Scalars['String']['output'];
};

export type SignatureType = {
  __typename?: 'SignatureType';
  r: Scalars['String']['output'];
  s: Scalars['String']['output'];
  v: Scalars['Int']['output'];
};

export type SignedCancelOrderDto = {
  __typename?: 'SignedCancelOrderDTO';
  signature: SignatureType;
  userId: Scalars['String']['output'];
};

export type SignedCreateOrderDto = {
  __typename?: 'SignedCreateOrderDTO';
  signature: SignatureType;
  userId: Scalars['String']['output'];
};

export type SubOrgResponseDto = {
  __typename?: 'SubOrgResponseDTO';
  /** Turnkey session expiration in seconds */
  sessionExpiresIn?: Maybe<Scalars['String']['output']>;
  subOrgId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

/** Supported external wallet providers */
export enum SupportedExternalWalletProvider {
  Polymarket = 'POLYMARKET'
}

export type TriggerInput = {
  isMarket: Scalars['Boolean']['input'];
  tpsl: Scalars['String']['input'];
  triggerPx: Scalars['String']['input'];
};

export type TurnKeyCredentialResponseDto = {
  __typename?: 'TurnKeyCredentialResponseDto';
  session: Scalars['String']['output'];
};

export type TurnKeyLogEmailOtpResponseDto = {
  __typename?: 'TurnKeyLogEmailOtpResponseDto';
  session: Scalars['String']['output'];
};

export type TurnkeyResultResponse = {
  __typename?: 'TurnkeyResultResponse';
  result: Scalars['Boolean']['output'];
};

/** User account version */
export enum TurnkeyVersion {
  V1 = 'V1',
  V2 = 'V2'
}

export type TwoFactorDto = {
  __typename?: 'TwoFactorDTO';
  isEnabled: Scalars['Boolean']['output'];
  userId: Scalars['String']['output'];
};

export type UpdateEmbeddedWalletNameInputDto = {
  /** User Embedded Wallet ID */
  id: Scalars['String']['input'];
  /** New wallet name */
  name: Scalars['String']['input'];
};

export type UpdateLeverageActionInput = {
  asset: Scalars['Int']['input'];
  isCross: Scalars['Boolean']['input'];
  leverage: Scalars['Int']['input'];
  type: Scalars['String']['input'];
};

export type UpdatePreferenceInput = {
  isEnabled: Scalars['Boolean']['input'];
  notificationTypeCode: NotificationTypeCategoryCode;
};

export type UpdateWalletOrderInputDto = {
  /** List of wallet IDs with their new display orders */
  wallets: Array<WalletOrderItem>;
};

export type UpdateWalletOrderResponseDto = {
  __typename?: 'UpdateWalletOrderResponseDTO';
  /** Success or error message */
  message: Scalars['String']['output'];
  /** Whether the update was successful */
  success: Scalars['Boolean']['output'];
  /** Number of wallets updated */
  updatedCount: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  authProvider: AuthProvider;
  avatar?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  googleId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isExportedWallet: Scalars['Boolean']['output'];
  isFirstLogin: Scalars['Boolean']['output'];
  /** Turnkey organization id */
  subOrgId?: Maybe<Scalars['String']['output']>;
  /** Turnkey user ID */
  turnkeyRootUserId?: Maybe<Scalars['String']['output']>;
  turnkeyVersion: TurnkeyVersion;
  userEmbeddedWallets: Array<UserEmbeddedWalletDto>;
  userManagedWallets: Array<UserManagedWalletDto>;
  walletAddress?: Maybe<Scalars['String']['output']>;
};

export type UserEmbeddedWallet = {
  __typename?: 'UserEmbeddedWallet';
  chain: ChainType;
  displayOrder?: Maybe<Scalars['Int']['output']>;
  hdPath: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  walletAccountId: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
  walletId: Scalars['String']['output'];
};

export type UserEmbeddedWalletDto = {
  __typename?: 'UserEmbeddedWalletDTO';
  balance: Scalars['Float']['output'];
  chain: ChainType;
  displayOrder?: Maybe<Scalars['Int']['output']>;
  hdPath: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  walletAccountId: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
  walletId: Scalars['String']['output'];
};

export type UserManagedWalletDto = {
  __typename?: 'UserManagedWalletDTO';
  balance: Scalars['Float']['output'];
  chain: ChainType;
  displayOrder?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  walletAddress: Scalars['String']['output'];
};

export type UserNotificationPreferenceDto = {
  __typename?: 'UserNotificationPreferenceDTO';
  channel: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isEnabled: Scalars['Boolean']['output'];
  notificationTypeCode: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type UserSettingsDto = {
  __typename?: 'UserSettingsDTO';
  googleAuthenticator?: Maybe<TwoFactorDto>;
  id: Scalars['String']['output'];
  notificationPreferences: Array<UserNotificationPreferenceDto>;
  withdrawalWhitelistAddresses: Array<UserWithdrawalWhitelistAddressDto>;
};

export type UserWithdrawalWhitelistAddressDto = {
  __typename?: 'UserWithdrawalWhitelistAddressDTO';
  address: Scalars['String']['output'];
  id: Scalars['String']['output'];
  nickname?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type VerifyBetaAccessCodeDto = {
  code?: InputMaybe<Scalars['String']['input']>;
  verifyToken?: InputMaybe<Scalars['String']['input']>;
};

export type VerifyBetaAccessCodeResponse = {
  __typename?: 'VerifyBetaAccessCodeResponse';
  accessToken?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  fingerprint?: Maybe<Scalars['String']['output']>;
  referrerCode?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  subOrgId: Scalars['String']['output'];
  userEmbeddedWallets: Array<UserEmbeddedWalletDto>;
  userId: Scalars['String']['output'];
};

export type WalletOrderItem = {
  /** Display order (0-based index) */
  displayOrder: Scalars['Int']['input'];
  /** Wallet ID */
  id: Scalars['String']['input'];
  /** Wallet type (EMBEDDED or MANAGED) */
  type: Scalars['String']['input'];
};
