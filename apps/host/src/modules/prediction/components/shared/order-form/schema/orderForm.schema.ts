import z from 'zod'

const BaseFormSchema = z.object({
  side: z.enum(['buy', 'sell']),
  outcome: z.enum(['yes', 'no']),
  yesPrice: z.number().optional(),
  noPrice: z.number().optional(),
})

const LimitOrderSchema = z.object({
  orderType: z.literal('limit'),
  data: z.object({
    price: z.number().positive(),
    size: z.number().positive(),
    amount: z.number().optional(),
  }),
})

const MarketOrderSchema = z.object({
  orderType: z.literal('market'),
  data: z.object({
    size: z.number().optional(),
    amount: z.number().optional(),
  }),
})

const OrderVariantSchema = z.discriminatedUnion('orderType', [LimitOrderSchema, MarketOrderSchema])

export const OrderFormDataSchema = BaseFormSchema.and(OrderVariantSchema).superRefine((data, ctx) => {
  const { orderType, data: orderData } = data
  const size = orderData.size
  const amount = orderData.amount
  const side = data.side
  if (orderType === 'market') {
    // validate buy market, total cost must greater than $1
    if (side === 'buy') {
      if (amount === undefined || amount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Market buy: Amount must be at least $1',
          path: ['data', 'amount'],
        })
      }
    } else {
      if (size === undefined || size <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Market sell: Size must be greater than 0',
          path: ['data', 'size'],
        })
      }
    }
  } else if (orderType === 'limit') {
    if (side === 'buy') {
      if (size && size < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Limit buy: Size must be at least 5',
          path: ['data', 'price'],
        })
      }
    } else {
      if (size === undefined || size < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Limit sell: Size must be at least 5',
          path: ['data', 'size'],
        })
      }
    }
  }
})
