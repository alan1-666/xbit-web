import { ServiceConfig } from '@/lib/gql/service-config.js';
import { buildPumpfunTransaction } from '@/services/pumpfun.service.js';
import { Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import Decimal from 'decimal.js';

const PUMPFUN_SIGNING_TYPE = 'pumpfun-signing';
const SigningError = {
  INVALID_MESSAGE_TYPE: 'INVALID_MESSAGE_TYPE',
  INVALID_PRIVATE_KEY: 'INVALID_PRIVATE_KEY',
  TRANSACTION_BUILD_FAILED: 'TRANSACTION_BUILD_FAILED',
  SIGNING_ERROR: 'SIGNING_ERROR',
};

function sendResult(msg) {
  const FlutterChannel = window.FlutterChannel;
  if (FlutterChannel) {
    FlutterChannel.postMessage(JSON.stringify(msg));
  } else {
    window.parent.postMessage(msg, '*');
  }
}

// get access token from query
const accessToken = new URLSearchParams(window.location.search).get('access_token');
if (accessToken) {
  ServiceConfig.token = accessToken;
}

function handleEvent(event) {
  const { latestBlockhash, feeAccount, platformFeePercent, xbitRequestId, privateKey, type } = event.data;
  let keypair = null;

  if (!xbitRequestId) {
    return;
  }

  if (type !== PUMPFUN_SIGNING_TYPE) {
    sendResult({
      requestId: xbitRequestId,
      type: PUMPFUN_SIGNING_TYPE,
      error: SigningError.INVALID_MESSAGE_TYPE,
    });
    return;
  }

  try {
    keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
  } catch (error) {
    console.error('Failed to decode private key:', error);
    sendResult({
      requestId: xbitRequestId,
      type: PUMPFUN_SIGNING_TYPE,
      error: SigningError.INVALID_PRIVATE_KEY,
    });
    return;
  }

  if (!keypair) {
    sendResult({
      requestId: xbitRequestId,
      type,
      error: SigningError.INVALID_PRIVATE_KEY,
    });
    return;
  }

  const order = {
    userAddress: event.data.userAddress,
    inputMint: event.data.inputMint,
    outputMint: event.data.outputMint,
    amount: new Decimal(event.data.amount),
    inputDecimals: event.data.inputDecimals,
    slippage: event.data.slippage,
    priorityFeePrice: new Decimal(event.data.priorityFeePrice),
    mevProtect: event.data.mevProtect,
    isToken2022: event.data.isToken2022,
    priorityFee: null,
  };

  buildPumpfunTransaction(order, latestBlockhash, feeAccount, platformFeePercent)
    .then((tx) => {
      if (!tx) {
        sendResult({
          type: PUMPFUN_SIGNING_TYPE,
          error: SigningError.TRANSACTION_BUILD_FAILED,
          requestId: xbitRequestId,
        });
        return;
      }
      const transactionBuff = Buffer.from(tx, 'base64');
      const versionedTransaction = VersionedTransaction.deserialize(transactionBuff);
      try {
        versionedTransaction.sign([keypair]);
        sendResult({
          type: PUMPFUN_SIGNING_TYPE,
          error: null,
          signedTx: Buffer.from(versionedTransaction.serialize()).toString('base64'),
          requestId: xbitRequestId,
        });
      } catch (error) {
        console.error('Failed to sign transaction:', error);
        sendResult({
          type: PUMPFUN_SIGNING_TYPE,
          error: SigningError.SIGNING_ERROR,
          requestId: xbitRequestId,
        });
      }
    });
}

window.addEventListener('message', handleEvent);
