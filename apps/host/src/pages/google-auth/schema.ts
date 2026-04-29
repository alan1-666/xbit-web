import { isBaseWallet, isBscWallet, isEthereumWallet, isSolanaWallet, isTrxWallet } from '@/utils/wallet'
import { z } from 'zod'
const MAX_FILE_SIZE = 500000
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
/**
 * .string({
      required_error: 'required',
    })
    .superRefine((val, ctx) => {
      if (!isSolanaWallet(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid SOL address format',
        })
      }
    }),
 */
// Main schema for the form
export const googleAuthSchema = z.object({
  Solana: z.string().superRefine((val, ctx) => {
    if (!isSolanaWallet(val) && val !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'google.auth.not_valid_wallet',
      })
    }
  }),
  Ethereum: z.string().superRefine((val, ctx) => {
    if (!isEthereumWallet(val) && val !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'google.auth.not_valid_wallet',
      })
    }
  }),
  Bsc: z.string().superRefine((val, ctx) => {
    if (!isBscWallet(val) && val !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'google.auth.not_valid_wallet',
      })
    }
  }),
  Base: z.string().superRefine((val, ctx) => {
    if (!isBaseWallet(val) && val !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'google.auth.not_valid_wallet',
      })
    }
  }),
  TRX: z.string().superRefine((val, ctx) => {
    if (!isTrxWallet(val) && val !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'google.auth.not_valid_wallet',
      })
    }
  }),
})

export type GoogleAuthFormData = z.infer<typeof googleAuthSchema>

export const GoogleAuthResetFormSchema = z.object({
  tgAccount: z.string().optional(),
  telegramUserId: z.string().optional(),
  email: z.string().email().optional(),
  verificationCode: z.string().length(6).optional(),
  walletAddress: z.string().optional(),
  screenShots: z
    .any()
    .refine((files) => files?.length == 1, 'Image is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.',
    ),
})

export type GoogleAuthResetFormData = z.infer<typeof GoogleAuthResetFormSchema>
