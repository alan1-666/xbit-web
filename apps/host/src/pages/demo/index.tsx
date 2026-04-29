import { useSelector } from 'react-redux'
import { _activeWallet, _walletDex } from '@/redux/modules/newWallet.slice'
import { useTurnkey } from '@turnkey/sdk-react'
import Decimal from 'decimal.js'
import {
  Contract,
  getAddress,
  JsonRpcProvider,
  TypedDataEncoder,
  Wallet
} from 'ethers'
import { CHAIN_CONFIGS } from '@/components/transfer/constants'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

const parseVectorSignature = (v: string) => {
  let vNum = parseInt(v, 16);
  if (vNum < 27) {
    vNum += 27;
  }

  return vNum
}

const DemoPermitDeposit = () => {
  const HYPERLIQUID_DEPOSIT_ADDRESS = '0x2df1c51e09aecf9cacb7bc98cb1742757f163df7';
  const activeWallet = useSelector(_walletDex)
  const walletAddress = activeWallet?.walletAddress
  const provider = new JsonRpcProvider(CHAIN_CONFIGS.ARBITRUM.rpc)
  const organizationId = useSelector(_userInfo)?.subOrgId
  const [txHash, setTxHash] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [fundingFeeWallet, setFundindFeeWallet] = useState<Wallet>();

  const updateFundingWallet = (pk: string) => {
    setFundindFeeWallet(new Wallet(pk, provider));
  }

  useEffect(() => {
    if (!walletAddress) return;
    (async () => {
      const usdcContract = new Contract(
        "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
        [
          "function balanceOf(address) view returns (uint256)"
        ],
        provider
      );
      const bal = await usdcContract.balanceOf(walletAddress);
      setBalance(new Decimal(bal.toString()).div(1e6).toNumber());
    })()
  }, [walletAddress, provider, loading]);

  const hyperliquidDepositWithPermitAbi = [
    {
      "inputs": [
        {
          "components": [
            { "internalType": "address", "name": "user", "type": "address" },
            { "internalType": "uint64", "name": "usd", "type": "uint64" },
            { "internalType": "uint64", "name": "deadline", "type": "uint64" },
            {
              "components": [
                { "internalType": "uint256", "name": "r", "type": "uint256" },
                { "internalType": "uint256", "name": "s", "type": "uint256" },
                { "internalType": "uint8", "name": "v", "type": "uint8" }
              ],
              "internalType": "struct Signature",
              "name": "signature",
              "type": "tuple"
            }
          ],
          "internalType": "struct DepositWithPermit[]",
          "name": "deposits",
          "type": "tuple[]"
        }
      ],
      "name": "batchedDepositWithPermit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  const hyperliquidDepositGate = new Contract(
    HYPERLIQUID_DEPOSIT_ADDRESS,
    hyperliquidDepositWithPermitAbi
  );
  const usdcContract = new Contract(
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    ["function nonces(address) view returns (uint256)", "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)"],
    provider
  );
  
  const { indexedDbClient } = useTurnkey();

  const getWalletNonce = useCallback(async () => {
    return await usdcContract.nonces(walletAddress);
  }, [walletAddress, provider]);

  const signPermitPayload = useCallback(async () => {
    if (!indexedDbClient || !walletAddress || !fundingFeeWallet) return;

    setLoading(true);
    try {
      const value = new Decimal(amount).mul(1e6).toNumber();
      const nonce = await getWalletNonce();
      const deadline = Math.floor(Date.now() / 1000) + 3600;
  
      const payload = {
          owner: walletAddress,
          spender: HYPERLIQUID_DEPOSIT_ADDRESS,
          value: value,
          nonce: nonce,
          deadline,
      };
      
      const domain = {
          name: "USD Coin",
          version: "2",
          chainId: 42161,
          verifyingContract: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      };
      
      const permitTypes = {
          Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
          ],
      };
      
      const signableData = TypedDataEncoder.hash(
        domain,
        permitTypes,
        payload,
      );

      const singedActivity = await indexedDbClient.signRawPayload({
        organizationId,
        signWith: getAddress(walletAddress),
        payload: signableData,
        encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
        hashFunction: 'HASH_FUNCTION_NO_OP',
      })
  
      const response: any = singedActivity;

      const { r, s, v } =
        response?.result?.signRawPayloadResult ?? singedActivity;
      const signature = {
        r: r.startsWith('0x') ? r : `0x${r}`,
        s: s.startsWith('0x') ? s : `0x${s}`,
        v: parseVectorSignature(v),
      };
  
      const txData = hyperliquidDepositGate.interface.encodeFunctionData("batchedDepositWithPermit", [[{
        user: walletAddress,
        usd: value,
        deadline,
        signature,
      }]])


      const tx = await fundingFeeWallet.sendTransaction({
        to: HYPERLIQUID_DEPOSIT_ADDRESS,
        data: txData,
        gasLimit: 500000,
      });
  
      setTxHash(tx.hash);
    } catch (error) {
      toast.error('Error: ' + (error as Error).message);
    }
    setLoading(false);
  }, [indexedDbClient, walletAddress, organizationId, provider, hyperliquidDepositGate, fundingFeeWallet, amount]);

  return (
    <>
      <div className="max-w-lg mx-auto p-8 bg-gray-100 rounded-lg shadow-md text-black">
        <span className="text-l font-bold mb-6 text-center">Your wallet address: { walletAddress } </span>
        <span className="text-l font-bold mb-6 text-center">Balance: { balance } </span>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            signPermitPayload()
          }}
        >
          <label htmlFor="fundingPrivateKey" className="text-sm font-medium">
            Funding fee wallet private key
          </label>
          <input
            type="text"
            id="fundingPrivateKey"
            name="fundingPrivateKey"
            className="p-2 text-sm border border-gray-300 rounded"
            required
            onChange={(e) => updateFundingWallet(e.target.value)}
          />

          <label htmlFor="depositAmount" className="text-sm font-medium">
            Deposit amount
          </label>
          <input
            type="number"
            id="depositAmount"
            name="depositAmount"
            className="p-2 text-sm border border-gray-300 rounded"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className={`relative flex items-center justify-center py-2 px-4 text-sm font-bold text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              loading ? "opacity-75 cursor-wait" : ""
            }`}
          >
            {loading && (
              <span className="absolute left-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>

        <p>Result txhash:</p>
        <a href={`https://arbiscan.io/tx/${txHash}`} className="text-blue-500 underline break-all" target="_blank" rel="noopener noreferrer">
          { txHash }
        </a>
      </div>
    </>
  )
}

export default DemoPermitDeposit
