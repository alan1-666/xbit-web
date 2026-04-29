import { Turnkey } from '@turnkey/sdk-browser'

const turnkey = new Turnkey({
  apiBaseUrl: 'https://api.turnkey.com',
  defaultOrganizationId: '53f24347-1a76-4dbd-a984-d2d6fb8c12b9', // From previous step
  // Set this to your domain for production
  rpId: 'localhost',
})

export const turnkeyClient = turnkey.passkeyClient()
