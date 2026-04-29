import type { TFunction } from 'i18next'
import { z } from 'zod'

export const createSingleSchema = (t: TFunction) =>
  z.object({
    address: z.string().min(1, t('smartMoney.supervisory.addrInputToast')),
    remarkName: z.string().optional(),
    groupIds: z.array(z.string()).default([]),
  })

export const createBatchSchema = (t: TFunction) =>
  z.object({
    groupIds: z.array(z.string()).default([]),
    addressesText: z.string().min(1, t('smartMoney.supervisory.addrImportToast')),
  })

export const createExportSchema = (t: TFunction) =>
  z.object({
    groupId: z.string().min(1, t('smartMoney.supervisory.addrPlaceholder')),
  })
