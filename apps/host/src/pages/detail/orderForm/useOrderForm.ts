// hooks/useOrderForm.ts
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { OrderType, TransactionType } from '@/@generated/gql/graphql-trading'
import { SOL_ADDRESS } from '@/lib/blockchain'
import { ChainIds } from '@/types/enums'
import { DetailOrderType } from './desktop/component/TabOrderType'

export const orderFormSchema = z.object({
  transactionType: z.string({ required_error: 'required' }),
  orderType: z.string({ required_error: 'required' }),
  type: z.string({ required_error: 'required' }),
  baseAddress: z.string({ required_error: 'required' }),
  quoteAddress: z.string({ required_error: 'required' }),
  userAddress: z.string({ required_error: 'required' }),
  chainId: z.string({ required_error: 'required' }),
  quoteAmount: z.string(),
  baseAmount: z.string(),
  doublePrincipalAfterPurchase: z.boolean(),
  tp: z.string().optional(),
  sl: z.string().optional(),
  limitPrice: z.string().optional(),
  limitMarketCap: z.string().optional(),
  callbackRate: z.string().optional(),
  triggerPrice: z.string().optional(),
  percent: z.string().optional(),
  
})

export type OrderFormType = z.infer<typeof orderFormSchema>

export const useOrderForm = (defaultValues?: Partial<OrderFormType>): UseFormReturn<OrderFormType> => {
  return useForm<OrderFormType>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      transactionType: TransactionType.Buy,
      type: OrderType.Market,
      baseAddress: '',
      quoteAddress: SOL_ADDRESS,
      userAddress: '',
      quoteAmount: '',
      baseAmount: '',
      doublePrincipalAfterPurchase: false,
      chainId: ChainIds.Solana + '',
      orderType: 'marketPrice' as DetailOrderType,
      ...defaultValues,
    },
  })
}

export const LIMIT_DECIMAL_PRICE = 15
const CONTROL_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'] as const

export const onKeyDownValidateInput = (
  e: React.KeyboardEvent<HTMLInputElement>,
  decimal: number,
  allowNegative = false,
) => {
  const char = e.key

  // Special case for reload shortcut
  if ((e.ctrlKey || e.metaKey) && char.toLowerCase() === 'r') {
    return true
  }

  // Allow control keys
  if (CONTROL_KEYS.includes(char as (typeof CONTROL_KEYS)[number])) {
    return true
  }

  const input = e.currentTarget.value
  const [integerPart, decimalPart] = input.split('.')
  const cursorPos = e.currentTarget.selectionStart ?? input.length

  // Allow input negative value
  if (allowNegative && char === '-') {
    if (cursorPos !== 0 || input.includes('-')) {
      e.preventDefault()
      return false
    }
    return true
  }

  // Prevent more than max decimal places
  if (decimalPart && cursorPos > input.indexOf('.') && decimalPart.length >= decimal) {
    e.preventDefault()
    return false
  }

  // Allow numeric input
  if (char >= '0' && char <= '9') {
    return true
  }

  // Allow only one decimal point
  if (char === '.') {
    if (input.includes('.')) {
      e.preventDefault()
      return false
    }
    return true
  }

  // Block all others
  e.preventDefault()
  return false
}
