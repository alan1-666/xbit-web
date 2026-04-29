import ButtonShadowGradient from '@/components/common/buttons/ButtonShadowGradient'
import { SelectTokenDrawer } from '@/components/futuresTransfer/SelectTokenDrawer'
import TransferAuthDrawer from '@/components/futuresTransfer/TransferAuthDrawer'
import TransferResultModal from '@/components/futuresTransfer/TransferResultModal'
import HeaderWithBack from '@/components/header/HeaderWithBack'
import { ChainIds } from '@/types/enums'
import { SetStateAction, useState } from 'react'

const FuturesTransfer = () => {
  const [openSelectTokenDrawer, setOpenSelectTokenDrawer] = useState(false)
  const [openTransferAuthDrawer, setOpenTransferAuthDrawer] = useState(false)
  const [openResultModal, setOpenResultModal] = useState(true)
  const [resultType, setResultType] = useState<'success' | 'failed'>('failed')
  const [stepStates, setStepStates] = useState({
    1: { status: 'completed' },
    2: { status: 'loading' },
    3: { status: 'pending' },
  })
  return (
    <div className="min-h-screen bg-[url('/images/walletCopy/bg_setting.png')] bg-cover bg-center ">
      <HeaderWithBack title="划转" right={<button>资金记录</button>} className="bg-transparent" />
      {false && (
        <div
          className="text-[#FF353C] text-xs px-2.5 py-2"
          style={{
            background:
              'linear-gradient(90deg, rgba(165, 62, 255, 0.08) 0%, rgba(165, 62, 255, 0.06) 100%) linear-gradient(90deg, color(display-p3 0.6 0.2706 1 / 0.08) 0%, color(display-p3 0.6 0.2706 1 / 0.06) 100%)',
          }}
        >
          当前连接的钱包不支持Arbitrum网络，无法划转至合约账户(合约账户仅支持Arbitrum网络)，请切换钱包
        </div>
      )}
      <div className="px-3 mt-5">
        <div
          className="mt-4 px-[14px] py-3 rounded-[10px] relative z-[1] overflow-hidden text-[#FFFFFF70]"
          style={{ background: 'linear-gradient(145deg, #25222D,#212C2E)' }}
        >
          <svg
            className="absolute inset-0 w-full h-full z-[-1] pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <rect
              x="0.25"
              y="0.25"
              width="99.9%"
              height="99.1%"
              rx="10"
              ry="10"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="0.5"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5E3395" />
                <stop offset="100%" stopColor="#118E6C" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex justify-start bg-[#141414] py-2 px-[14px] rounded-[10px]  gap-2 relative">
            <div>从</div>
            <div>
              <h6 className="text-white text-base font-semibold">资金账户</h6>
              <p className="text-[#FFFFFF80] text-xs">USDC</p>
            </div>
            <img
              src="/images/cryptoDeposit/swap.svg"
              className="w-[54px] h-[54] absolute left-1/2 -bottom-[36px] -translate-x-1/2"
              alt="arrow"
            />
          </div>
          <div className="flex justify-start bg-[#141414] py-2 px-[14px] rounded-[10px]  gap-2 mt-3">
            <div>到</div>
            <div>
              <h6 className="text-white text-base font-semibold">合约账户</h6>
              <p className="text-[#FFFFFF80] text-xs">USDC</p>
            </div>
          </div>
        </div>
        <div className="mt-[23px]">
          <h5 className="text-base text-white font-medium">币种</h5>
          <div
            className="mt-4 px-[14px] pt-3 pb-[14px] rounded-[10px] relative z-[1] overflow-hidden text-[#FFFFFF70] flex items-center gap-2"
            style={{ background: 'linear-gradient(145deg, #25222D,#212C2E)' }}
            onClick={() => {
              setOpenSelectTokenDrawer(true)
            }}
          >
            <svg
              className="absolute inset-0 w-full h-full z-[-1] pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <rect
                x="0.25"
                y="0.25"
                width="99.9%"
                height="99.1%"
                rx="10"
                ry="10"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="0.5"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5E3395" />
                  <stop offset="100%" stopColor="#118E6C" />
                </linearGradient>
              </defs>
            </svg>
            <img src="/images/cryptoDeposit/usdc.svg" className="w-8 h-8" alt="icon usdc" />
            <div className="w-full">
              <h6 className="text-white text-base font-semibold">USDC</h6>
              <p className="text-[#FFFFFF80] text-xs">USD Coin</p>
            </div>
            <img src="/images/cryptoDeposit/arrow-down.svg" alt="icon arrow down" />
          </div>
        </div>
        <div className="mt-[23px]">
          <h5 className="text-base text-white font-medium">划转数量</h5>
          <div
            className="mt-4 px-[14px] pt-3 pb-[14px] rounded-[10px] relative z-[1] overflow-hidden text-[#FFFFFF70] flex items-center gap-2"
            style={{ background: 'linear-gradient(145deg, #25222D,#212C2E)' }}
          >
            <svg
              className="absolute inset-0 w-full h-full z-[-1] pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <rect
                x="0.25"
                y="0.25"
                width="99.9%"
                height="99.1%"
                rx="10"
                ry="10"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="0.5"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5E3395" />
                  <stop offset="100%" stopColor="#118E6C" />
                </linearGradient>
              </defs>
            </svg>
            <input placeholder="请输入数量" className="w-full text-white" />
            <div className="min-w-[80px] flex items-center gap-2.5 justify-end">
              <span>USDC </span>
              <button className="text-[#00FFB4] text-[13px] font-[350]">最大</button>
            </div>
          </div>
        </div>
        <p className="text-[#FFFFFF70] text-xs py-3">
          可用余额
          <span className="text-white font-semibold ml-1"> 0 USDC</span>
        </p>
        <ButtonShadowGradient className="rounded-[200px] w-full disabled:bg-[#ECECED18] mt-8" disabled>
          确认
        </ButtonShadowGradient>
      </div>
      <SelectTokenDrawer
        tokens={[
          {
            logo: '/images/withdrawal/usdc.png',
            name: 'USDC',
            address: 'Arbitrum',
            chainId: ChainIds.Arbitrum,
            balance: 8.02,
            balanceInUsd: 782069.34,
          },
        ]}
        ref={null}
        open={openSelectTokenDrawer}
        onChange={function (token: {
          name: string
          address: string
          chainId: ChainIds
          logo: string
          balance: number
          balanceInUsd: number
        }): void {
          throw new Error('Function not implemented.')
        }}
        setOpen={setOpenSelectTokenDrawer}
      />
      <TransferAuthDrawer
        open={openTransferAuthDrawer}
        setOpen={setOpenTransferAuthDrawer}
        stepStates={stepStates}
        onStepStatusChange={(step, status) => {
          console.log(`Step ${step} changed to ${status}`)
        }}
      />
      <TransferResultModal
        open={openResultModal}
        setOpen={setOpenResultModal}
        type={resultType}
        amount="0.22"
        currency="USDC"
        onButtonClick={() => {
          setOpenResultModal(false)
        }}
      />
    </div>
  )
}

export default FuturesTransfer
