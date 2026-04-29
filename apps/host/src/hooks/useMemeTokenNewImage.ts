import { useEffect, useMemo, useState } from "react";
import { useSubscription } from "@/lib/mqtt";
import type { MemeTokenWithFormatted } from "@/types/token";

type TokenNewImage = {
  tokenAddress?: string;
  avatarUrl?: string;
  thumbnailUrl?: string;
};

type UseMemeTokenNewImageOptions = {
  /** Allow overriding the topic if you reuse this hook elsewhere */
  topic?: string;
};

function parseMessage(raw?: unknown): TokenNewImage[] {
  if (!raw) return [];
  try {
    let text: string;

    if (typeof raw === "string") {
      text = raw;
    } else if (raw instanceof Uint8Array) {
      text = new TextDecoder().decode(raw);
    } else {
      return [];
    }

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as TokenNewImage[];
    if (parsed && typeof parsed === "object") return [parsed as TokenNewImage];
    return [];
  } catch {
    return [];
  }
}

export default function useMemeTokenNewImage(
  data?: MemeTokenWithFormatted[],
  options?: UseMemeTokenNewImageOptions
) {
  const topic = options?.topic ?? "public/meme/token_image/#";
  const { message: mqttMessage } = useSubscription(topic);

  const [list, setList] = useState<MemeTokenWithFormatted[]>(() => data ?? []);

  // Keep local state in sync if caller replaces `data`
  useEffect(() => {
    if (data) setList(data);
  }, [data]);

  // Memoize parsed updates from MQTT
  const updates = useMemo<TokenNewImage[]>(() => {
    const raw = mqttMessage?.message;
    return parseMessage(raw);
  }, [mqttMessage]);

  useEffect(() => {
    if (!updates.length) return;

    // Build a lookup map: tokenAddress -> { avatarUrl, thumbnailUrl }
    const byToken = new Map<string, TokenNewImage>();
    for (const u of updates) {
      if (!u?.tokenAddress) continue;
      byToken.set(u.tokenAddress.toLowerCase(), u);
    }

    setList(prev => {
      if (!prev?.length) return prev;

      let changed = false;
      const next = prev.map(item => {
        const key = item?.token?.toLowerCase?.();
        if (!key) return item;

        const u = byToken.get(key);
        if (!u) return item;

        const merged: MemeTokenWithFormatted = {
          ...item,
          // Only overwrite if new value is defined
          avatarUrl: u.avatarUrl ?? item.avatarUrl,
          thumbnailUrl: u.thumbnailUrl ?? item.thumbnailUrl,
        };

        if (merged.avatarUrl !== item.avatarUrl || merged.thumbnailUrl !== item.thumbnailUrl) {
          changed = true;
        }
        return merged;
      });

      return changed ? next : prev; // avoid unnecessary re-render
    });
  }, [updates]);

  return list;
}
