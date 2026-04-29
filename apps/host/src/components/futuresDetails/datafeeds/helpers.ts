// Get a CryptoCompare API key CryptoCompare https://www.cryptocompare.com/coins/guides/how-to-use-our-api/
export const apiKey = 'daa8206fa58abe345cb7fe1a05e52aebe360ee21744f077f78ad87535278fea9'
// Makes requests to CryptoCompare API
export async function makeApiRequest(path: string) {
  try {
    const url = new URL(`https://min-api.cryptocompare.com/${path}`)
    url.searchParams.append('api_key', apiKey)
    const response = await fetch(url.toString())
    return response.json()
  } catch (error: any) {
    throw new Error(`CryptoCompare request error: ${error.status}`)
  }
}

// Generates a symbol ID from a pair of the coins
export function generateSymbol(exchange: string, fromSymbol: string, toSymbol: string) {
  const short = `${fromSymbol}/${toSymbol}`
  return {
    short,
    full: `${exchange}:${short}`,
  }
}

// Returns all parts of the symbol
export function parseFullSymbol(fullSymbol: string) {
  const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/)
  if (!match) {
    return null
  }

  return {
    exchange: match[1],
    fromSymbol: match[2],
    toSymbol: match[3],
  }
}

export async function getKlineHistoryList(params) {
  const headers = {
    'Content-Type': 'application/json',
    'language': 'en',           
    'Authorization': '',             
    'sign': 'wJA5XsTemUmiakZofktYZ8LGX5rLdaazSPEW61uQmY6eaq7DwijVHUqUGGx2', 
    'timestamp': Date.now().toString(),
    'source': 'aihqyc' 
};
  try {
    const url = new URL(`https://api.582btc.com/xhj-gather-app/open/coin/currencyHistory/page`)
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    })
    
    return response.json()
  } catch (error: any) {
  }
}
