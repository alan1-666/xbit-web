import Container from '@components/common/Container.tsx'
import CategoryCard from './card/CategoryCard.tsx'
import { useQuery } from '@apollo/client'
import { getCategories } from '@services/tokens.service.ts'
import { TYPE_CHAIN } from '@/lib/blockchain.ts'
import { useMemo } from 'react'
import { useActiveChain } from '@hooks/useActiveChain.ts'
import { futureClient } from '@/lib/gql/apollo-client.ts'

const TabClassification = () => {
  const selectedChain = useActiveChain()
  const chainId = selectedChain === TYPE_CHAIN.SOLANA ? 501424 : 1
  const { data } = useQuery(getCategories, { variables: { input: { chainId } }, client: futureClient })

  const categories = useMemo(() => {
    if (!data) return []
    return data.getAllCategories.data
  }, [data])

  return (
    <Container className="bg-[#111111] pt-[8px]">
      <div className="flex flex-col gap-[5px] pb-[75px]">
        {categories.map((item, index) => (
          <CategoryCard key={item.name} category={item} hot={index < 3} chainId={chainId} />
        ))}
      </div>
    </Container>
  )
}

export default TabClassification
