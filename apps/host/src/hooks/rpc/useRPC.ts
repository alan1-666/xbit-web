import { useEffect, useRef, useState } from 'react'
import { Configs } from '@/const/configs'
import { ServiceConfig } from '@/lib/gql/service-config'
import { useAppSelector } from '@/redux/store'

interface AccountUpdate {
  context: {
    slot: number
  }
  value: any
}


const getTokenAccounts = async (address: string, chain: string) => {
  if (!address) return null
  const res = await fetch(`${Configs.rpcProxyUrl}?chain=${chain}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ServiceConfig.token}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: '1',
      method: 'getTokenAccounts',
      params: {
        owner: address,
        options: { showZeroBalance: false },
        page: 1,
        limit: 1000,
      },
    }),
  })
  if (!res.ok) {
    console.error('Failed to fetch token accounts:', res.statusText)
    return null
  }
  return res
}

const convertArrayToMintAmountMap = (data: any) => {
  const result: { [mint: string]: number } = {}
  data.forEach((item: { mint: string; amount: number }) => {
    result[item.mint] = item.amount
  })
  return result
}

export const useHoldings = (address: string, chain: string) => {
  const [accountData, setAccountData] = useState<AccountUpdate | null>(null)
  const [output, setOutput] = useState<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const { apiKey } = useAppSelector((state) => state.apiKey)

  useEffect(() => {
    if (!address || !apiKey) return

    const ws = new WebSocket(`${Configs.rpcSocketUrl}?chain=${chain}&api-key=${apiKey}`)
    wsRef.current = ws

    ws.onopen = () => {
      const message = {
        jsonrpc: '2.0',
        id: 1,
        method: 'accountSubscribe',
        params: [
          address,
          {
            encoding: 'jsonParsed',
            commitment: 'confirmed',
          },
        ],
      }

      ws.send(JSON.stringify(message))
      setInterval(() => ws.send(JSON.stringify(message)), 600000) // Resubscribe every 10 minutes, keep the connection alive
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data?.method === 'accountNotification') {
        setAccountData(data.params.result)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }, [address, apiKey])

  useEffect(() => {
    if (accountData) {
      getTokenAccounts(address, chain)
        .then((res) => res?.json())
        .then((data) => {
          setOutput(data?.result?.token_accounts || [])
        })
        .catch((error) => console.error('Error fetching token accounts:', error))
    }
  }, [accountData, address, chain])

  return convertArrayToMintAmountMap(output)
}

export const useAccountSubscribe = (address: string, chain: string) => {
  const [accountData, setAccountData] = useState<AccountUpdate | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const { apiKey } = useAppSelector((state) => state.apiKey)

  useEffect(() => {
    if (!address || !apiKey) return

    const ws = new WebSocket(`${Configs.rpcSocketUrl}?chain=${chain}&api-key=${apiKey}`)
    wsRef.current = ws

    ws.onopen = () => {
      const message = {
        jsonrpc: '2.0',
        id: 1,
        method: 'accountSubscribe',
        params: [
          address,
          {
            encoding: 'jsonParsed',
            commitment: 'confirmed',
          },
        ],
      }

      ws.send(JSON.stringify(message))
      setInterval(() => ws.send(JSON.stringify(message)), 600000) // Resubscribe every 10 minutes, keep the connection alive
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data?.method === 'accountNotification') {
        setAccountData(data.params.result)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }, [address, apiKey])

  return accountData
}
