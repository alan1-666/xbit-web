import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type ListItem = { user_address: string; roi: number; /* ... */ }
type ApiResp = { data: ListItem[] };

export function useSmartList(kind: 'smart'|'kol'|'whale', enabled: boolean) {
  return useQuery({
    queryKey: ['smart-list', kind],
    queryFn: async () => {
      const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
      const urlMap = {
        smart: `${base}/v1/smart-money/latest?limit=50`,
        kol:   `${base}/v1/kol/latest?limit=50`,
        whale: `${base}/v1/whale/latest?limit=50`,
      } as const;
      const { data } = await axios.get<ApiResp>(urlMap[kind]);
      return data.data;
    },
    enabled,               // 只有被激活时才首拉
    staleTime: Infinity, 
    cacheTime: 30 * 60 * 1000,
  });
}
