import { useTranslation } from "react-i18next"

export enum BUTTON_TEXT_KEY {
  Default = 'Default',
  MinDeposit = 'MinDeposit',
  GasNotEnough = 'GasNotEnough',
  BalanceNotEnough = 'BalanceNotEnough',
  Transfering = 'Transfering',
}

export type ButtonTextKey = keyof typeof BUTTON_TEXT_KEY;

export const useMultiLanguageText = () => {
  const { t } = useTranslation()

  const BUTTON_TEXT = {
    [BUTTON_TEXT_KEY.Default]: t('assets.transfers.default'),
    [BUTTON_TEXT_KEY.MinDeposit]: t('assets.transfers.minDeposit'),
    [BUTTON_TEXT_KEY.GasNotEnough]: t('assets.transfers.gasNotEnough'),
    [BUTTON_TEXT_KEY.BalanceNotEnough]: t('assets.transfers.balanceNotEnough'),
    [BUTTON_TEXT_KEY.Transfering]: t('assets.transfers.transfering'),
  } as const;

  return {
    BUTTON_TEXT
  }
}