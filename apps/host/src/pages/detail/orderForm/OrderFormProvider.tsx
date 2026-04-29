// providers/OrderFormProvider.tsx
import { FormProvider } from 'react-hook-form'
import { ReactNode } from 'react'
import { useOrderForm } from './useOrderForm'

export const OrderFormProvider = ({ children, defaultValues }: { children: ReactNode; defaultValues?: any }) => {
  const methods = useOrderForm(defaultValues)

  return <FormProvider {...methods}>{children}</FormProvider>
}
