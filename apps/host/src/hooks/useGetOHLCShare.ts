import {useMemo, useRef} from "react";
import {useQuery} from "@apollo/client";
import {getOHLCShareQuery} from "@services/pairs.service.ts";
import {useActiveChain} from "@hooks/useActiveChain.ts";
import {getChainIdFromName} from "@/utils/chain.ts";
import {gqlMeme2} from "@/lib/gql/apollo-client.ts";

type UseGetOHLCShareArgs = { token: string };

export const useGetOHLCShare = ({ token }: UseGetOHLCShareArgs) => {
  const activeChain = useActiveChain();
  const chainId = getChainIdFromName(activeChain);

  // Freeze "now" per hook mount so it doesn't change on re-render
  const initialNowRef = useRef<number>(Date.now());

  // Stable variables object (changes only when token/chainId change)
  const variables = useMemo(() => ({
    input: {
      token,
      timeframe: "m15" as const,
      chainId,
      fromTimeStamp: initialNowRef.current, // <- stable
    },
  }), [token, chainId]);

  const skip = !token || !chainId; // avoid toggling on activeChain object identity

  return useQuery(getOHLCShareQuery, {
    client: gqlMeme2,
    variables,
    skip,
    // cache-friendly; avoids unexpected refetches
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
    returnPartialData: true,
  });
};
