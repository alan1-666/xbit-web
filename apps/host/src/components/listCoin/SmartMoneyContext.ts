import createFastContext from "@/hooks/createFastContext";
import { loadFirstPageFromStorage } from "@/utils/storage";

// 'topTalents' | 'walletCopy' | 'smartMoney' | 'activities';
export enum SmartMoneyTab {
	TOP_TALENTS = 'topTalents',
	WALLET_COPY = 'walletCopy',
	SMART_MONEY = 'smartMoney',
	ACTIVITIES = 'activities',
	MONITORING = 'monitoring',
}

interface SmartMoneyContext {
	tab: SmartMoneyTab;
	isOpenDrawerCopyTrade: boolean;
	isEmptyWalletCopyTrade: boolean;
}

const initialState: SmartMoneyContext = {
	tab: loadFirstPageFromStorage('smartMoneyTab'),
	isOpenDrawerCopyTrade: false,
	isEmptyWalletCopyTrade: false,
}

const { FastContextProvider: SmartMoneyContextProvider, useFastContextFields: useSmartMoneyContextFields } = createFastContext<SmartMoneyContext>(initialState)

export { SmartMoneyContextProvider, useSmartMoneyContextFields }