import { useMutation } from '@tanstack/react-query'
import request from './request'
import { Configs } from '@/const/configs'
import { IUserFunding, IUserHistoricalOrder, PerpetualsMetaResponse } from '@/api/hyperliquid/types'
import { toast } from 'sonner'

export function getPerpetualsMetadata(): Promise<PerpetualsMetaResponse> {
  return request<PerpetualsMetaResponse>({
    url: '/info',
    method: 'post',
    data: {
      type: 'spotMeta',
    },
  })
}

export function getCandleSnapshot(data: any, signal?: AbortSignal) {
  const requestData = {
    req: data,
    type: 'candleSnapshot',
  }

  return request({
    url: Configs.getHypertraderInfoUrl(),
    method: 'post',
    data: requestData,
    // 透传 AbortSignal，用于切周期时取消在途请求
    signal,
  }).catch(() => {
    return request({
      url: Configs.hyperliquidInfoUrl,
      method: 'post',
      data: requestData,
      signal,
    })
  })
}

export function getPredictedFundings() {
  return request({
    url: '/info',
    method: 'post',
    data: {
      type: 'predictedFundings',
    },
  })
}

export function getUserAssests(user: string) {
  return request({
    url: '/info',
    method: 'post',
    data: {
      type: 'clearinghouseState',
      user: user,
    },
  })
}

export function getPerpMetadata() {
  return request({
    url: '/info',
    method: 'post',
    data: {
      type: 'meta',
    },
  })
}

export function getPerpMetaAndAssetCtxs() {
  return request({
    url: '/info',
    method: 'post',
    data: {
      type: 'metaAndAssetCtxs',
    },
  })
}



// Retrieve a user's funding history
export function getUserFunding() {
  return useMutation({
    mutationFn: (user: string) => {
      return request<IUserFunding[]>({
        url: '/info',
        method: 'post',
        data: {
          type: 'userFunding',
          user: user,
        },
      })
    },
    mutationKey: ['userFunding'],
    onError: (error) => {
      console.log('error', error)
      toast.error(error.message)
    },
  })
}

// Retrieve a user's historical orders
export function getUserHistoricalOrders() {
  return useMutation({
    mutationFn: (user: string) => {
      return request<IUserHistoricalOrder[]>({
        url: '/info',
        method: 'post',
        data: {
          type: 'historicalOrders',
          user: user,
        },
      })
    },
    mutationKey: ['userHistoricalOrders'],
    onError: (error) => {
      console.log('error', error)
      toast.error(error.message)
    },
  })
}

export function getPerpUserHistoryOrders(user: string) {
  return request({
    url: '/info',
    method: 'post',
    data: {
      "type": "historicalOrders",
      "user": user
    }
  });
}

export function getPerpUserFunding(user: string) {
  return request({
    url: '/info',
    method: 'post',
    data: {
      "type": "userFunding",
      "user": user
    }
  });
}

export function getPerpEntrustedHistory(user: string) {
  return request({
    url: '/info',
    method: 'post',
    data: {
      "aggregateByTime": true,
      "endTime": 2114352000000,
      "reversed": true,
      "startTime": 1732579200000,
      "type": "userFillsByTime",
      "user": user
    }
  });
}


export function getPerpUserHistoryTrades (user: string) {
  return request({
    url: '/info',
    method: "post",
    data: {
      "aggregateByTime": true,
      "type": "userFills",
      "user": user,
    }
  });

}

export function getClearinghouseState (user: string) {
  return request({
    url: '/info',
    method: "post",
    data: {
      "type": "clearinghouseState",
      "user": user
    }
  });

}

export function getUserReferralInfo (user: string) {
  return request({
    url: '/info',
    method: "post",
    data: {
      "type": "referral",
      "user": user
    }
  });

}

// Retrieve mids for all coins
export function getAllMids() {
  return useMutation({
    mutationFn: (specificDex?: string) => {
      return request<Record<string, string>>({
        url: '/info',
        method: 'post',
        data: {
          type: 'allMids',
          dex: specificDex,
        },
      })
    },
    mutationKey: ['userHistoricalOrders'],
    onError: (error) => {
      console.log('error', error)
      toast.error(error.message)
    },
  })
}


export function fetchOrderBookSnapshot(data: {
  type: string;
  coin: string;
  nSigFigs?: number | null;
  mantissa?: number | null;
}) {
  return request({
    url: '/info',
    method: 'post',
    data,
  });
}
export function getUserHistoryTradesByData (user: string,startTime: number,endTime: number) {
  return request({
    url: '/info',
    method: "post",
    data: {
      "aggregateByTime": true,
      "type": "userFillsByTime",
      "user": user,
      "startTime": startTime,
      "endTime": endTime

    }
  });

}
export function getUserAssestsHistory (user: string) {
  return request({
    url: '/info',
    method: "post",
    data: {
      "type": "userNonFundingLedgerUpdates",
      "user": user,
      "startTime":1577808000000,
    }
  });

}


export function getUserAssetPortfolio(user: string) {
  return request({
    url: '/info',
    method: "post",
    data: {
      "type": "portfolio",
      "user": user,
    }
  });

}

export function getUserFee(user: string) {
  return request({
    url: '/info',
    method: "post",
    data: {
      "type": "userFees",
      "user": user,
    }
  })
}

export function getActiveAssetData(user: string, coin: string) {
  return request({
    url: '/info',
    method: "post",
    data: {
      "type": "activeAssetData",
      "user": user,
      "coin": coin
    }
  });
}

export function getPortfolioData(user: string) {
  return request({
    url: '/info',
    method: "post",
    data: {
      "type": "portfolio",
      "user": user
    }
  });
}