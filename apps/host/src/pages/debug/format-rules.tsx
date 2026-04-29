import Container from '@components/common/Container.tsx'
import { formatPrice, formatAmount, formatVolume, formatPercent, formatBalance } from '@/lib/format'
import { useEffect, useState } from 'react'

const FormatRulesPage = () => {
  const [testValue, setTestValue] = useState<string>('')
  const [testShowSign, setTestShowSign] = useState<boolean>(false)
  const [testShowCurrency, setTestShowCurrency] = useState<boolean>(false)
  const [testRoundMode, setTestRoundMode] = useState<'floor' | 'round' | 'ceil'>('round')
  const [testShowSmallAsJSX, setTestShowSmallAsJSX] = useState<boolean>(false)
  const [testShowSmallAsAngleBracket, setTestShowSmallAsAngleBracket] = useState<boolean>(false)
  const [testUnit, setTestUnit] = useState<string>('')
  const [testFunctionIndex, setTestFunctionIndex] = useState<number>(0)

  useEffect(() => {
    setTestShowSign(false)
    setTestShowCurrency(false)
    setTestRoundMode('round')
    setTestShowSmallAsJSX(false)
    setTestShowSmallAsAngleBracket(false)
    setTestUnit('')
  }, [testFunctionIndex])

  useEffect(() => {
    if (testValue && testValue.toLowerCase() !== 'null' && testValue.toLowerCase() !== 'undefined') {
      const filteredValue = testValue.replace(/[^0-9.\-]/g, '')
      if (filteredValue !== testValue) {
        setTestValue(filteredValue)
      }
    }
  }, [testValue])

  const formatFunctions = [
    {
      functionName: 'formatPrice',
      fn: formatPrice,
      rules: [
        'null or undefined: --',
        '0 < x < 1: round according to roundMode to 4 significant digits after the last zero, at most 3 zeros after decimal point, e.g., 0.0₁₄2164',
        '1 <= x < 1M: display full number with comma separators, round according to roundMode to 4 significant digits after decimal point',
        'x >= 1M: display full number, no decimal part',
      ],
    },
    {
      functionName: 'formatAmount',
      fn: formatAmount,
      rules: [
        'null or undefined: --',
        '0 < x < 1: round according to roundMode to 4 significant digits after the last zero, at most 3 zeros after decimal point, e.g., 0.0₁₄2164',
        '1 <= x < 10k: display full number with comma separators, round according to roundMode to 2 significant digits after decimal point',
        'x >= 10k: use K, M, B, T suffixes, round according to roundMode to 2 significant digits after decimal point',
      ],
    },
    {
      functionName: 'formatVolume',
      fn: formatVolume,
      rules: [
        'null or undefined: --',
        '0 < x < 1: round according to roundMode to 4 significant digits after the last zero, at most 3 zeros after decimal point, e.g., 0.0₁₄2164',
        '1 <= x < 1k: display full number with comma separators, round according to roundMode to 2 decimal places',
        'x >= 1k: use K, M, B, T suffixes, round according to roundMode to 2 significant digits after decimal point',
        'x > 10000T: show >9999T, x < -10000T: show <-9999T'
      ],
    },
    {
      functionName: 'formatBalance',
      fn: formatBalance,
      rules: [
        'null or undefined: --',
        '0 < x < 1: round according to roundMode to 4 significant digits after the last zero, at most 3 zeros after decimal point, e.g., 0.0₁₄2164',
        'x >= 1: display full number with comma separators, round according to roundMode to 2 decimal places',
      ],
    },
    {
      functionName: 'formatPercent',
      fn: formatPercent,
      rules: [
        'null or undefined: --',
        '-0.01 < x < 0.01: display 0%',
        '0 < x < 0.01 with showSmallAsAngleBracket=true: display <0.01%',
        '0.01 <= x < 10K: display full number with comma separators, round to 2 decimal places',
        '10K <= x < 10000T: use K, M, B, T suffixes, round to 2 decimal places',
        'x >= 10000T: >9999T%',
        'x <= -10000T: <-9999T%',
      ],
    },
  ]

  const parseTestValue = (): number | string | null | undefined => {
    if (testValue.trim() === '') return undefined
    if (testValue.trim().toLowerCase() === 'null') return null
    if (testValue.trim().toLowerCase() === 'undefined') return undefined
    const num = parseFloat(testValue.trim())
    if (!isNaN(num)) {
      return testValue.trim().includes('.') || testValue.trim().includes('e') || testValue.trim().includes('E')
        ? testValue.trim()
        : num
    }
    return testValue.trim()
  }

  const getTestResult = () => {
    const value = parseTestValue()
    const func = formatFunctions[testFunctionIndex]

    if (value === undefined) return null

    try {
      if (func.functionName.includes('formatBalance')) {
        return (func.fn as any)(value, {
          showCurrency: testShowCurrency,
          showSign: testShowSign,
          roundMode: testRoundMode,
        })
      } else if (func.functionName.includes('formatPrice')) {
        return (func.fn as any)(value, {
          showCurrency: testShowCurrency,
          roundMode: testRoundMode,
          showSmallAsJSX: testShowSmallAsJSX,
        })
      } else if (func.functionName.includes('formatAmount')) {
        return (func.fn as any)(value, {
          showCurrency: testShowCurrency,
          showSign: testShowSign,
          roundMode: testRoundMode,
          unit: testUnit,
        })
      } else if (func.functionName.includes('formatVolume')) {
        return (func.fn as any)(value, {
          showCurrency: testShowCurrency,
          roundMode: testRoundMode,
        })
      } else if (func.functionName.includes('formatPercent')) {
        return (func.fn as any)(value, {
          showSign: testShowSign,
          showSmallAsAngleBracket: testShowSmallAsAngleBracket,
        })
      }
      return null
    } catch (error) {
      return `Error: ${error}`
    }
  }

  const testResult = getTestResult()
  const testResultDisplay =
    testResult === null
      ? '--'
      : typeof testResult === 'object' && testResult !== null && '$$typeof' in testResult
        ? '[JSX Component]'
        : String(testResult)

  const buildTestFunctionCall = () => {
    const func = formatFunctions[testFunctionIndex]
    const value = parseTestValue()
    const valueParam: string =
      value === null
        ? 'null'
        : value === undefined
          ? 'undefined'
          : typeof value === 'string'
            ? `'${value}'`
            : String(value)

    if (func.functionName.includes('formatBalance')) {
      const options: string[] = []
      if (testShowSign) options.push(`showSign: ${testShowSign}`)
      if (testShowCurrency) options.push(`showCurrency: ${testShowCurrency}`)
      if (testRoundMode !== 'round') options.push(`roundMode: '${testRoundMode}'`)
      if (options.length > 0) {
        return `${func.functionName}(${valueParam}, { ${options.join(', ')} })`
      }
      return `${func.functionName}(${valueParam})`
    } else if (func.functionName.includes('formatPrice')) {
      const options: string[] = []
      if (testShowCurrency) options.push(`showCurrency: ${testShowCurrency}`)
      if (testRoundMode !== 'round') options.push(`roundMode: '${testRoundMode}'`)
      if (testShowSmallAsJSX) options.push(`showSmallAsJSX: ${testShowSmallAsJSX}`)
      if (options.length > 0) {
        return `${func.functionName}(${valueParam}, { ${options.join(', ')} })`
      }
      return `${func.functionName}(${valueParam})`
    } else if (func.functionName.includes('formatAmount')) {
      const options: string[] = []
      if (testShowSign) options.push(`showSign: ${testShowSign}`)
      if (testShowCurrency) options.push(`showCurrency: ${testShowCurrency}`)
      if (testRoundMode !== 'round') options.push(`roundMode: '${testRoundMode}'`)
      if (testUnit) options.push(`unit: '${testUnit}'`)
      if (options.length > 0) {
        return `${func.functionName}(${valueParam}, { ${options.join(', ')} })`
      }
      return `${func.functionName}(${valueParam})`
    } else if (func.functionName.includes('formatVolume')) {
      const options: string[] = []
      if (testShowCurrency) options.push(`showCurrency: ${testShowCurrency}`)
      if (testRoundMode !== 'round') options.push(`roundMode: '${testRoundMode}'`)
      if (options.length > 0) {
        return `${func.functionName}(${valueParam}, { ${options.join(', ')} })`
      }
      return `${func.functionName}(${valueParam})`
    } else if (func.functionName.includes('formatPercent')) {
      const options: string[] = []
      if (testShowSign) options.push(`showSign: ${testShowSign}`)
      if (testShowSmallAsAngleBracket) options.push(`showSmallAsAngleBracket: ${testShowSmallAsAngleBracket}`)
      if (options.length > 0) {
        return `${func.functionName}(${valueParam}, { ${options.join(', ')} })`
      }
      return `${func.functionName}(${valueParam})`
    }
    return `${func.functionName}(${valueParam})`
  }

  return (
    <Container className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 p-4 rounded-lg bg-[#232329] border border-[#79778C29]">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Function</label>
                <select
                  value={testFunctionIndex}
                  onChange={(e) => setTestFunctionIndex(Number(e.target.value))}
                  className="w-full p-2 bg-[#141414] border border-[#79778C29] rounded text-white focus:outline-none"
                >
                  {formatFunctions.map((func, index) => (
                    <option key={index} value={index}>
                      {func.functionName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Input</label>
                <input
                  type="text"
                  value={testValue}
                  onChange={(e) => setTestValue(e.target.value)}
                  placeholder="value"
                  className="w-full p-2 bg-[#141414] border border-[#79778C29] rounded text-white focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-sm font-medium text-white mb-3">Parameters</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formatFunctions[testFunctionIndex].functionName.includes('formatPrice') && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-[#79778C] uppercase tracking-wide">Options</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a] border border-[#79778C29]">
                          <input
                            type="checkbox"
                            id="testShowCurrency"
                            checked={testShowCurrency}
                            onChange={(e) => setTestShowCurrency(e.target.checked)}
                            className="w-4 h-4 text-[#00F8D4] bg-[#141414] border-[#79778C29] rounded focus:ring-2 focus:ring-transparent"
                          />
                          <label htmlFor="testShowCurrency" className="text-sm text-white cursor-pointer flex-1">
                            showCurrency
                          </label>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a] border border-[#79778C29]">
                          <input
                            type="checkbox"
                            id="testShowSmallAsJSX"
                            checked={testShowSmallAsJSX}
                            onChange={(e) => setTestShowSmallAsJSX(e.target.checked)}
                            className="w-4 h-4 text-[#00F8D4] bg-[#141414] border-[#79778C29] rounded focus:ring-2 focus:ring-transparent"
                          />
                          <label htmlFor="testShowSmallAsJSX" className="text-sm text-white cursor-pointer flex-1">
                            showSmallAsJSX
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="testRoundMode" className="text-xs text-[#79778C] uppercase tracking-wide">
                        roundMode
                      </label>
                      <select
                        id="testRoundMode"
                        value={testRoundMode}
                        onChange={(e) => setTestRoundMode(e.target.value as 'floor' | 'round' | 'ceil')}
                        className="px-2 h-[38px] bg-[#0a0a0a] border border-[#79778C29] rounded text-white focus:outline-none focus:ring-2 focus:ring-transparent"
                      >
                        <option value="floor">floor</option>
                        <option value="round">round</option>
                        <option value="ceil">ceil</option>
                      </select>
                    </div>
                  </>
                )}
                {formatFunctions[testFunctionIndex].functionName.includes('formatVolume') && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-[#79778C] uppercase tracking-wide">Options</label>
                      <div className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a] border border-[#79778C29]">
                        <input
                          type="checkbox"
                          id="testShowCurrency"
                          checked={testShowCurrency}
                          onChange={(e) => setTestShowCurrency(e.target.checked)}
                          className="w-4 h-4 text-[#00F8D4] bg-[#141414] border-[#79778C29] rounded focus:ring-2 focus:ring-transparent"
                        />
                        <label htmlFor="testShowCurrency" className="text-sm text-white cursor-pointer flex-1">
                          showCurrency
                        </label>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="testRoundMode" className="text-xs text-[#79778C] uppercase tracking-wide">
                        roundMode
                      </label>
                      <select
                        id="testRoundMode"
                        value={testRoundMode}
                        onChange={(e) => setTestRoundMode(e.target.value as 'floor' | 'round' | 'ceil')}
                        className="px-2 h-[38px] bg-[#0a0a0a] border border-[#79778C29] rounded text-white focus:outline-none focus:ring-2 focus:ring-transparent"
                      >
                        <option value="floor">floor</option>
                        <option value="round">round</option>
                        <option value="ceil">ceil</option>
                      </select>
                    </div>
                  </>
                )}
                {formatFunctions[testFunctionIndex].functionName.includes('formatBalance') && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-[#79778C] uppercase tracking-wide">Options</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a] border border-[#79778C29]">
                          <input
                            type="checkbox"
                            id="testShowCurrency"
                            checked={testShowCurrency}
                            onChange={(e) => setTestShowCurrency(e.target.checked)}
                            className="w-4 h-4 text-[#00F8D4] bg-[#141414] border-[#79778C29] rounded focus:ring-2 focus:ring-transparent"
                          />
                          <label htmlFor="testShowCurrency" className="text-sm text-white cursor-pointer flex-1">
                            showCurrency
                          </label>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a] border border-[#79778C29]">
                          <input
                            type="checkbox"
                            id="testShowSign"
                            checked={testShowSign}
                            onChange={(e) => setTestShowSign(e.target.checked)}
                            className="w-4 h-4 text-[#00F8D4] bg-[#141414] border-[#79778C29] rounded focus:ring-2 focus:ring-transparent"
                          />
                          <label htmlFor="testShowSign" className="text-sm text-white cursor-pointer flex-1">
                            showSign
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="testRoundMode" className="text-xs text-[#79778C] uppercase tracking-wide">
                        roundMode
                      </label>
                      <select
                        id="testRoundMode"
                        value={testRoundMode}
                        onChange={(e) => setTestRoundMode(e.target.value as 'floor' | 'round' | 'ceil')}
                        className="px-2 h-[38px] bg-[#0a0a0a] border border-[#79778C29] rounded text-white focus:outline-none focus:ring-2 focus:ring-transparent"
                      >
                        <option value="floor">floor</option>
                        <option value="round">round</option>
                        <option value="ceil">ceil</option>
                      </select>
                    </div>
                  </>
                )}
                {formatFunctions[testFunctionIndex].functionName.includes('formatAmount') && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-[#79778C] uppercase tracking-wide">Options</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a] border border-[#79778C29]">
                          <input
                            type="checkbox"
                            id="testShowCurrency"
                            checked={testShowCurrency}
                            onChange={(e) => setTestShowCurrency(e.target.checked)}
                            className="w-4 h-4 text-[#00F8D4] bg-[#141414] border-[#79778C29] rounded focus:ring-2 focus:ring-transparent"
                          />
                          <label htmlFor="testShowCurrency" className="text-sm text-white cursor-pointer flex-1">
                            showCurrency
                          </label>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a] border border-[#79778C29]">
                          <input
                            type="checkbox"
                            id="testShowSign"
                            checked={testShowSign}
                            onChange={(e) => setTestShowSign(e.target.checked)}
                            className="w-4 h-4 text-[#00F8D4] bg-[#141414] border-[#79778C29] rounded focus:ring-2 focus:ring-transparent"
                          />
                          <label htmlFor="testShowSign" className="text-sm text-white cursor-pointer flex-1">
                            showSign
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="testRoundMode" className="text-xs text-[#79778C] uppercase tracking-wide">
                        roundMode
                      </label>
                      <select
                        id="testRoundMode"
                        value={testRoundMode}
                        onChange={(e) => setTestRoundMode(e.target.value as 'floor' | 'round' | 'ceil')}
                        className="px-2 h-[38px] bg-[#0a0a0a] border border-[#79778C29] rounded text-white focus:outline-none focus:ring-2 focus:ring-transparent"
                      >
                        <option value="floor">floor</option>
                        <option value="round">round</option>
                        <option value="ceil">ceil</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="testUnit" className="text-xs text-[#79778C] uppercase tracking-wide">
                        unit
                      </label>
                      <input
                        id="testUnit"
                        type="text"
                        value={testUnit}
                        onChange={(e) => setTestUnit(e.target.value)}
                        placeholder="unit"
                        className="px-2 h-[38px] bg-[#0a0a0a] border border-[#79778C29] rounded text-white focus:outline-none focus:ring-2 focus:ring-transparent"
                      />
                    </div>
                  </>
                )}
                {formatFunctions[testFunctionIndex].functionName.includes('formatPercent') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-[#79778C] uppercase tracking-wide">Options</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a] border border-[#79778C29]">
                        <input
                          type="checkbox"
                          id="testShowSign"
                          checked={testShowSign}
                          onChange={(e) => setTestShowSign(e.target.checked)}
                          className="w-4 h-4 text-[#00F8D4] bg-[#141414] border-[#79778C29] rounded focus:ring-2 focus:ring-transparent"
                        />
                        <label htmlFor="testShowSign" className="text-sm text-white cursor-pointer flex-1">
                          showSign
                        </label>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a] border border-[#79778C29]">
                        <input
                          type="checkbox"
                          id="testShowSmallAsAngleBracket"
                          checked={testShowSmallAsAngleBracket}
                          onChange={(e) => setTestShowSmallAsAngleBracket(e.target.checked)}
                          className="w-4 h-4 text-[#00F8D4] bg-[#141414] border-[#79778C29] rounded focus:ring-2 focus:ring-transparent"
                        />
                        <label htmlFor="testShowSmallAsAngleBracket" className="text-sm text-white cursor-pointer flex-1">
                          showSmallAsAngleBracket
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 rounded bg-[#141414] border border-[#79778C29]">
              <div className="text-sm mb-2">Function Call:</div>
              <div className="text-xs text-[#79778C] font-mono bg-[#0a0a0a] p-2 rounded border border-[#79778C29] mb-4">
                {buildTestFunctionCall()}
              </div>
              <div className="text-sm mb-2">Output:</div>
              <div className="text-lg text-white font-mono">
                {typeof testResult === 'object' && testResult !== null && '$$typeof' in testResult ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[#00F8D4]">[JSX Component]</span>
                    <span className="text-[#79778C] text-xs">(Render below)</span>
                  </span>
                ) : (
                  <span>{testResultDisplay}</span>
                )}
              </div>
              {typeof testResult === 'object' && testResult !== null && '$$typeof' in testResult && (
                <div className="mt-4 p-3 rounded bg-[#0a0a0a] border border-[#79778C29]">
                  <div className="text-sm mb-2">Rendered:</div>
                  <div className="text-white">{testResult}</div>
                </div>
              )}
            </div>
            <div className="p-4 rounded bg-[#141414] border border-[#79778C29]">
              <div className="text-sm mb-2">Rules:</div>
              <ul className="space-y-2">
                {formatFunctions[testFunctionIndex].rules.map((rule, index) => (
                  <li key={index} className="text-sm text-[#79778C]">
                    <span className="text-white mr-2">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default FormatRulesPage
