export interface NotificationPayload<T = object> {
  type: string
  template_code: string
  title: string
  body: string
  data: T & {
    template_code: string
  }
  timestamp: number
  idempotency_key: string
}
