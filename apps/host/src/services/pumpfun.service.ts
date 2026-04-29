import { SOL_ADDRESS, solanaMemeProxyConnection } from '@/lib/blockchain'
import {
  Commitment,
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { PLATFORM_FEE_PERCENT, PreOrder, SLOT0_TIP_ACCOUNT, SLOT0_TIP_AMOUNT, SOL_FEE_ACCOUNT, TOKEN_2022_PROGRAM_ADDRESS } from './onchain.service'
import Decimal from 'decimal.js'
import { createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Pump } from './pumpfun/pumpfun'
import { default as IDL } from './pumpfun/idl.json'
import { BN } from 'bn.js'
import { GlobalAccount } from './pumpfun/globalAccount'
import { BondingCurveAccount } from './pumpfun/bondingAccount'
import { sleep } from '@/utils/time'

export const BONDING_CURVE_SEED = 'bonding-curve'
export const CREATOR_VAULT_SEED = 'creator-vault'
export const PUMPFUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
export const GLOBAL_ACCOUNT_SEED = 'global'

const provider = new AnchorProvider(
  solanaMemeProxyConnection,
  {
    publicKey: new PublicKey('11111111111111111111111111111111'),
    signAllTransactions: async (txs) => txs,
    signTransaction: async (tx) => tx,
  },
  { commitment: 'confirmed' },
)

const PUMPFUN_PROGRAM = new Program<Pump>(IDL as Pump, provider)
enum TRANSACTION_TYPE {
  Buy = 'Buy',
  Sell = 'Sell',
}

const MAYHEM_FEE_RECIPIENT = [
  new PublicKey("GesfTA3X2arioaHp8bbKdjG9vJtskViWACZoYvxp4twS"),
  new PublicKey("4budycTjhs9fD6xw62VBducVTNgMgJJ5BgtKq7mAZwn6"),
  new PublicKey("8SBKzEQU4nLSzcwF4a74F2iaUDQyTfjGndn6qUWBnrpR"),
  new PublicKey("4UQeTP1T39KZ9Sfxzo3WR5skgsaP6NZa87BAkuazLEKH"),
  new PublicKey("8sNeir4QsLsJdYpc9RZacohhK1Y5FLU3nC5LXgYB4aa6"),
  new PublicKey("Fh9HmeLNUMVCvejxCtCL2DbYaRyBFVJ5xrWkLnMH6fdk"),
  new PublicKey("463MEnMeGyJekNZFQSTUABBEbLnvMTALbT6ZmsxAbAdq"),
  new PublicKey("6AUH3WEHucYZyC61hqpqYUWVto5qA5hjHuNQ32GNnNxA"),
]

export const buildPumpfunTransaction = async (
  order: PreOrder,
  lastBlockHash?: string,
  feeAccount?: string,
  platformFeePercent?: number,
): Promise<string | null> => {
  const { amount, inputDecimals, inputMint, slippage, userAddress, outputMint, } = order
  if (inputMint !== SOL_ADDRESS && outputMint !== SOL_ADDRESS) {
    return null
  }

  const transactionType = inputMint === SOL_ADDRESS ? TRANSACTION_TYPE.Buy : TRANSACTION_TYPE.Sell
  const tokenAmount = Decimal(amount)
    .mul(10 ** inputDecimals)
    .toNumber()
  const slippageBps = Math.floor(slippage * 10_000)
  let baseMint = inputMint
  let expectedSolAmount = 0n
  if (inputMint === SOL_ADDRESS) {
    baseMint = order.outputMint
  }
  const associatedUserLegacy = await getAssociatedTokenAddress(
    new PublicKey(baseMint),
    new PublicKey(order.userAddress),
    false,
  )
  const associatedUserToken2022 = await getAssociatedTokenAddress(
    new PublicKey(baseMint),
    new PublicKey(order.userAddress),
    false,
    TOKEN_2022_PROGRAM_ID
  )
  const bondingAssociatedPDA = getBondingCurvePDA(new PublicKey(baseMint))

  // default legacy version token
  let associatedUser = associatedUserLegacy
  const [associatedUserData, bondingCurveAccountData, associatedUser2022Data, tokenData] = await solanaMemeProxyConnection.getMultipleAccountsInfo(
    [associatedUserLegacy, bondingAssociatedPDA, associatedUserToken2022, new PublicKey(baseMint)],
    'confirmed',
  ) // calls
  
  let isNewUser = !associatedUserData || !associatedUserData?.data?.length
  let isToken2022 = false
  if (tokenData?.owner?.toBase58() === TOKEN_2022_PROGRAM_ADDRESS) {
    associatedUser = associatedUserToken2022
    isNewUser = !associatedUser2022Data || !associatedUserData?.data?.length
    isToken2022 = true
  }

  const bondingAccount = await getPumpfunBondingCurveAccount(bondingCurveAccountData!.data, new PublicKey(baseMint))
  // todo: reduce call

  if (!bondingAccount) {
    return null
  }

  if (bondingAccount.complete) {
    return null
  }
  const vaultCreatorPDA = getCreatorVaultAccount(bondingAccount.creator)

  let legacyTransaction = new Transaction()
  // const computeUnitSettingTxs = [
  //   ComputeBudgetProgram.setComputeUnitLimit({
  //     units: 100_000,
  //   })
  // ]
  const computeBudgetProgramId = ComputeBudgetProgram.programId

  // Data encoding for `SetComputeUnitLimit`:
  // Discriminator (1 byte): 0x02
  // Units (4 bytes LE): 100_000 → 0xA08601
  const data = Buffer.from([0x02, 0xa0, 0x86, 0x01, 0x00])

  const customAccount = new PublicKey('jitodontfront111111111111111111111111111111')

  const computeUnitSettingTxs = [
    new TransactionInstruction({
      programId: computeBudgetProgramId,
      keys: [
        {
          pubkey: customAccount,
          isSigner: false,
          isWritable: false,
        },
      ],
      data,
    }),
  ]

  if (order.priorityFeePrice) {
    const priorityFeePrice = order.priorityFeePrice.toNumber()
    computeUnitSettingTxs.push(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityFeePrice,
      }),
    )
  }

  if (!GLOBAL_ACCOUNT) {
    GLOBAL_ACCOUNT = await getGlobalAccount()
  }

  let feeRecipient = GLOBAL_ACCOUNT.feeRecipient
  if (bondingAccount.isMayhemMode) {
    feeRecipient = MAYHEM_FEE_RECIPIENT[Math.floor(Math.random() * MAYHEM_FEE_RECIPIENT.length)]
  }

  if (transactionType === TRANSACTION_TYPE.Sell) {
    const minSolOutput = bondingAccount.getSellPrice(BigInt(tokenAmount), GLOBAL_ACCOUNT.feeBasisPoints)
    expectedSolAmount = minSolOutput

    const minSolOutputWithSlippage = calculateWithSlippageSell(minSolOutput, BigInt(slippageBps))

    legacyTransaction = await getSellInstructions(
      new PublicKey(userAddress),
      new PublicKey(baseMint),
      feeRecipient,
      BigInt(tokenAmount),
      minSolOutputWithSlippage,
      bondingAssociatedPDA,
      isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID,
    )
  } else {
    const collateralAmount = bondingAccount.getBuyPrice(BigInt(tokenAmount))
    expectedSolAmount = BigInt(tokenAmount)

    const collateralAmountWithSlippage = calculateWithSlippageBuy(collateralAmount, BigInt(slippageBps))
    legacyTransaction = await getBuyInstructions(
      new PublicKey(userAddress),
      new PublicKey(baseMint),
      feeRecipient,
      collateralAmount,
      collateralAmountWithSlippage,
      associatedUser,
      isNewUser,
      bondingAssociatedPDA,
      vaultCreatorPDA,
      isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID,
    )
  }

  const platformFeeTxs = []
  const platformFeeLamport = new Decimal(expectedSolAmount.toString()).mul(platformFeePercent !== undefined ? platformFeePercent : PLATFORM_FEE_PERCENT).toFixed(0)

  platformFeeTxs.push(
    SystemProgram.transfer({
      lamports: BigInt(platformFeeLamport),
      fromPubkey: new PublicKey(userAddress),
      toPubkey: new PublicKey(feeAccount ? feeAccount : SOL_FEE_ACCOUNT),
    }),
  )

  if (order.mevProtect) {
    const tipTx = SystemProgram.transfer({
      fromPubkey: new PublicKey(userAddress), // Sender's public key.
      toPubkey: new PublicKey(SLOT0_TIP_ACCOUNT[Math.floor(Math.random() * SLOT0_TIP_ACCOUNT.length)]),
      lamports: SLOT0_TIP_AMOUNT, // Amount to transfer as a tip (0.001 SOL in this case).
    })
    platformFeeTxs.push(tipTx)
  }

  let blockhash: string | null = null
  if (lastBlockHash) {
    blockhash = lastBlockHash
  } else {
    const blockhashRes = await solanaMemeProxyConnection.getLatestBlockhash('finalized')
    blockhash = blockhashRes.blockhash
  }

  const messageV0 = new TransactionMessage({
    payerKey: new PublicKey(userAddress),
    recentBlockhash: blockhash,
    instructions: [...computeUnitSettingTxs, ...legacyTransaction.instructions, ...platformFeeTxs],
  }).compileToV0Message()

  const transaction = new VersionedTransaction(messageV0)

  return Buffer.from(transaction.serialize()).toString('base64')
}

export const getPumpfunBondingCurveAccount = async (
  data: null | Buffer,
  mint: PublicKey,
  commitment: Commitment = 'confirmed',
) => {
  if (data) {
    return BondingCurveAccount.fromBuffer(data)
  }

  const tokenAccount = await solanaMemeProxyConnection.getAccountInfo(getBondingCurvePDA(mint), commitment) // calls
  if (!tokenAccount) {
    return null
  }
  return BondingCurveAccount.fromBuffer(tokenAccount!.data)
}

export const getBondingCurvePDA = (mint: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
    new PublicKey(PUMPFUN_PROGRAM_ID),
  )[0]
}

const getSellInstructions = async (
  userAddress: PublicKey,
  mint: PublicKey,
  feeRecipient: PublicKey,
  amount: bigint,
  minSolOutput: bigint,
  bondingAccount: PublicKey,
  tokenProgramID: PublicKey = TOKEN_PROGRAM_ID,
) => {
  // const bondingCurveAccount = getBondingCurvePDA(mint)

  // const associatedBondingCurve = await getAssociatedTokenAddress(
  //   mint,
  //   bondingCurveAccount,
  //   true
  // );
  const associatedBondingCurve = await getAssociatedTokenAddress(mint, bondingAccount, true, tokenProgramID)

  const associatedUser = await getAssociatedTokenAddress(mint, userAddress, false, tokenProgramID)

  let transaction = new Transaction()

  transaction.add(
    await PUMPFUN_PROGRAM.methods
      .sell(new BN(amount.toString()), new BN(minSolOutput.toString()))
      .accounts({
        feeRecipient: feeRecipient,
        mint: mint,
        associatedUser: associatedUser,
        user: userAddress,
        associatedBondingCurve: associatedBondingCurve,
        tokenProgram: tokenProgramID,
      })
      .transaction(),
  )

  return transaction
}

export const getGlobalAccount = async (commitment: Commitment = 'confirmed') => {
  const [globalAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_ACCOUNT_SEED)],
    new PublicKey(PUMPFUN_PROGRAM_ID),
  )

  const tokenAccount = await solanaMemeProxyConnection.getAccountInfo(globalAccountPDA, commitment)

  return GlobalAccount.fromBuffer(tokenAccount!.data)
}

export const calculateWithSlippageBuy = (amount: bigint, basisPoints: bigint) => {
  return amount + (amount * basisPoints) / 10000n
}

export const calculateWithSlippageSell = (amount: bigint, basisPoints: bigint) => {
  return amount - (amount * basisPoints) / 10000n
}

export const getBuyInstructions = async (
  buyer: PublicKey,
  mint: PublicKey,
  feeRecipient: PublicKey,
  amount: bigint,
  solAmount: bigint,
  associatedUser: PublicKey,
  isNewUser: boolean = false,
  bondingAccount: PublicKey,
  creatorVault: PublicKey,
  tokenProgramID: PublicKey = TOKEN_PROGRAM_ID,
  commitment: Commitment = 'confirmed',
) => {
  const associatedBondingCurve = await getAssociatedTokenAddress(mint, bondingAccount, true, tokenProgramID)
  let transaction = new Transaction()

  if (isNewUser) {
    transaction.add(createAssociatedTokenAccountIdempotentInstruction(buyer, associatedUser, buyer, mint, tokenProgramID))
  }

  transaction.add(
    await PUMPFUN_PROGRAM.methods
      .buy(new BN(amount.toString()), new BN(solAmount.toString()), {0: true})
      .accounts({
        feeRecipient: feeRecipient,
        mint: mint,
        associatedUser: associatedUser,
        user: buyer,
        bondingCurve: bondingAccount,
        associatedBondingCurve: associatedBondingCurve,
        creatorVault: creatorVault,
        tokenProgram: tokenProgramID,
      })
      .transaction(),
  )

  return transaction
}

export const getCreatorVaultAccount = (creator: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(CREATOR_VAULT_SEED), creator.toBuffer()],
    new PublicKey(PUMPFUN_PROGRAM_ID),
  )[0]
}

let GLOBAL_ACCOUNT: GlobalAccount | null

export const getGlobalAccountRetryable = async (
  commitment: Commitment = 'confirmed',
): Promise<GlobalAccount> => {
  const [globalAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_ACCOUNT_SEED)],
    new PublicKey(PUMPFUN_PROGRAM_ID),
  )

  const tokenAccount = await solanaMemeProxyConnection.getAccountInfo(globalAccountPDA, commitment)

  if (!tokenAccount?.data) throw new Error('Global account not found')

  return GlobalAccount.fromBuffer(tokenAccount.data)
}

(async () => {
  const maxRetries = 10
  let retryCount = 0
  let delay = 1000

  while (retryCount < maxRetries) {
    try {
      GLOBAL_ACCOUNT = await getGlobalAccountRetryable()
      break
    } catch (err) {
      retryCount++
      if (retryCount >= maxRetries) {
        console.error('Max retries reached. Unable to fetch GLOBAL_ACCOUNT:', err)
        break
      }
      console.warn(`Retrying getGlobalAccount in ${delay}ms (attempt ${retryCount}):`, err)
      await sleep(delay)
      delay = delay * (2**retryCount)
    }
  }
})()
