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
  Int64: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Time: { input: any; output: any; }
};

export enum Language {
  En = 'en',
  Hi = 'hi',
  Hk = 'hk',
  Vi = 'vi',
  Zh = 'zh'
}

export type LoyaltyLeaderboardResp = {
  __typename?: 'LoyaltyLeaderboardResp';
  leaderboard: Array<LoyaltyStatusResp>;
};

export type LoyaltyReq = {
  debug?: InputMaybe<Scalars['Boolean']['input']>;
  season?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type LoyaltyStatusDebug = {
  __typename?: 'LoyaltyStatusDebug';
  activityPoint: Scalars['Decimal']['output'];
  consecutiveActiveDay: Scalars['Int']['output'];
  referralLevel1Point: Scalars['Decimal']['output'];
  referralLevel2Point: Scalars['Decimal']['output'];
  totalSeasonPoint: Scalars['Decimal']['output'];
};

export type LoyaltyStatusResp = {
  __typename?: 'LoyaltyStatusResp';
  boost: Scalars['Float']['output'];
  currentRank: Scalars['Int']['output'];
  debug?: Maybe<LoyaltyStatusDebug>;
  fundPoint: Scalars['Decimal']['output'];
  name: Scalars['String']['output'];
  pointPercent: Scalars['Float']['output'];
  positionPoint: Scalars['Decimal']['output'];
  referralPoint: Scalars['Decimal']['output'];
  seasonBoost: Scalars['Float']['output'];
  totalPoint: Scalars['Decimal']['output'];
  tradingPoint: Scalars['Decimal']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAllSeason: SeasonListResp;
  getLoyaltyLeaderboard: LoyaltyLeaderboardResp;
  getLoyaltyStatus: LoyaltyStatusResp;
};


export type QueryGetAllSeasonArgs = {
  lang?: Language;
};


export type QueryGetLoyaltyLeaderboardArgs = {
  req: LoyaltyReq;
};


export type QueryGetLoyaltyStatusArgs = {
  req: LoyaltyReq;
};

export type SeasonInfo = {
  __typename?: 'SeasonInfo';
  description?: Maybe<Scalars['String']['output']>;
  endTime: Scalars['Time']['output'];
  name: Scalars['String']['output'];
  season: Scalars['Int']['output'];
  startTime: Scalars['Time']['output'];
  year: Scalars['Int']['output'];
};

export type SeasonListResp = {
  __typename?: 'SeasonListResp';
  seasons?: Maybe<Array<SeasonInfo>>;
};
