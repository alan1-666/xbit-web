/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config()
require('dotenv').config({ path: `.env.development` }) // .env.development will have lower priority than .env
import type { CodegenConfig } from '@graphql-codegen/cli'

const args = process.argv
const opt2 = { opt: args[4], value: args[5] }
let service = ''
if (opt2.opt === '--service') service = opt2.value

const willBeGeneratedServices = service
  ? [service] // do code gen for this service only
  : [
      'core',
      'meme2',
      'trading',
      'user',
      'future',
      'symbolDex',
      'wallet',
      'notification',
      'agentDex',
      'loyalty',
      'dexHyperTrader',
      'redpacket',
      'hypertrader',
      'prediction',
      'xpUser',
    ] // do code gen for all services
console.log('[codegen] willBeGeneratedServices: ', willBeGeneratedServices)
const mySelectiveConfig: Record<
  string,
  {
    config: any
  }
> = {
  core: {
    config: {
      schema: process.env.VITE_GRAPHQL_HTTP_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  meme2: {
    config: {
      schema: process.env.VITE_GRAPHQL_MEME2_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  trading: {
    config: {
      schema: process.env.VITE_GRAPHQL_TRADING_HTTP_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  user: {
    config: {
      schema: process.env.VITE_GRAPHQL_USER_HTTP_URL,
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  future: {
    config: {
      schema: process.env.VITE_GRAPHQL_FUTURE_HTTP_URL,
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  symbolDex: {
    config: {
      schema: process.env.VITE_GRAPHQL_HTTP_DEX_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  agentDex: {
    config: {
      schema: process.env.VITE_GRAPHQL_AGENT_HTTP_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  wallet: {
    config: {
      schema: process.env.VITE_GRAPHQL_WALLET_HTTP_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  notification: {
    config: {
      schema: process.env.VITE_GRAPHQL_NOTIFICATION_HTTP_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },

  loyalty: {
    config: {
      schema: process.env.VITE_APP_LOYALTY_HTTP_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  redpacket: {
    config: {
      schema: process.env.VITE_GRAPHQL_REDPACKET_HTTP_URL,
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  // preset: "client",
  dexHyperTrader: {
    config: {
      schema: process.env.VITE_GRAPHQL_DEX_HYPERTRADER_HTTP_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  hypertrader: {
    config: {
      schema: process.env.VITE_DEX_HYPERTRADER_GRAPHQL_URL,
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  admin: {
    config: {
      schema: process.env.VITE_GRAPHQL_ADMIN_HTTP_URL,
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  prediction: {
    config: {
      schema: process.env.VITE_GRAPHQL_PREDICTION_HTTP_URL,
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
  xpUser: {
    config: {
      schema: {
        [process.env.VITE_GRAPHQL_XP_USER_HTTP_URL]: {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTliZGFlYy02YjYwLTdlY2MtYTY5MC00OWE1MjdmYmRmYzgiLCJpc3MiOiJ4Yml0Iiwic2lkIjoiMDFLRkRFUzVSM05OSkgyOVdINjBLWjNHOFAiLCJwIjoiV2ViIiwiaWF0IjoxNzY4OTA0NDk2LCJleHAiOjE3Njg5OTA4OTZ9.bZjbeAk5tSnaw4KHfKUtkBxm4TQjZA8NkJD9ezb2mkk`,
          },
        },
      },
      // preset: "client",
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
      },
    },
  },
}

const codegen_yml_config: CodegenConfig = {
  overwrite: true,
  // documents: 'src/**/*.graphql',
  generates: {
    // "./graphql.schema.json": {
    //   plugins: ["introspection"],
    // },
  },
}

for (let i = 0, c = willBeGeneratedServices.length; i < c; i++) {
  const service = willBeGeneratedServices[i]
  const s = mySelectiveConfig[service]
  const outfile = `src/@generated/gql/graphql-${service}.ts`
  codegen_yml_config.generates[outfile] = s.config
}

console.log('[codegen] with the config: ', JSON.stringify(codegen_yml_config, null, 2))

export default codegen_yml_config
