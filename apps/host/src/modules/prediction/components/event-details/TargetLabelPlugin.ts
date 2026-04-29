import { IChartApi, ISeriesApi, ISeriesPrimitive, IPrimitivePaneView } from 'lightweight-charts'

// ==========================================
// NEW: RENDERER & VIEW FOR HORIZONTAL LINE
// ==========================================

class TargetLineRenderer {
  y: number | null = null
  chartWidth: number = 0
  lineColor: string = '#6a7684' // Color synchronized with Label

  draw(target: any) {
    if (this.y === null || this.chartWidth === 0) return

    target.useBitmapCoordinateSpace((scope: any) => {
      const ctx = scope.context as CanvasRenderingContext2D
      const ratio = scope.horizontalPixelRatio

      const y = Math.round(this.y! * ratio)
      const width = Math.round(this.chartWidth * ratio)

      ctx.beginPath()
      // Draw from left margin (x=0) to right margin (x=width)
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)

      ctx.lineWidth = 1 * ratio // Ultra-thin line
      ctx.strokeStyle = this.lineColor

      // Create dashed line effect
      ctx.setLineDash([6 * ratio, 6 * ratio])
      ctx.stroke()

      // Restore normal line style for other plugins
      ctx.setLineDash([])
    })
  }
}

class TargetLineView implements IPrimitivePaneView {
  _source: TargetLabelPlugin
  _renderer = new TargetLineRenderer()

  constructor(source: TargetLabelPlugin) {
    this._source = source
  }

  update() {
    const series = this._source.series
    const chart = this._source.chart
    if (!series || !chart || this._source.targetPrice === null) {
      this._renderer.y = null
      return
    }
    // Y coordinate calculation logic identical to Label to ensure they always stick together
    let y = series.priceToCoordinate(this._source.targetPrice)
    const chartHeight = chart.paneSize ? chart.paneSize().height : 260
    const PADDING = 15

    if (y !== null) {
      if (y < PADDING) y = PADDING
      else if (y > chartHeight - PADDING) y = chartHeight - PADDING
    }

    this._renderer.y = y
    this._renderer.chartWidth = chart.timeScale().width()
  }

  renderer() {
    return this._renderer
  }
}
// --- 1. RENDERER CLASS (Y AXIS PAINTER) ---
class TargetLabelRenderer {
  y: number | null = null
  isUp: boolean = true
  arrowAlpha1: number = 1
  arrowAlpha2: number = 1

  bgColor: string = '#6a7684'
  textColor: string = '#ffffff'

  draw(target: any) {
    if (this.y === null) return

    target.useBitmapCoordinateSpace((scope: any) => {
      const ctx = scope.context as CanvasRenderingContext2D
      const ratio = scope.horizontalPixelRatio

      const y = Math.round(this.y! * ratio)

      // CORE DIFFERENCE: x = 0 is now the Y axis divider.
      // We start drawing from 0 extending to the right.
      const leftEdge = 0

      const height = 20 * ratio
      const halfHeight = height / 2
      const width = 60 * ratio // Label length
      const pointOffset = 6 * ratio // Left corner cut
      const borderRadius = 3 * ratio
      const rightEdge = leftEdge + width

      // 1. DRAW THE TAG (Background)
      ctx.beginPath()
      ctx.moveTo(leftEdge, y)
      ctx.lineTo(leftEdge + pointOffset, y - halfHeight)
      ctx.arcTo(rightEdge, y - halfHeight, rightEdge, y + halfHeight, borderRadius)
      ctx.arcTo(rightEdge, y + halfHeight, leftEdge + pointOffset, y + halfHeight, borderRadius)
      ctx.lineTo(leftEdge + pointOffset, y + halfHeight)
      ctx.closePath()

      ctx.fillStyle = this.bgColor
      ctx.fill()

      // 2. DRAW TEXT "Target"
      ctx.font = `400 ${11 * ratio}px sans-serif`
      ctx.fillStyle = this.textColor
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      // Indent text slightly to avoid the cut corner
      ctx.fillText('Target', leftEdge + pointOffset + 4 * ratio, y + 1 * ratio)

      // 3. DRAW BLINKING ARROW (ALREADY ENLARGED)
      const arrowX = rightEdge - 11 * ratio // Position arrow close to right edge for spacing
      ctx.lineWidth = 1.4 * ratio // OPTIMIZATION 1: Thicker line (was 1.2) for better clarity
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const drawChevron = (cy: number, alpha: number) => {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`

        // OPTIMIZATION 2: Enlarge arrow size (width and height)
        // Changed width +- 2.2 -> +- 3.0
        // Changed height Y difference 1.2 -> 1.8
        if (this.isUp) {
          ctx.moveTo(arrowX - 3.0 * ratio, cy + 1.8 * ratio) // Bottom-left corner
          ctx.lineTo(arrowX, cy - 1 * ratio) // Sharp tip
          ctx.lineTo(arrowX + 3.0 * ratio, cy + 1.8 * ratio) // Bottom-right corner
        } else {
          ctx.moveTo(arrowX - 3.0 * ratio, cy - 1.8 * ratio) // Top-left corner
          ctx.lineTo(arrowX, cy + 1 * ratio) // Sharp tip
          ctx.lineTo(arrowX + 3.0 * ratio, cy - 1.8 * ratio) // Top-right corner
        }
        ctx.stroke()
      }

      // Two arrows spaced apart for balance with new size
      const offset = 2.5 * ratio
      if (this.isUp) {
        drawChevron(y - offset, this.arrowAlpha1)
        drawChevron(y + offset, this.arrowAlpha2)
      } else {
        drawChevron(y + offset, this.arrowAlpha1)
        drawChevron(y - offset, this.arrowAlpha2)
      }
    })
  }
}

// --- 2. VIEW CLASS (Coordinate Calculation) ---
class TargetLabelView implements IPrimitivePaneView {
  _source: TargetLabelPlugin
  _renderer = new TargetLabelRenderer()

  constructor(source: TargetLabelPlugin) {
    this._source = source
  }

  update() {
    const series = this._source.series
    const chart = this._source.chart
    if (!series || !chart || this._source.targetPrice === null) {
      this._renderer.y = null
      return
    }

    let y = series.priceToCoordinate(this._source.targetPrice)

    const chartHeight = chart.paneSize ? chart.paneSize().height : 260
    const PADDING = 15 // Reduced padding for smoother label movement
    if (y !== null) {
      if (y < PADDING) y = PADDING
      else if (y > chartHeight - PADDING) y = chartHeight - PADDING
    }

    this._renderer.y = y

    if (this._source.currentPrice !== null) {
      this._renderer.isUp = this._source.targetPrice > this._source.currentPrice
    }

    this._renderer.arrowAlpha1 = this._source.alpha1
    this._renderer.arrowAlpha2 = this._source.alpha2
  }

  renderer() {
    return this._renderer
  }
}

// --- 3. PLUGIN CLASS ---
export class TargetLabelPlugin implements ISeriesPrimitive {
  chart: IChartApi | null = null
  series: ISeriesApi<any> | null = null

  targetPrice: number | null = null
  currentPrice: number | null = null

  alpha1: number = 1
  alpha2: number = 1

  _labelView: TargetLabelView // Renamed old _view to _labelView for clarity
  _lineView: TargetLineView // Added line View
  _requestUpdate: (() => void) | null = null
  _animationId: number | null = null

  constructor() {
    this._labelView = new TargetLabelView(this)
    this._lineView = new TargetLineView(this)
  }

  attached({ chart, series, requestUpdate }: any) {
    this.chart = chart
    this.series = series
    this._requestUpdate = requestUpdate

    this._animate = this._animate.bind(this)
    this._animationId = requestAnimationFrame(this._animate)
  }

  detached() {
    if (this._animationId !== null) cancelAnimationFrame(this._animationId)
  }

  updateAllViews() {
    this._labelView.update()
    this._lineView.update()
  }

  // SKIP DRAWING ON MAIN CANVAS
  paneViews(): readonly IPrimitivePaneView[] {
    return [this._lineView]
  }

  // ADVANCED FEATURE: DRAW DIRECTLY ON Y AXIS CANVAS
  priceAxisPaneViews(): readonly IPrimitivePaneView[] {
    return [this._labelView]
  }

  _animate(time: number) {
    const speed = 0.005
    this.alpha1 = 0.65 + Math.sin(time * speed) * 0.35
    this.alpha2 = 0.65 + Math.sin(time * speed - Math.PI) * 0.35

    if (this._requestUpdate) this._requestUpdate()
    this._animationId = requestAnimationFrame(this._animate)
  }

  setData(targetPrice: number | null, currentPrice: number | null) {
    this.targetPrice = targetPrice
    this.currentPrice = currentPrice
    if (this._requestUpdate) this._requestUpdate()
  }
}
