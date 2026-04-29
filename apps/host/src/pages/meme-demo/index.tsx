import NewPairTable from '@components/listCoin/newPairs/NewPairTable.tsx'
import ButtonBack from '@components/common/ButtonBack.tsx'
import { useNavigate } from 'react-router-dom'

const MemeDemoPage = () => {
  const navigate = useNavigate()

  return (
    <div>
      <ButtonBack
        text="Back"
        className="mb-[10px]"
        onClick={() => navigate(-1)}
      />
      <NewPairTable
        tableContainerClassName="max-h-[calc(100vh-128px)]"
      />
    </div>
  )
}

export default MemeDemoPage