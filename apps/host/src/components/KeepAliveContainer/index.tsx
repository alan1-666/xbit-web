import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react'

type KeepAliveProps<K extends string = string> = {
  activeKey: K
  components: Record<K, () => ReactElement>
}

export function KeepAliveContainer<K extends string>({ activeKey, components }: KeepAliveProps<K>) {
  const [visited, setVisited] = useState<K[]>(() => (activeKey ? ([activeKey] as K[]) : []))

  useEffect(() => {
    setVisited((prev) => (prev.includes(activeKey) ? prev : [...prev, activeKey]))
  }, [activeKey])

  const nodes = useMemo(
    () =>
      visited.map((k) => (
        <div key={k} style={{ display: k === activeKey ? 'block' : 'none' }} className="w-full">
          {/* 每次都调用工厂函数，拿到“最新 props”的节点 */}
          {components[k]?.()}
        </div>
      )),
    [visited, activeKey, components],
  )

  return <>{nodes}</>
}
