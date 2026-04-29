import React, { useState, useEffect } from 'react';
import { RangoClient } from 'rango-sdk-basic';
import { Connection, PublicKey, Transaction, SystemProgram, VersionedTransaction, Message } from '@solana/web3.js';
import { BitgetWalletAdapter, BitgetWalletName } from '@/lib/wallets/BitgetWalletAdapter'
import { Buffer } from 'buffer';
import { parseUnits } from "viem";


window.Buffer = Buffer; // 将 Buffer 设为全局变量

// 支持的区块链和代币数据
const BLOCKCHAINS = [
  { id: 'SOLANA', name: 'Solana', type: 'SOLANA' }
];

const SAMPLE_TOKENS = {
  SOLANA: [
    { symbol: 'SOL', address: null, decimals: 9, blockchain: 'SOLANA' },
    { symbol: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, blockchain: 'SOLANA' }
  ]
};

const RangoSwapWidget = () => {
  // Solana钱包状态
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [solanaPublicKey, setSolanaPublicKey] = useState(null);
  
  // 交易状态
  const [fromChain, setFromChain] = useState('SOLANA');
  const [toChain, setToChain] = useState('SOLANA');
  const [fromToken, setFromToken] = useState(SAMPLE_TOKENS.SOLANA[0]);
  const [toToken, setToToken] = useState(SAMPLE_TOKENS.SOLANA[0]);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [status, setStatus] = useState('');
  const [step, setStep] = useState('connect');

  // 初始化Rango客户端
  const rango = new RangoClient('c6381a79-2817-4602-83bf-6a641a409e32');

  // 检查钱包连接状态
  useEffect(() => {
    setStep(solanaWallet !== null ? 'input' : 'connect');
  }, [solanaWallet]);

  // 链变化时更新代币
  useEffect(() => {
    setFromToken(SAMPLE_TOKENS[fromChain][0]);
  }, [fromChain]);

  useEffect(() => {
    setToToken(SAMPLE_TOKENS[toChain][0]);
  }, [toChain]);

  // 连接Solana钱包
  const connectSolanaWallet = async () => {
    try {
      setLoading(true);
      setStatus('正在连接Solana钱包...');
      
      if (window.bitget || window.bitkeep) {
        const wallet = new BitgetWalletAdapter()
        await wallet.connect();
        setSolanaWallet(wallet);
        console.log('wallet.publicKey.toString()', wallet.publicKey.toString())
        setSolanaPublicKey(wallet.publicKey.toString());
        setStatus('');
      } else {
        throw new Error('请安装Phantom钱包');
      }
    } catch (error) {
      console.error('连接Solana钱包失败:', error);
      setStatus(`连接失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = async () => {
    try {
      await solanaWallet?.disconnect();
      setSolanaWallet(null);
      setSolanaPublicKey(null);
    } catch (error) {
      console.error('断开连接失败:', error);
    }
  };

  // 获取当前连接的钱包地址
  const getCurrentAddress = () => {
    return solanaPublicKey;
  };

  // 获取报价
  const fetchQuote = async () => {
    const currentAddress = getCurrentAddress();
    if (!currentAddress) {
      alert('请先连接钱包');
      return;
    }

    if (!amount || isNaN(amount)) {
      alert('请输入有效金额');
      return;
    }

    setLoading(true);
    setStatus('获取报价中...');
    console.log('solanaPublicKey', solanaPublicKey)
    try {
      const decimals = fromToken.decimals || 9;
      const amountInWei = parseUnits(amount, decimals).toString();
      
      const quoteResponse = await rango.quote({
        from: {
          blockchain: fromChain,
          symbol: fromToken.symbol,
          address: fromToken.address
        },
        to: {
          blockchain: toChain,
          symbol: toToken.symbol,
          address: toToken.address
        },
        amount: amountInWei,
        fromAddress: currentAddress,
        toAddress: currentAddress,
        slippage: 1.0
      });

      console.log('quoteResponse', quoteResponse)

      setQuote(quoteResponse);
      setStep('quote');
    } catch (error) {
      console.error('获取报价失败:', error);
      setStatus(`获取报价失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeSolanaSwap = async () => {
    if (!quote || !solanaWallet || !solanaPublicKey) {
      alert('请先连接Solana钱包');
      return;
    }
  
    setLoading(true);
    setStep('swap');
    
    const connection = new Connection('https://bold-damp-ensemble.solana-mainnet.quiknode.pro/1c8794bfad096e455ce87d17b00dc942af2f88ea/', {
      commitment: 'confirmed'
    });
  
    try {
      setStatus('准备Solana交易...');
      
      const amountInWei = parseUnits(amount, fromToken.decimals).toString();
      let params = {
        from: {
          blockchain: fromChain,
          symbol: fromToken.symbol,
          address: fromToken.address
        },
        to: {
          blockchain: toChain,
          symbol: toToken.symbol,
          address: toToken.address
        },
        amount: amountInWei,
        fromAddress: solanaPublicKey,
        toAddress: solanaPublicKey,
        disableEstimate: true,
        slippage: 1.0
      }

      const swapResponse = await rango.swap(params);
  
      console.log('Solana swap response:', swapResponse);
  
      // 执行主交易
      setStatus('执行交换交易...');
      
      let txHash;
      if (swapResponse.tx.txType === 'VERSIONED') {
        try {
          if (!swapResponse.tx.serializedMessage || 
              !Array.isArray(swapResponse.tx.serializedMessage)) {
            throw new Error('无效的版本化交易数据: serializedMessage缺失或格式错误');
          }
          console.log('Raw serializedMessage:', swapResponse.tx.serializedMessage);
          
          const messageBytes = Uint8Array.from(swapResponse.tx.serializedMessage);
          const versionedTx = VersionedTransaction.deserialize(messageBytes);

          console.log('versionedTx:', versionedTx);
          console.log('versionedTx feePayer:', versionedTx.feePayer);
          
          console.log('solanaWallet.publicKey.toBase58()', solanaWallet.publicKey.toBase58())
          
          // 签名并发送
          const signedTx = await solanaWallet.signTransaction(versionedTx);
          const txHash = await connection.sendRawTransaction(signedTx.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
          });
      
          // 获取最新区块哈希用于确认
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
          
          // 等待确认
          await connection.confirmTransaction({
            signature: txHash,
            blockhash,
            lastValidBlockHeight
          }, 'confirmed');
      
          return txHash;
      
        } catch (versionedError) {
          console.error('版本化交易失败:', versionedError);
          throw new Error('仅支持版本化交易，且交易执行失败');
        }
      }
  
      setTxHash(txHash);
      setStatus('等待交易确认...');
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: txHash,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');
  
      setStatus('交易成功完成!');
      setStep('complete');
    } catch (error) {
      console.error('Solana交换失败:', error);
      let errorMsg = '交换失败';
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          errorMsg = '用户取消了交易';
        } else if (error.message.includes('Blockhash not found')) {
          errorMsg = '网络超时，请重试';
        }
      }
      setStatus(`${errorMsg}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // 重置表单
  const resetForm = () => {
    setAmount('');
    setQuote(null);
    setTxHash(null);
    setStatus('');
    setStep('input');
  };

  function formatWei(weiValue, decimals = 18) {
    const paddedValue = weiValue.padStart(decimals + 1, '0');
    const integerPart = paddedValue.slice(0, -decimals) || '0';
    const decimalPart = paddedValue.slice(-decimals).replace(/0+$/, '');
    
    return decimalPart.length > 0 
      ? `${integerPart}.${decimalPart}`
      : integerPart;
  }

  // 渲染连接钱包按钮
  const renderConnectButtons = () => {
    return (
      <div className="space-y-3">
        <button
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          onClick={connectSolanaWallet}
          disabled={loading}
        >
          {loading ? '连接中...' : '连接Solana钱包'}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 text-black bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">跨链交换</h2>
        {solanaWallet && (
          <button
            onClick={disconnectWallet}
            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            断开连接
          </button>
        )}
      </div>
      
      {step === 'connect' && (
        <div className="text-center p-4">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="mb-6 text-gray-600">
            '请连接Solana钱包以继续'
          </p>
          {renderConnectButtons()}
        </div>
      )}

      {step === 'input' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">来源链</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={fromChain}
                onChange={(e) => setFromChain(e.target.value)}
              >
                {BLOCKCHAINS.map((chain) => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目标链</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={toChain}
                onChange={(e) => setToChain(e.target.value)}
              >
                {BLOCKCHAINS.map((chain) => (
                  <option key={chain.id} value={chain.id}>{chain.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">来源代币</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={fromToken.symbol}
              onChange={(e) => {
                const selected = SAMPLE_TOKENS[fromChain].find(t => t.symbol === e.target.value);
                setFromToken(selected || SAMPLE_TOKENS[fromChain][0]);
              }}
            >
              {SAMPLE_TOKENS[fromChain].map((token) => (
                <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目标代币</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={toToken.symbol}
              onChange={(e) => {
                const selected = SAMPLE_TOKENS[toChain].find(t => t.symbol === e.target.value);
                setToToken(selected || SAMPLE_TOKENS[toChain][0]);
              }}
            >
              {SAMPLE_TOKENS[toChain].map((token) => (
                <option key={token.symbol} value={token.symbol}>{token.symbol}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">金额</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={fetchQuote}
            disabled={loading || !amount}
          >
            {loading ? '加载中...' : '获取报价'}
          </button>
        </div>
      )}

      {step === 'quote' && quote && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-3 text-gray-800">交换详情</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">发送:</span>
                <span className="font-medium">{amount} {fromToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">接收:</span>
                <span className="font-medium">{formatWei(quote.route.outputAmount) } {toToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">预估Gas费:</span>
                <span className="font-medium">{quote.route.priceImpactUsd} {fromToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">滑点容忍度:</span>
                <span className="font-medium">1%</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => setStep('input')}
            >
              返回
            </button>
            <button
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={executeSolanaSwap}
            >
              确认交换
            </button>
          </div>
        </div>
      )}

      {(step === 'approve' || step === 'swap') && (
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium mb-2">{status}</p>
          <p className="text-sm text-gray-500">请在钱包中确认交易</p>
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center p-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">交易成功完成!</h3>
          <div className="mb-4 p-3 bg-gray-50 rounded break-all text-sm">
            <p className="text-gray-600">交易哈希:</p>
            <p className="text-blue-500">{txHash}</p>
          </div>
          <button
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={resetForm}
          >
            新的交换
          </button>
        </div>
      )}

      {status && !loading && step !== 'complete' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          {status}
        </div>
      )}
    </div>
  );
};

export default RangoSwapWidget;