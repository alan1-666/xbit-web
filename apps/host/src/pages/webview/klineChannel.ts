export const notifyWebReady = () => {
  const KLineChannelFromWeb = (window as any).KLineChannelFromWeb
  if (KLineChannelFromWeb) {
    KLineChannelFromWeb.postMessage(
      JSON.stringify({
        type: 'WEB_READY',
      }),
    )
  }
}
export const notifyChartReady = () => {
  const KLineChannelFromWeb = (window as any).KLineChannelFromWeb
  if (KLineChannelFromWeb) {
    KLineChannelFromWeb.postMessage(
      JSON.stringify({
        type: 'CHART_READY',
      }),
    )
  }
}

export const notifyParamReceived = () => {
  const KLineChannelFromWeb = (window as any).KLineChannelFromWeb
  if (KLineChannelFromWeb) {
    KLineChannelFromWeb.postMessage(
      JSON.stringify({
        type: 'PARAM_RECEIVED',
      }),
    )
  }
}


