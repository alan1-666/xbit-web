import { GoogleAuth } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import _ from 'lodash'

import fs from 'fs'

// Local locale folders we write to (public/locales/<lang>/translation.json)
const langs = ['vi', 'en', 'hi', 'zh', 'hk', 'es', 'ja', 'pt', 'fr', 'de', 'it', 'tr', 'ko', 'ar']
const sheetId = '1JddgAEAmFU8uzkK1ITbPzGcGTr1diey3QNQjYes7J8w'
const sheetName = 'Xbit Platform'

// Google Sheet column aliases (read from these columns, but never write files for them)
const SHEET_LOCALE_ALIASES = {
  hk: ['zh-Hant', 'hk'],
}

// Map local locale -> sheet column name (for --sync)
const SHEET_LOCALE_WRITE_MAP = {
  hk: 'zh-Hant',
}

function getLangPath(lang) {
  return `public/locales/${lang}/translation.json`
}

async function deleteColumnByName(columnName, sheet) {
  await sheet.loadHeaderRow().catch(() => {})
  await sheet.loadCells()
  const headerRow = await getHeaders(sheet)

  const columnIndex = headerRow.indexOf(columnName)
  if (columnIndex === -1) {
    return
  }
  const column = String.fromCharCode('A'.charCodeAt(0) + columnIndex)
  const range = `${column}1:${column}9999`
  await sheet.clear(range)
}

function readJson(path) {
  const data = fs.readFileSync(path, 'utf-8')
  return JSON.parse(data)
}

const creds = readJson('./scripts/credentials.json')

async function getOrCreateSheet(sheetId, sheetName) {
  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const doc = new GoogleSpreadsheet(sheetId, auth)
  await doc.loadInfo()
  const sheet = doc.sheetsByTitle[sheetName]

  if (sheet) return sheet
  return doc.addSheet({
    title: sheetName,
  })
}

async function getHeaders(sheet) {
  try {
    return sheet.headerValues
  } catch (error) {
    return []
  }
}

async function getDataInSheet(sheetId, sheetName) {
  const sheet = await getOrCreateSheet(sheetId, sheetName)

  await sheet.loadHeaderRow().catch(() => {})
  const headers = await getHeaders(sheet)
  if (_.isEmpty(headers)) return []

  const rows = await sheet.getRows()
  return rows.map((row) => {
    const result = {}
    headers.forEach((key) => (result[key] = row.get(key)))
    return result
  })
}

async function run(args) {
  // if args has --sync, then sync the data
  const isSync = args.includes('--sync')
  try {
    const data = await getDataInSheet(sheetId, sheetName)
    const dataToAddToRemote = {}
    langs.map((lang) => {
      const packageFromRemote = _.map(data, ({ Key: key, ...item }) => {
        const fallbackColumns = SHEET_LOCALE_ALIASES[lang] ?? [lang]
        const rawValue = fallbackColumns.reduce((acc, col) => acc ?? item[col], undefined)
        return {
          key,
          value: normalizeCellValue(rawValue),
        }
      }).filter(({ key, value }) => key && value)
      const langInLocalObj = readJson(getLangPath(lang))
      const packageFromLocal = toSheetRows(langInLocalObj)
      const dataMerged = merge(packageFromLocal, packageFromRemote)

      const records = _.map(dataMerged, (value, key) => ({ key, value }))
      records.sort((a, b) => a.key.localeCompare(b.key))

      records.forEach(({ value, key }) => {
        const old = dataToAddToRemote[key] || {}
        const sheetLang = SHEET_LOCALE_WRITE_MAP[lang] ?? lang
        dataToAddToRemote[key] = { ...old, [sheetLang]: value }
      })

      const dataToAddToLocal = toObj(records)
      const formattedJson = JSON.stringify(dataToAddToLocal, null, 2)
      fs.writeFileSync(getLangPath(lang), formattedJson, 'utf-8')
    })

    if (isSync) {
      const records = _.map(dataToAddToRemote, (value, key) => ({ Key: key, ...value }))
      records.sort((a, b) => a.Key.localeCompare(b.Key))
      const sheet = await getOrCreateSheet(sheetId, sheetName)

      const headers = ['Key', ...langs.map((lang) => SHEET_LOCALE_WRITE_MAP[lang] ?? lang)]

      await sheet.clear()

      // for (let i = 0; i < headers.length; i++) {
      //   const columnName = headers[i];
      //   await deleteColumnByName(columnName, sheet);
      // }

      await sheet.setHeaderRow(headers)
      await sheet.loadCells()

      for (let i = 0; i < headers.length; i++) {
        const cell = sheet.getCell(0, i)
        cell.textFormat = { bold: true }
      }

      await sheet.saveUpdatedCells()
      await sheet.addRows(records)
    }
  } catch (error) {
    console.log('Sync language with error: ', error)
  }
}

function toSheetRows(data, prefix = '') {
  const res = _.flatMap(
    _.map(data, (value, key) => {
      const _key = prefix ? `${prefix}.${key}` : key

      if (typeof value == 'object') {
        return _.flatMap(toSheetRows(value, _key))
      }
      return [{ key: _key, value }]
    }),
  )
  return res.filter(({ key, value }) => key && value)
}

function merge(list1, list2) {
  const result = {}

  _.map(list1, ({ key, value }) => (result[key] = value))
  _.map(list2, ({ key, value }) => (result[key] = value))

  return result
}

function normalizeNewlines(value) {
  if (typeof value !== 'string') return value
  // Convert literal \\n (double backslash + n) to actual newline \n
  return value.replace(/\\\\n/g, '\n')
}

function normalizeInterpolationBraces(value) {
  if (typeof value !== 'string') return value

  const LEFT = '__I18N_LBRACE__'
  const RIGHT = '__I18N_RBRACE__'

  return (
    value
      // protect existing i18n braces
      .replace(/{{/g, LEFT)
      .replace(/}}/g, RIGHT)
      // convert any remaining single braces
      .replace(/{/g, '{{')
      .replace(/}/g, '}}')
      // restore protected braces
      .replace(new RegExp(LEFT, 'g'), '{{')
      .replace(new RegExp(RIGHT, 'g'), '}}')
  )
}

function normalizeCellValue(value) {
  return normalizeInterpolationBraces(normalizeNewlines(value))
}

function toObj(data) {
  const result = {}

  _.forEach(data, ({ key, value }) => _.set(result, key, value))

  return result
}
//get params from command line
const args = process.argv.slice(2)
run(args)
