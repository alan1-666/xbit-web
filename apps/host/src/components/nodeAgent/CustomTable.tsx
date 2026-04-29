import { useTranslation } from 'react-i18next'
import { ReactNode } from 'react'

interface Column {
  key: string
  title: string
  children?: Column[] // 用于多级表头（比如"推荐奖励"下面有直接/间接好友）
}

interface TableProps {
  columns: Column[]
  data: Record<string, string | number>[]
  currentLevel?: number
  levelKey?: string // 用于匹配当前等级，比如 'level'
  idKey?: string // 用于匹配id，比如 'id'
  renderCell?: (col: Column, row: Record<string, any>, isCurrent: boolean, colIndex: number) => ReactNode // 自定义单元格渲染函数
  showCurrentLevelBadge?: boolean // 是否显示当前等级标签（默认true，保持向后兼容）
}

const CustomTable = ({ columns, data, currentLevel, levelKey = 'level', idKey = 'id', renderCell, showCurrentLevelBadge = true }: TableProps) => {
  const { t } = useTranslation()
// 渲染表头
const renderHeader = (cols: Column[]) => {
  return (
    <div className={`grid ${getGridCols(cols)} text-white text-[13px]`}>
      {cols.map((col) => {
        if (col.children) {
          return (
            <div
              key={col.key}
              className={`col-span-${col.children.length} text-center border-r border-[#ECECED1F]`}
            >
              {/* 父级标题 */}
              <div className="px-4 h-[26px] border-b border-[#ECECED1F] leading-[26px]">
                {col.title}
              </div>
              {/* 子级标题 */}
              <div className={`grid ${getGridCols(col.children)} text-xs`}>
                {col.children.map((child) => (
                  <div
                    key={child.key}
                    className="text-center border-r border-[#ECECED14] bg-[#ECECED14]  last:border-r-0 h-[26px] leading-[26px]"
                  >
                    {child.title}
                  </div>
                ))}
              </div>
            </div>
          )
        }
        return (
          <div
            key={col.key}
            className="col-span-1 text-center border-r border-[#ECECED1F] px-4 py-3 last:border-r-0 leading-[26px]"
          >
            {col.title}
          </div>
        )
      })}
    </div>
  )
}


  // 渲染行
  const renderRow = (row: Record<string, any>, _index: number) => {
    const isCurrent = Boolean(currentLevel && row[idKey] === currentLevel)
    const flattenedCols = flattenColumns(columns)

    return (
      <div
        key={row[levelKey] ?? JSON.stringify(row)}
        className={`grid ${getGridCols(columns)} relative ${
          isCurrent ? 'bg-[#31203d]' : ' hover:bg-[#31203d]'
        }`}
      >
        {flattenedCols.map((col, colIndex) => {
          // 如果提供了自定义渲染函数，使用自定义渲染
          const cellContent = renderCell 
            ? renderCell(col, row, isCurrent, colIndex)
            : row[col.key]

          return (
            <div
              key={col.key}
              className={`text-white text-[14px] font-semibold text-center flex items-center justify-center border-r border-[#ECECED1F] px-4 py-4 last:border-r-0 relative
                ${colIndex % 2 === 0 ? 'bg-[#ECECED0A]' : 'bg-[#2323292E]'} ${
                colIndex === flattenedCols.length - 1 ? 'last:border-r-0' : ''
              }`}
            >
              {cellContent}
            </div>
          )
        })}

        {/* 默认的当前等级标签（如果showCurrentLevelBadge为true且没有自定义渲染） */}
        {isCurrent && showCurrentLevelBadge && !renderCell && (
          <div
            className="absolute left-[-2px] top-0 z-10 h-[18px] px-[5px]"
            style={{
              backgroundImage: 'url(/images/nodeAgent/level.png)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="text-black text-[10px] whitespace-nowrap">
              {t('Activityrewards.currentLevel')}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
      <div className="rounded-[8px] overflow-hidden border border-[#ECECED1F]">
        {/* Header */}
        <div className="bg-[#AB57FF33]">{renderHeader(columns)}</div>
        {/* Body */}
        <div className="divide-y divide-[#ECECED1F]">{data.map((row, index) => renderRow(row, index))}</div>
      </div>
  )
}

/** 工具函数：把多级表头展平 */
const flattenColumns = (cols: Column[]): Column[] =>
  cols.flatMap((col) => (col.children ? col.children : col))

/** 工具函数：grid 列数 */
const getGridCols = (cols: Column[]) => `grid-cols-${flattenColumns(cols).length}`


export default CustomTable
