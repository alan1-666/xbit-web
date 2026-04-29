export enum LineStyle {
  SOLID = 0,
  DOTTED = 1,
  DASHED = 2,
  LARGE_DASHED = 3,
}

const RISE_COLOR = '#00CE89'
const FALL_COLOR = '#EA3B4F'

type Overrides = Record<string, string | number | boolean | object>

export const overRides = (updown: 'gr' | 'rg' = 'gr'): Overrides => ({
  // 'paneProperties.gridProperties.color': '#ffffff',
  // 'paneProperties.gridProperties.style': LineStyle.SOLID,
  'paneProperties.background': '#0A0A0A',
  'paneProperties.backgroundType': 'solid',
  'paneProperties.backgroundGradientStartColor': '#0A0A0A',
  'paneProperties.backgroundGradientEndColor': '#0A0A0A',
  'paneProperties.crossHairProperties.color': '#A2ABB1',
  'paneProperties.crossHairProperties.style': LineStyle.DASHED,
  'paneProperties.crossHairProperties.width': 1,
  'paneProperties.legendProperties.showSeriesTitle': false,
  'paneProperties.legendProperties.showSeriesOHLC': false,
  'paneProperties.legendProperties.showLastDayChange': false,
  'paneProperties.legendProperties.showBarChange': false,
  'paneProperties.legendProperties.showVolume': false,
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
  // load_last_chart: boolean;
}

export const TvConfig = (updown: 'gr' | 'rg' = 'gr', isMob = false): TvConfig => ({
  fullscreen: false,
  autosize: true,
  toolbar_bg: '#111',
  numeric_formatting: { decimal_sign: '.' },
  disabled_features: [
    'use_localstorage_for_settings',
    'header_widget',
    'timeframes_toolbar',
    'go_to_date',
    'popup_hints',
    'adaptive_logo',
    'header_undo_redo',
    'remove_library_container_border',
    'symbol_info',
    'header_saveload',
    'countdown',
    'chart_crosshair_menu',
    'display_market_status',
    'hide_left_toolbar_by_default',
    'symbol_search_hot_key',
    'allow_arbitrary_symbol_search_input',
    'header_symbol_search',
    'timeframes_toolbar',
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
    // 'left_toolbar'
    'volume_force_overlay',
    ...(isMob ? ['main_series_scale_menu'] : []),
  ],
  enabled_features: [
    // 'legend_widget',
    'hide_last_na_study_output',
    'hide_resolution_in_legend',
    'hide_unresolved_symbols_in_legend',
    'hide_last_na_study_output',
    'dont_show_boolean_study_arguments',
    'save_chart_properties_to_local_storage',
    'compare_symbol',
    'hide_left_toolbar_by_default',
    'study_templates',
    'seconds_resolution',
    'study_templates',
    'supports_marks',
    'two_character_bar_marks_labels',
  ],
  overrides: overRides(updown),
  studies_overrides: studiesOverrides(updown),
  legend_widget: {},
  loading_screen: {
    backgroundColor: '#0A0A0A',
    foregroundColor: '#0A0A0A',
  },
  auto_save_delay: 1,
  disable_symbol_change: true
  // load_last_chart: true,
})
