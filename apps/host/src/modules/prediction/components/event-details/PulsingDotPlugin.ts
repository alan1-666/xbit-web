import { IChartApi, ISeriesApi, ISeriesPrimitive, IPrimitivePaneView } from 'lightweight-charts'

interface BitmapCoordinatesRenderingScope {
  context: CanvasRenderingContext2D
  horizontalPixelRatio: number
  verticalPixelRatio: number
}

interface CanvasRenderingTarget2D {
  useBitmapCoordinateSpace(callback: (scope: BitmapCoordinatesRenderingScope) => void): void
}

// 1. Renderer Class: Responsible for drawing on Canvas
class PulsingDotRenderer {
  _x: number | null = null
  _y: number | null = null
  _color: string = '#2962FF'
  _pulseProgress: number = 0 // Runs from 0 to 1

  draw(target: CanvasRenderingTarget2D) {
    if (this._x === null || this._y === null) return

    // useBitmapCoordinateSpace ensures super sharp rendering on Retina screens (Macbook/Mobile)
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      const pixelRatio = scope.horizontalPixelRatio

      const centerX = Math.round(this._x! * pixelRatio)
      const centerY = Math.round(this._y! * pixelRatio)

      // --- Draw pulsing ring (Pulse Ring) ---
      const maxRadius = 15 * pixelRatio
      const baseRadius = 4 * pixelRatio
      const currentPulseRadius = baseRadius + (maxRadius - baseRadius) * this._pulseProgress
      const opacity = 1 - this._pulseProgress // Larger means more transparent

      ctx.beginPath()
      ctx.arc(centerX, centerY, currentPulseRadius, 0, Math.PI * 2)
      ctx.fillStyle = this._hexToRgba(this._color, opacity * 0.4)
      ctx.fill()

      // --- Draw core dot ---
      ctx.beginPath()
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2)
      ctx.fillStyle = this._color
      ctx.fill()
    })
  }

  // Helper to convert Hex to RGBA for opacity adjustment
  _hexToRgba(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}

// 2. View Class: Translates data (Price, Time) to Pixels (X, Y)
class PulsingDotView {
  _source: PulsingDotPlugin
  _renderer = new PulsingDotRenderer()

  constructor(source: PulsingDotPlugin) {
    this._source = source
  }

  update() {
    const series = this._source.series
    const chart = this._source.chart
    if (!chart) return
    const timeScale = chart.timeScale()
    const data = this._source.data

    if (!series || !timeScale || !data) return

    // Convert Time -> X coordinate
    const x = timeScale.timeToCoordinate(data.time as any)
    // Convert Price -> Y coordinate
    const y = series.priceToCoordinate(data.value)

    this._renderer._x = x
    this._renderer._y = y
    this._renderer._color = this._source.color
    this._renderer._pulseProgress = this._source.pulseProgress
  }

  renderer() {
    return this._renderer
  }
}

// 3. Main Plugin Class
export class PulsingDotPlugin implements ISeriesPrimitive {
  chart: IChartApi | null = null
  series: ISeriesApi<any> | null = null
  data: { time: number; value: number } | null = null
  color: string = '#2962FF'
  pulseProgress: number = 0

  _view: PulsingDotView
  _requestUpdate: (() => void) | null = null
  _animationId: number | null = null
  _startTime: number = 0

  constructor() {
    this._view = new PulsingDotView(this)
  }

  // Hook called when attached to series
  attached({ chart, series, requestUpdate }: any) {
    this.chart = chart
    this.series = series
    this._requestUpdate = requestUpdate

    // Start animation loop
    this._startTime = performance.now()
    this._animate = this._animate.bind(this)
    this._animationId = requestAnimationFrame(this._animate)
  }

  // Hook called when detached from series
  detached() {
    if (this._animationId !== null) cancelAnimationFrame(this._animationId)
    this.chart = null
    this.series = null
    this._requestUpdate = null
  }

  updateAllViews() {
    this._view.update()
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return [this._view]
  }

  // Animation loop logic to create blinking effect
  _animate(time: number) {
    const duration = 2000 // 2 seconds per pulse beat
    const elapsed = time - this._startTime
    this.pulseProgress = (elapsed % duration) / duration

    // Important: Force Lightweight Charts to redraw Canvas to see expanding circle
    if (this._requestUpdate) this._requestUpdate()

    this._animationId = requestAnimationFrame(this._animate)
  }

  // Function for React to call when new price data arrives
  setData(time: number, value: number) {
    this.data = { time, value }
    if (this._requestUpdate) this._requestUpdate()
  }
}
