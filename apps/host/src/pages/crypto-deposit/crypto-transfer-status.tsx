import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

interface TransferState {
  amount?: string;
  currency?: string;
  txId?: string;
  message?: string;
}

const StatusContent = {
  success: {
    status: "已到账",
    icon: <img src="/images/cryptoDeposit/success.svg" alt="Loading" />,
    className: "text-[#00FFB4]"
  },
  failed: {
    status: "兑换失败",
    icon: <img src="/images/cryptoDeposit/failed.svg" alt="Loading" />,
    className: "text-[#FF5449]"
  },
  pending: {
    status: "正在兑换",
    icon: <img src="/images/cryptoDeposit/pending.svg" alt="Loading" />,
    className: "text-[#00FFB4]"
  }
};

const CryptoTransferStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useLocation() as { state: TransferState };
  const status = searchParams.get('status') as keyof typeof StatusContent || 'pending';

  const currentStatus = StatusContent[status];
  const { amount, message } = state || {};

  const handleReturn = () => {
    navigate('/crypto-deposit');
  };

  return (
    <div className="min-h-screen p-4">
      <div className='h-[calc(100vh-32px)] flex flex-col'>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              {currentStatus.icon}
            </div>
            <h1 className={`text-[20px] font-bold text-[24px] ${currentStatus.className}`}>
              {amount} USDC 
            </h1>
            <p className="text-[24px] text-[#FFFFFF] mt-2">
              {currentStatus.status}
            </p>
            <p className="text-[14px] text-[#FFFFFFB2] mt-2">
              {message}
            </p>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={handleReturn}
            className="w-full h-[44px] bg-gradient-to-r from-[#5E3395] to-[#118E6C] rounded-[22px] text-white text-[14px] font-medium hover:scale-105 transition-transform"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoTransferStatus;
