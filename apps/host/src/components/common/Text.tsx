import { cn } from '@/lib/utils'
import { removeAccents } from '@/utils/helpers'

interface TextProps {
  text: string
  className?: string
  color?: string
  fontSize?: 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 32 | 36
  fontWeight?: 'light' | 'regular' | 'medium' | 'semibold'
  highLightText?: string
  highLightColor?: string
  onClick?: () => void
}

const Text = ({
  text,
  className,
  color = '#FFFFFF',
  fontSize = 14,
  fontWeight = 'regular',
  onClick,
  highLightText,
  highLightColor = '#AB57FF',
}: TextProps) => {
  const renderEllipsisHighlight = () => {
    if (!highLightText || !text.includes('...')) return null

    const [start, end] = text.split('...')
    const terms = removeAccents(highLightText).trim().toLowerCase().split(/\s+/).filter(Boolean)

    const renderPart = (part: string) => {
      // Normalize part for comparison
      const lowerPart = removeAccents(part).toLowerCase()

      for (const term of terms) {
        // Normalize term (already done above, but term is from terms)
        const lowerTerm = term
        const indexInPart = lowerPart.indexOf(lowerTerm)
        const partInTerm = lowerTerm.includes(lowerPart)

        if (indexInPart !== -1) {
          return (
            <>
              <span style={{ color }}>{part.slice(0, indexInPart)}</span>
              <span style={{ color: highLightColor }}>{part.slice(indexInPart, indexInPart + lowerTerm.length)}</span>
              <span style={{ color }}>{part.slice(indexInPart + lowerTerm.length)}</span>
            </>
          )
        }

        if (partInTerm) {
          return <span style={{ color: highLightColor }}>{part}</span>
        }
      }
      return <span style={{ color }}>{part}</span>
    }

    return (
      <>
        {renderPart(start)}
        <span style={{ color }}>{'...'}</span>
        {renderPart(end)}
      </>
    )
  }

  const renderHighlightedText = () => {
    if (!highLightText || !text) return text

    // Handle ellipsis form (e.g. Gas4u...Hnuk)
    if (text.includes('...')) {
      const ellipsisResult = renderEllipsisHighlight()
      if (ellipsisResult) return ellipsisResult
    }

    const normalizedText = removeAccents(text).toLowerCase()
    const terms = removeAccents(highLightText).trim().toLowerCase().split(/\s+/).filter(Boolean)

    if (terms.length === 0) return text

    // Find all matches in normalized text
    const matches: { start: number; end: number }[] = []

    terms.forEach((term) => {
      let pos = normalizedText.indexOf(term)
      while (pos !== -1) {
        matches.push({ start: pos, end: pos + term.length })
        pos = normalizedText.indexOf(term, pos + 1)
      }
    })

    if (matches.length === 0) return text

    // Sort and merge matches
    matches.sort((a, b) => a.start - b.start)
    const mergedMatches: { start: number; end: number }[] = []

    if (matches.length > 0) {
      let current = matches[0]
      for (let i = 1; i < matches.length; i++) {
        const next = matches[i]
        if (next.start < current.end) {
          current.end = Math.max(current.end, next.end)
        } else {
          mergedMatches.push(current)
          current = next
        }
      }
      mergedMatches.push(current)
    }

    const parts = []
    let lastIndex = 0

    mergedMatches.forEach((match, i) => {
      if (match.start > lastIndex) {
        parts.push(
          <span key={`text-${i}`} style={{ color }}>
            {text.slice(lastIndex, match.start)}
          </span>,
        )
      }
      parts.push(
        <span key={`highlight-${i}`} style={{ color: highLightColor }}>
          {text.slice(match.start, match.end)}
        </span>,
      )
      lastIndex = match.end
    })

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-end`} style={{ color }}>
          {text.slice(lastIndex)}
        </span>,
      )
    }

    return parts
  }

  return (
    <div
      className={cn(`app-font-${fontWeight} text-[calc(1rem*(${fontSize}/16))]`, className)}
      style={{ color }}
      onClick={onClick}
    >
      {highLightText ? renderHighlightedText() : text}
    </div>
  )
}

export default Text
