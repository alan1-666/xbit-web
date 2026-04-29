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
  Decimal: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Time: { input: any; output: any; }
};

export type DeviceToken = {
  __typename?: 'DeviceToken';
  appVersion?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Time']['output'];
  deviceName?: Maybe<Scalars['String']['output']>;
  fingerprint: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  languageCode?: Maybe<Scalars['String']['output']>;
  lastRegisteredAt: Scalars['Time']['output'];
  /** The OneSignal subscription ID (only for OneSignal provider) */
  onesignalSubscriptionId?: Maybe<Scalars['String']['output']>;
  platform: Platform;
  provider: Provider;
  token: Scalars['String']['output'];
  updatedAt: Scalars['Time']['output'];
  userId: Scalars['ID']['output'];
};

/**
 * Input for getting active device token by either device token or fingerprint.
 * At least one of deviceToken or fingerprint must be provided.
 */
export type GetActiveDeviceTokenInput = {
  /** The device token string */
  deviceToken?: InputMaybe<Scalars['String']['input']>;
  /** The device fingerprint */
  fingerprint?: InputMaybe<Scalars['String']['input']>;
};

export type ListNotificationInput = {
  /** Include pending notifications in the result. Default: `false` */
  includePending?: InputMaybe<Scalars['Boolean']['input']>;
  /** language code of the notification. Default: `en` */
  languageCode?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  read?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<NotificationType>;
};

export type ListPreferenceInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type ModifyUserEntitySubscriptionInput = {
  add: Array<UserEntitySubscriptionAdd>;
  remove: Array<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  countUnreadNotification: Scalars['Int']['output'];
  modifyUserEntitySubscription: Scalars['String']['output'];
  readNotification: Scalars['String']['output'];
  registerDeviceToken: Scalars['String']['output'];
  toggleUnreadCountNotification: Scalars['String']['output'];
  unregisterDeviceToken: Scalars['String']['output'];
};


export type MutationModifyUserEntitySubscriptionArgs = {
  input: ModifyUserEntitySubscriptionInput;
};


export type MutationReadNotificationArgs = {
  id: Scalars['String']['input'];
};


export type MutationRegisterDeviceTokenArgs = {
  input: RegisterDeviceTokenInput;
};


export type MutationToggleUnreadCountNotificationArgs = {
  flag: Scalars['Boolean']['input'];
};


export type MutationUnregisterDeviceTokenArgs = {
  input: UnregisterDeviceTokenInput;
};

export type Notification = {
  __typename?: 'Notification';
  avatar?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Time']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** @deprecated Will be removed in the future */
  metadata: Scalars['JSON']['output'];
  read: Scalars['Boolean']['output'];
  sendAt: Scalars['Time']['output'];
  status: NotificationStatus;
  title: Scalars['String']['output'];
  type: NotificationType;
};

export enum NotificationStatus {
  Delivered = 'Delivered',
  Failed = 'Failed',
  Pending = 'Pending',
  Read = 'Read',
  Sent = 'Sent'
}

export enum NotificationType {
  CopyTrade = 'CopyTrade',
  Others = 'Others',
  SmartMoney = 'SmartMoney',
  SmartMoneyActivity = 'SmartMoneyActivity'
}

export enum Platform {
  Android = 'ANDROID',
  Ios = 'IOS',
  Web = 'WEB'
}

export type Preference = {
  __typename?: 'Preference';
  enabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  type: PreferenceType;
};

export enum PreferenceType {
  FuturesSignal = 'FuturesSignal',
  SmartMoney = 'SmartMoney',
  TokenPrice = 'TokenPrice'
}

export enum Provider {
  Fcm = 'FCM',
  OneSignal = 'OneSignal'
}

export type Query = {
  __typename?: 'Query';
  ListNotification: Array<Notification>;
  /**
   * Get active device token by either device token or fingerprint.
   * At least one of deviceToken or fingerprint must be provided in the input.
   */
  getActiveDeviceToken?: Maybe<DeviceToken>;
  getUnreadNotificationCount: Scalars['Int']['output'];
  getUserEntitySubscription: UserEntitySubscription;
};


export type QueryListNotificationArgs = {
  input: ListNotificationInput;
};


export type QueryGetActiveDeviceTokenArgs = {
  input: GetActiveDeviceTokenInput;
};


export type QueryGetUserEntitySubscriptionArgs = {
  entityType: Scalars['String']['input'];
  identifier: Scalars['String']['input'];
};

export type RegisterDeviceTokenInput = {
  appVersion: Scalars['String']['input'];
  deviceName: Scalars['String']['input'];
  fingerprint: Scalars['String']['input'];
  languageCode: Scalars['String']['input'];
  /** Required when provider = OneSignal */
  onesignalSubscriptionId?: InputMaybe<Scalars['String']['input']>;
  platform: Platform;
  provider: Provider;
  token: Scalars['String']['input'];
};

/**
 * Input for unregistering a device token.
 * Either fingerprint or token must be provided to identify the device token to unregister.
 */
export type UnregisterDeviceTokenInput = {
  /** The device fingerprint to unregister */
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  /** The device token to unregister (optional if fingerprint is provided) */
  token?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePreferenceInput = {
  enabled: Scalars['Boolean']['input'];
  type: PreferenceType;
};

export type UserEntitySubscription = {
  __typename?: 'UserEntitySubscription';
  id: Scalars['ID']['output'];
  identifier: Scalars['String']['output'];
  isEnable: Scalars['Boolean']['output'];
  type: UserEntitySubscriptionType;
};

export type UserEntitySubscriptionAdd = {
  identifier: Scalars['String']['input'];
  type: UserEntitySubscriptionType;
};

export enum UserEntitySubscriptionType {
  Token = 'Token',
  Wallet = 'Wallet'
}
