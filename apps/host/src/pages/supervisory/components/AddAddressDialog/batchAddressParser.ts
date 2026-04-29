type ParsedItem = { address: string; remarkName?: string }

type ParseResult =
  | { ok: true; items: ParsedItem[] }
  | { ok: false; message: string; details?: { line?: number; raw?: string }[] }

const MAX_ITEMS = 1000

const isEvmAddress = (s: string) => /^0x[a-fA-F0-9]{40}$/.test(s)

const isSolAddress = (s: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s)

const normalizeText = (text: string) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/，/g, ',') // 中文逗号
    .replace(/；/g, ';') // 中文分号
    .replace(/：/g, ':') // 中文冒号

/**
 * 支持分隔符：
 * - 换行
 * - 英文逗号 ,
 * - 分号 ;
 * - 空白（连续空格/Tab）
 *
 * 每条 item 格式：
 * - address
 * - address:remarkName（remarkName 可包含空格，但不建议包含逗号/换行）
 */
export function parseAndValidateBatchAddresses(input: string): ParseResult {
  const text = normalizeText(input).trim()

  if (!text) return { ok: false, message: '请输入要导入的地址' }

  // 允许用户用任意一种分隔（换行/逗号/分号/空白）
  // 注意：remarkName 不应该包含换行或逗号，否则会被拆开（这里按规则强制）
  const rawParts = text
    .split(/[\n,;]+|\s{2,}|\t+/g) // 换行、逗号、分号、多个空格、tab
    .map((x) => x.trim())
    .filter(Boolean)

  if (rawParts.length === 0) return { ok: false, message: '未解析到任何地址，请用换行或英文逗号分隔' }
  if (rawParts.length > MAX_ITEMS) return { ok: false, message: `最多可导入 ${MAX_ITEMS} 个地址` }

  const items: ParsedItem[] = []
  const errors: { line?: number; raw?: string }[] = []

  for (let i = 0; i < rawParts.length; i++) {
    const raw = rawParts[i]

    // address:name（只分割第一个冒号）
    const idx = raw.indexOf(':')
    const address = (idx === -1 ? raw : raw.slice(0, idx)).trim()
    const remarkName = idx === -1 ? undefined : raw.slice(idx + 1).trim()

    if (!address) {
      errors.push({ line: i + 1, raw })
      continue
    }

    // 备注名简单限制：不允许包含逗号/换行（否则会破坏规则）
    if (remarkName && /[\n,;]/.test(remarkName)) {
      errors.push({ line: i + 1, raw })
      continue
    }

    items.push({ address, remarkName: remarkName || undefined })
  }

  // 去重（同一地址重复输入）
  const seen = new Set<string>()
  const deduped: ParsedItem[] = []
  for (const it of items) {
    const key = it.address.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(it)
    }
  }

  if (errors.length) {
    const first = errors[0]
    return {
      ok: false,
      message: `存在格式错误的地址（例如第 ${first.line} 条：${first.raw}），请按“地址”或“地址:备注名”输入，并用换行/英文逗号分隔`,
      details: errors.slice(0, 5), // 只回前 5 个，避免 toast 太长
    }
  }

  if (deduped.length === 0) return { ok: false, message: '没有有效地址可导入' }

  return { ok: true, items: deduped }
}
