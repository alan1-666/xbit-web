export enum LineStyle {
  SOLID = 0,
  DOTTED = 1,
  DASHED = 2,
  LARGE_DASHED = 3,
}

const RISE_COLOR = '#21E09D'
const FALL_COLOR = '#EA3B4F'

type Overrides = Record<string, string | number | boolean | object>

export const overRides = (updown: 'gr' | 'rg' = 'gr'): Overrides => ({
  'paneProperties.gridProperties.color': '#ffffff',
  'paneProperties.gridProperties.style': LineStyle.SOLID,
  'paneProperties.background': '#121214',
  'paneProperties.backgroundType': 'solid',
  'paneProperties.backgroundGradientStartColor': '#121214',
  'paneProperties.backgroundGradientEndColor': '#121214',
  'paneProperties.crossHairProperties.color': '#A2ABB1',
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
  'mainSeriesProperties.areaStyle.linecolor': RISE_COLOR,
  'mainSeriesProperties.areaStyle.linewidth': 1,
  'mainSeriesProperties.areaStyle.priceSource': 'close',
  'mainSeriesProperties.showCountdown': true,
  volumePaneSize: 'medium',
  'volume.volumeFormat': {
    type: 'volume',
    precision: 1,
  },
})

type StudiesOverrides = Record<string, string | number>

export const studiesOverrides = (updown: 'gr' | 'rg' = 'gr'): StudiesOverrides => ({
  'volume.volume.color.0': updown === 'gr' ? FALL_COLOR : RISE_COLOR,
  'volume.volume.color.1': updown === 'gr' ? RISE_COLOR : FALL_COLOR,
  'volume.precision': 4,
  'volume.volume.transparency': 60,
  'bollinger bands.median.color': '#33FF88',
  'bollinger bands.upper.linewidth': 7,
})

interface TvConfig {
  fullscreen: boolean
  autosize: boolean
  toolbar_bg: string
  numeric_formatting: { decimal_sign: string }
  disabled_features: string[]
  enabled_features: string[]
  overrides: Overrides
  studies_overrides: StudiesOverrides
  legend_widget: Record<string, unknown>
  loading_screen: { backgroundColor: string; foregroundColor: string }
  auto_save_delay: number
  disable_symbol_change: boolean
}

export const TvConfig = (updown: 'gr' | 'rg' = 'gr'): TvConfig => ({
  fullscreen: false,
  autosize: true,
  toolbar_bg: '#111',
  numeric_formatting: { decimal_sign: '.' },
  disabled_features: [
    'header_widget',
    'use_localstorage_for_settings',
    'go_to_date',
    'popup_hints',
    'adaptive_logo',
    'remove_library_container_border',
    'symbol_search_hot_key',
    'allow_arbitrary_symbol_search_input',
    'header_symbol_search',
    'header_interval_dialog_button',
    'header_resolutions',
    'show_interval_dialog_on_key_press',
    'adaptive_logo',
    'compare_symbol_search_spread_operators',
    'studies_symbol_search_spread_operators',
    'scales_time_hours_format',
    'request_only_visible_range_on_reset',
    'display_legend_on_all_charts',
    // 'widget_logo',
    'volume_force_overlay',
  ],
  enabled_features: [
    'dont_show_boolean_study_arguments',
    'save_chart_properties_to_local_storage',
    'compare_symbol',
    'study_templates',
    'supports_marks',
    'two_character_bar_marks_labels',
  ],
  overrides: overRides(updown),
  studies_overrides: studiesOverrides(updown),
  legend_widget: {},
  loading_screen: {
    backgroundColor: '#121214',
    foregroundColor: '#121214',
  },
  auto_save_delay: 1,
  disable_symbol_change: true,
})
