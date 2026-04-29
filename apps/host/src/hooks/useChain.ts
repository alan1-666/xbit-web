import { ChainIds } from '@/types/enums'
import { BLOCKCHAIN_NAMES, BLOCKCHAIN_SHORTNAME, getBlockchainLogo2 } from '@/utils/helpers'


/**
 * 
 * @param activeChain
 * can be 'sol', 'eth', 'bsc', 'base', 'tron'
 * or chainId like 501424, 1, 56, 8453, 1000200
 * @returns 
 */
export const useChain = (activeChain: keyof typeof ChainIds | ChainIds) => {
  //check can be parse to number
  let chainId: string | number;
  if (isNaN(Number(activeChain))) {
    chainId = ChainIds[activeChain as keyof typeof ChainIds]
  }
  else{
    chainId = activeChain as ChainIds;
  }
  const chainLogo = getBlockchainLogo2(chainId as unknown as ChainIds)
  return {
    chainId,
    logo: chainLogo,
    name: BLOCKCHAIN_NAMES[chainId as unknown as ChainIds],
    shortName: BLOCKCHAIN_SHORTNAME[chainId as unknown as ChainIds],
  }
}
