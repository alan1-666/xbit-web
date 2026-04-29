import { Middleware } from "@reduxjs/toolkit";
import { clearProxyWalletCache } from '@/modules/prediction/hooks/useProxyWallet';
import { clearUSDCAllowanceCache } from '@/modules/prediction/hooks/useUSDCAllowance';
import { queryClient } from '@/lib/queryClient';
import { QUERY_KEYS_CONFIGS } from '@/modules/prediction/configs/queryKeys.configs';

export const logoutMiddleware: Middleware = (store) => (next) => (action: any) => {
  // list key remove sessionStorage on logout
  if (action.type == 'newAuth/logout' || action.type === 'newAuthActions/logout') {
    const list = [
      'smartMoneyList.walletCopyTrade'
    ];
    list.forEach(item => sessionStorage.removeItem(item));
    clearProxyWalletCache();
    clearUSDCAllowanceCache();
    queryClient.removeQueries({ queryKey: QUERY_KEYS_CONFIGS.polymarketProxyWallet() });
    queryClient.removeQueries({ queryKey: ['prediction', 'usdc-allowance'] });
  }
  return next(action);
};