export enum LineStyle {
  SOLID = 0,
  DOTTED = 1,
  DASHED = 2,
  LARGE_DASHED = 3,
}

const RISE_COLOR = '#21E09D'
const FALL_COLOR = '#EA3B4F'

type Overrides = Record<string, string | number | boolean>

export const overRides = (updown: 'gr' | 'rg' = 'gr'): Overrides => ({
  'paneProperties.vertGridProperties.color': '#1F1E26',
  'paneProperties.horzGridProperties.color': '#1F1E26',
  // v28: gridProperties.style 拆分为 horz/vertGridProperties.style
  'paneProperties.horzGridProperties.style': LineStyle.SOLID,
  'paneProperties.vertGridProperties.style': LineStyle.SOLID,
  'paneProperties.background': '#121214',
  'paneProperties.backgroundType': 'solid',
  'paneProperties.backgroundGradientStartColor': '#121214',
  'paneProperties.backgroundGradientEndColor': '#121214',
  'chartProperties.background': '#121214',
  'chartProperties.paneProperties.background': '#121214',
  'paneProperties.crossHairProperties.color': '#404040',
  'paneProperties.crossHairProperties.style': LineStyle.DASHED,
  'paneProperties.crossHairProperties.width': 1,
  'mainSeriesProperties.barStyle.downColor': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'mainSeriesProperties.barStyle.upColor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.candleStyle.upColor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.candleStyle.downColor': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'mainSeriesProperties.candleStyle.wickUpColor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.candleStyle.wickDownColor': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'mainSeriesProperties.candleStyle.borderUpColor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.candleStyle.borderDownColor': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'mainSeriesProperties.candleStyle.drawBorder': false,
  'mainSeriesProperties.lineStyle.color': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.hollowCandleStyle.borderDownColor': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'mainSeriesProperties.hollowCandleStyle.borderUpColor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.hollowCandleStyle.downColor': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'mainSeriesProperties.hollowCandleStyle.upColor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.hollowCandleStyle.wickDownColor': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'mainSeriesProperties.hollowCandleStyle.wickUpColor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.haStyle.upColor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.haStyle.downColor': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'mainSeriesProperties.haStyle.wickDownColor': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'mainSeriesProperties.haStyle.wickUpColor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.haStyle.drawBorder': false,
  'mainSeriesProperties.areaStyle.color1': 'rgba(17,195,147, 0.2)',
  'mainSeriesProperties.areaStyle.color2': 'rgba(17,195,147, 0.01)',
  'mainSeriesProperties.areaStyle.linecolor': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'mainSeriesProperties.areaStyle.linewidth': 1,
  'mainSeriesProperties.areaStyle.priceSource': 'close',
  'mainSeriesProperties.showCountdown': true,
  
  // "mainSeriesProperties.highLowAvgPrice.highLowPriceLabelsVisible": true,
  // volumePaneSize: 'medium',
  // 'volume.volumeFormat': {
  //   type: 'volume',
  //   precision: 1,
  // },
  // the right price scale for staudy(indicator) 
  // "scalesProperties.showStudyLastValue": false,
})

type StudiesOverrides = Record<string, string | number>

export const studiesOverrides = (updown: 'gr' | 'rg' = 'gr'): StudiesOverrides => ({
  'volume.volume.color.0': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'volume.volume.color.1': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'volume.volume.transparency': 70,
  'volume.volume.linewidth': 2,
  'bollinger bands.upper.color': 'rgba(134, 105, 190, 1)',
  'bollinger bands.median.color': 'rgba(134, 105, 190, 1)',
  'bollinger bands.lower.color': 'rgba(134, 105, 190, 1)',
  'bollinger bands.upper.linewidth': 1,
  'MA.plot.color':'rgba(221, 179, 62, 1)',
  'EMA.plot.color':'rgba(221, 179, 62, 1)',
  'MACD.histogram.color.0': 'rgba(9, 245, 178, 1)', // strong bullish
  'MACD.histogram.color.1': 'rgba(31, 183, 140, 1)', // weak bullish
  'MACD.histogram.color.2': 'rgba(227, 91, 104, 1)', // strong bearish
  'MACD.histogram.color.3': 'rgba(176, 75, 80, 1)', // weak bearish
  'MACD.signal.color': 'rgba(221, 179, 62, 1)',
  'MACD.macd.color': 'rgba(134, 105, 190, 1)',   
  'SAR.plot.color': 'rgba(134, 105, 190, 1)',
  'RSI.plot.color':'rgba(102, 144, 174, 1)',
  'RSI.Smoothed MA.color': 'rgba(221, 179, 62, 1)', // RSI Smoothed MA
  'RSI.Smoothed MA.display': 1,
  'Stoch RSI.%d.color':'rgba(102, 144, 174, 1)',
  'Stoch RSI.%k.color':'rgba(221, 179, 62, 1)',

})

interface TvConfig {
  fullscreen: boolean
  autosize: boolean
  toolbar_bg: string
  numeric_formatting: { decimal_sign: string }
  time_scale?: {
    min_bar_spacing?: number
    max_bar_spacing?: number
  }
  disabled_features: string[]
  enabled_features: string[]
  overrides: Overrides
  studies_overrides: StudiesOverrides
  legend_widget: Record<string, unknown>
  loading_screen: { backgroundColor: string; foregroundColor: string }
  auto_save_delay: number
  load_last_chart: boolean;
}

export const TvConfig = (updown: 'gr' | 'rg' = 'gr'): TvConfig => ({
  fullscreen: false,
  autosize: true,
  toolbar_bg: '#141418',
  numeric_formatting: { decimal_sign: '.' },
  // 设置时间轴缩放限制，防止K线过宽
  time_scale: {
    min_bar_spacing: 2, // 最小K线间距（像素）
    max_bar_spacing: 100, // 最大K线间距（像素）
  },
  disabled_features: [
    'use_localstorage_for_settings',
    'header_widget',
    'popup_hints',
    'adaptive_logo',
    'header_undo_redo',
    'remove_library_container_border',
    'symbol_info',
    'header_saveload',
    'countdown',
    'chart_crosshair_menu',
    'display_market_status',
    // 隐藏 K 线 header 中的默认按钮（原本是为了改造原生头部，如果没有使用原生头部就不用配置下面几项）
    'header_symbol_search',  // 隐藏合约搜索
    'symbol_search_hot_key',
    'header_quick_search',   // 隐藏快速搜索（命令面板）
    'header_screenshot',     // 隐藏快照（截图）
    'header_compare', // Compare or add symbol
    'study_templates', // Indicator templates
    // 禁用与远端存储相关的特性，避免初始化阶段外网握手导致卡顿
    'header_saveload',
    'save_chart_properties_to_local_storage',
    'use_localstorage_for_settings',
  ],
  enabled_features: [
    'hide_last_na_study_output',
    'dont_show_boolean_study_arguments',
    'save_chart_properties_to_local_storage',
    'items_favoriting',
    'seconds_resolution',
    'saveload_separate_drawings_storage',
    // 启用K线宽度控制功能
    'constraint_dialogs_movement',
  ],
  overrides: overRides(updown),
  studies_overrides: studiesOverrides(updown),
  legend_widget: {},
  loading_screen: {
    backgroundColor: '#121214',
    foregroundColor: '#121214',
  },
  auto_save_delay: 1,
  load_last_chart: false,
})
