import { ViewTxButton } from '@components/common/notification/ViewTxButton.tsx'

type AdditionalData = {
  template_code: string
  tx_id?: string
}

export interface NotificationToastDescriptionProps {
  body: string
  additionalData?: object
}

export const NotificationToastDescription = (props: NotificationToastDescriptionProps) => {
  const { body, additionalData } = props
  const data = additionalData as AdditionalData
  const templateCode = data?.template_code
  if (templateCode && templateCode === 'limit_order_buy_success') {
    return (
      <span>
        {body}
        <br />
        <ViewTxButton txId={data?.tx_id} />
      </span>
    )
  } else {
    return body
  }
}
