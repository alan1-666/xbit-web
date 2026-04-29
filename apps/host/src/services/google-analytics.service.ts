declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

// Track events
export const logEvent = (action: string, params?: Record<string, string | number>): void => {
  const userSettings = JSON.parse(localStorage.getItem('persist:userSettings') || '{}')
  const userId = JSON.parse(userSettings?.userId)
  if (userId) {
    window.gtag?.('event', action, { ...params, user_id: userId })
  }
}

// Set single user property
export const setUserProperty = (name: string, value: string | number): void => {
  window.gtag?.('set', 'user_properties', { [name]: value })
}

// Set multiple user properties
export const setUserProperties = (properties: Record<string, string | number>): void => {
  window.gtag?.('set', 'user_properties', properties)
}

export interface GTMEvent {
  event: string
  [key: string]: any
}

export const pushDataLayer = (data: object): void => {
  if (typeof window.dataLayer !== 'undefined') {
    window.dataLayer.push(data)
  }
}

export const trackUserRegistered = (userId: string | null): void => {
  pushDataLayer({ event: 'user_registered', user_id: userId })
}

export const trackUserLoginedIn = (userId: string | null): void => {
  pushDataLayer({ event: 'user_login', user_id: userId })
}

export const trackUserLoggedOut = (): void => {
  pushDataLayer({ event: 'user_logout' })
}

export const logEvent2 = (action: string, params?: Record<string, string | number | boolean>): void => {
  const userSettings = JSON.parse(localStorage.getItem('persist:userSettings') || '{}')
  const userId = userSettings?.userId?.toString()
  if (userId) {
    pushDataLayer({
      event: action,
      ...params,
    })
  }
}

export const ACTIONS = {
  deposit_click: 'deposit_click',
  deposit_success: 'deposit_success',
  withdraw_click: 'withdraw_click',
  withdraw_success: 'withdraw_success',
  transfer_click: 'transfer_click',
  transfer_success: 'transfer_success',
  contract_market_order: 'contract_market_order',
  contract_limit_order: 'contract_limit_order',
  contract_close_all: 'contract_close_all',
  contract_close: 'contract_close',
  contract_adjust_leverage: 'contract_adjust_leverage',
  contract_switch_margin: 'contract_switch_margin',
  contract_set_sl_tp: 'contract_set_sl_tp',
  meme_buy: 'meme_buy',
  meme_sell: 'meme_sell',
  meme_copy_address: 'meme_copy_address',
  referral_copy_link: 'referral_copy_link',
  referral_agent_reward_click: 'referral_agent_reward_click',
  referral_invited_friends_click: 'referral_invited_friends_click',
  referral_invite_click: 'referral_invite_click',
  reward_task_click: 'reward_task_click',
  reward_task_complete: 'reward_task_complete',
  setting_change_color: 'setting_change_color',
  setting_change_language: 'setting_change_language',
  setting_backup_mnemonic: 'setting_backup_mnemonic',
}
