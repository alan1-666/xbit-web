import { ConfigBuyType, ConfigPlatform, ConfigSellType } from '@/@generated/gql/graphql-trading'
import { ChainIds } from '@/types/enums'
import { isCorrectWalletAddress } from '@/utils/solana'
import { z } from 'zod'

// Validations

// Schema for batch rule
export const tpslConfigChema = z.object({
  value: z.union([z.string(), z.number()]).optional(),
  sellRate: z.union([z.string(), z.number()]).optional(),
})

// Main schema for the form
export const getWalletSettingsSchema = (chainId: ChainIds) =>
  z
    .object({
      leaderAddress: z
        .string({
          required_error: 'required',
        })
        .superRefine((val, ctx) => {
          if (!isCorrectWalletAddress(val, chainId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'walletCopy.settings.invalidAddress',
            })
            return false
          }
          return true
        }),
      buyType: z.enum([ConfigBuyType.MaxAmount, ConfigBuyType.FixedAmount]),
      configAmount: z.string().optional(),
      sellType: z.enum([ConfigSellType.Auto, ConfigSellType.NoCopy, 'custom']),
      customSellType: z.enum([ConfigSellType.MultiTpsl, ConfigSellType.SingleTpsl]),
      tp: z.union([z.string(), z.number()]).optional(),
      sl: z.union([z.string(), z.number()]).optional(),
      trailingSl: z.boolean().optional(),
      tpslConfig: z.array(tpslConfigChema).optional(),
      minMarketCap: z
        .union([z.string(), z.number()])
        .optional()
        .superRefine((val, ctx) => {
          if (val !== undefined && val !== null && val !== '') {
            const numVal = Number(val)
            if (isNaN(numVal) || numVal <= 0 || !Number.isInteger(numVal)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'positiveIntegers',
              })
            }
          }
        }),
      maxMarketCap: z
        .union([z.string(), z.number()])
        .optional()
        .superRefine((val, ctx) => {
          if (val !== undefined && val !== null && val !== '') {
            const numVal = Number(val)
            if (isNaN(numVal) || numVal <= 0 || !Number.isInteger(numVal)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'positiveIntegers',
              })
            }
          }
        }),
      minLiquidity: z
        .union([z.string(), z.number()])
        .optional()
        .superRefine((val, ctx) => {
          if (val !== undefined && val !== null && val !== '') {
            const numVal = Number(val)
            if (isNaN(numVal) || numVal <= 0 || !Number.isInteger(numVal)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'positiveIntegers',
              })
            }
          }
        }),
      maxLiquidity: z
        .union([z.string(), z.number()])
        .optional()
        .superRefine((val, ctx) => {
          if (val !== undefined && val !== null && val !== '') {
            const numVal = Number(val)
            if (isNaN(numVal) || numVal <= 0 || !Number.isInteger(numVal)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'positiveIntegers',
              })
            }
          }
        }),
      minAmount: z.union([z.string(), z.number()]).optional(),
      maxAmount: z.union([z.string(), z.number()]).optional(),
      minCreationTimeInt: z.union([z.string(), z.number()]).optional(),
      maxCreationTimeInt: z.union([z.string(), z.number()]).optional(),
      minBurnLiquidity: z.union([z.string(), z.number()]).optional(),
      minBurnPool: z.union([z.string(), z.number()]).optional(),
      maxPurchasePerToken: z.union([z.string(), z.number()]).optional(),
      platform: z.array(
        z.enum([ConfigPlatform.Moonshot, ConfigPlatform.Others, ConfigPlatform.Pump, ConfigPlatform.Raydium]),
      ),
      blacklistTokens: z
        .array(
          z.object({
            id: z.string().optional(),
            address: z.string().optional(),
            disabled: z.boolean().optional(),
          }),
        )
        .optional(),
      // .refine((val) => Object.values(val).some(Boolean), { message: 'At least one platform must be selected' }),
      // blacklistTokens: z.array(
      //   z.object({
      //     id: z.number(),
      //     address: z.string(),
      //   }),
      // ),
    })
    .superRefine((data, ctx) => {
      // if (data.buyType === ConfigBuyType.FixedAmount) {
      if (!data.configAmount || data.configAmount.toString().trim() === '') {
        ctx.addIssue({
          path: ['configAmount'],
          code: z.ZodIssueCode.custom,
          message: 'required',
        })
      }
      // }
      if (data.configAmount && parseFloat(data.configAmount) <= 0) {
        ctx.addIssue({
          path: ['configAmount'],
          code: z.ZodIssueCode.custom,
          message: 'greaterThan0',
        })
      }
      if (data.sellType === 'custom' && data.customSellType === ConfigSellType.SingleTpsl) {
        // ✅ Validate tp và sl
        if (!data.tp || data.tp.toString().trim() === '') {
          ctx.addIssue({
            path: ['tp'],
            code: z.ZodIssueCode.custom,
            message: 'listCoin.copyTrade.warning.required',
          })
        }
        if (!data.sl || data.sl.toString().trim() === '') {
          ctx.addIssue({
            path: ['sl'],
            code: z.ZodIssueCode.custom,
            message: 'listCoin.copyTrade.warning.required',
          })
        }
      }
      if (data.sellType === 'custom' && data.customSellType === ConfigSellType.MultiTpsl) {
        if (!data.tpslConfig || data.tpslConfig.length === 0) {
          ctx.addIssue({
            path: ['tpslConfig'],
            code: z.ZodIssueCode.custom,
            message: 'listCoin.copyTrade.warning.required',
          })
          return
        }

        data.tpslConfig?.forEach((item, index) => {
          if (!item.value) {
            ctx.addIssue({
              path: ['tpslConfig', index, 'value'],
              code: z.ZodIssueCode.custom,
              message: 'listCoin.copyTrade.warning.required',
            })
            return false
          }
          if (!item.sellRate) {
            ctx.addIssue({
              path: ['tpslConfig', index, 'sellRate'],
              code: z.ZodIssueCode.custom,
              message: 'listCoin.copyTrade.warning.required',
            })
            return false
          }
        })
      }

      // Market Cap validation - min should not be greater than max
      const minMarketCap = data.minMarketCap ? Number(data.minMarketCap) : null
      const maxMarketCap = data.maxMarketCap ? Number(data.maxMarketCap) : null

      if (minMarketCap !== null && maxMarketCap !== null && minMarketCap > maxMarketCap) {
        ctx.addIssue({
          path: ['minMarketCap'],
          code: z.ZodIssueCode.custom,
          message: 'minCannotGreaterMax',
        })
        ctx.addIssue({
          path: ['maxMarketCap'],
          code: z.ZodIssueCode.custom,
          message: 'minCannotGreaterMax',
        })
      }

      // Pool validation - min should not be greater than max
      const minLiquidity = data.minLiquidity ? Number(data.minLiquidity) : null
      const maxLiquidity = data.maxLiquidity ? Number(data.maxLiquidity) : null

      if (minLiquidity !== null && maxLiquidity !== null && minLiquidity > maxLiquidity) {
        ctx.addIssue({
          path: ['minLiquidity'],
          code: z.ZodIssueCode.custom,
          message: 'minCannotGreaterMax',
        })
        ctx.addIssue({
          path: ['maxLiquidity'],
          code: z.ZodIssueCode.custom,
          message: 'minCannotGreaterMax',
        })
      }

      // Amount validation - min should not be greater than max
      const minAmount = data.minAmount ? Number(data.minAmount) : null
      const maxAmount = data.maxAmount ? Number(data.maxAmount) : null

      if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
        ctx.addIssue({
          path: ['minAmount'],
          code: z.ZodIssueCode.custom,
          message: 'minCannotGreaterMax',
        })
        ctx.addIssue({
          path: ['maxAmount'],
          code: z.ZodIssueCode.custom,
          message: 'minCannotGreaterMax',
        })
      }

      // Creation Time validation - min should not be greater than max
      const minCreationTimeInt = data.minCreationTimeInt ? Number(data.minCreationTimeInt) : null
      const maxCreationTimeInt = data.maxCreationTimeInt ? Number(data.maxCreationTimeInt) : null

      if (minCreationTimeInt !== null && maxCreationTimeInt !== null && minCreationTimeInt > maxCreationTimeInt) {
        ctx.addIssue({
          path: ['minCreationTimeInt'],
          code: z.ZodIssueCode.custom,
          message: 'minCannotGreaterMax',
        })
        ctx.addIssue({
          path: ['maxCreationTimeInt'],
          code: z.ZodIssueCode.custom,
          message: 'minCannotGreaterMax',
        })
      }
    })
export const CONTROL_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'] as const
export const CONTROL_KEYS_MINUS = [...CONTROL_KEYS, '-'] as const

export const handleOnInput = (
  e: React.KeyboardEvent<HTMLInputElement>,
  decimal: number,
  ableNegative: boolean = true,
  isInteger: boolean = false,
) => {
  const char = e.key
  const list_keys = ableNegative ? CONTROL_KEYS_MINUS : CONTROL_KEYS

  // Special case for reload shortcut
  if ((e.ctrlKey || e.metaKey) && char === 'r') {
    return true
  }

  // Allow control keys
  if (list_keys.includes(char as (typeof CONTROL_KEYS)[number])) {
    return true
  }

  const input = e.currentTarget.value
  const [integerPart, decimalPart] = input.split('.')
  if (char === '.') {
    if (isInteger) {
      e.preventDefault()
      return false
    } else if (!String(integerPart).length) {
      e.preventDefault()
      return false
    }
  }

  // Prevent more than max decimal places
  if (decimalPart && decimalPart.length >= decimal) {
    e.preventDefault()
    return false
  }

  // Allow numeric input
  if (char >= '0' && char <= '9') {
    return true
  }

  // Allow first decimal point
  if (char === '.') {
    return input.indexOf('.') === -1
  }

  // Prevent other characters
  e.preventDefault()
  return false
}
export type WalletSettingsFormData = z.infer<ReturnType<typeof getWalletSettingsSchema>>
