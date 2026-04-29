import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { useState, useEffect, } from 'react'
import ButtonShadowGradient from '@/components/common/buttons/ButtonShadowGradient'
import { updateHyperLiquidWalletMutation, approveHyperLiquidApproveAgentMutation, approveHyperLiquidFeeBuilderMutation } from '@services/auth.service.ts'
import { userGqlClient } from '@/lib/gql/apollo-client'
import { toast } from 'sonner'
import { futuresUserInfoActions } from '@/redux/modules/futuresUserInfo.slice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { buildSignableData } from '@/utils/hyperliquidSign'
import { Configs } from '@/const/configs'
import ButtonGreen from '@/components/common/buttons/ButtonGreen'
import ls from '@/lib/local-storage'
import useCustomToast from '@/hooks/useCustomToast'
import { useTurnkey } from '@turnkey/sdk-react'
import { useDispatch, useSelector } from 'react-redux'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import { signStandardL1Action } from '../hooks/signing'
import { getAgentWalletByHashKey } from '@/utils/agent/agentWalletManager'
import { privateKeyToAccount } from 'viem/accounts'
import { agentWalletSelector } from '@/redux/modules/futuresUserInfo.slice'
import { useTranslation } from 'react-i18next'
import { OrderSide } from './type.order'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { _walletDex } from '@/redux/modules/newWallet.slice'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../../ui/dialog'
import { useResponsive } from '@/hooks/useResponsive'
import { isMobile } from '@/utils/os.ts'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import RestrictRegiongDialog from '@/components/RestrictRegiongDialog'
import { getAddress } from 'ethers'
import eventBus from '@/lib/eventBus.ts'
import { NEED_APPROVE } from '@/components/futuresDetails/helper/handleHyperliquidOrderError.ts'
import { checkHyperLiquidWallet } from '@services/auth.service.ts'
import { initAgentWalletIfNeeded, getAgentWallet, hasAgentWallet, getAgentWalletEncrypted, hashAddress } from '@/utils/agent/agentWalletManager'
import { useCheckLoginOnArb } from '@/hooks/hyperliquid/useCheckLoginOnArb'









const ButtonApproveAgent = () => {
  const { t } = useTranslation()
  // Block regional trading features
  const enabled = useFeatureIsOn('trading_block_zone')
  const [openRestrictRegiongDialog, setOpenRestrictRegiongDialog] = useState(false)

  // console.log('approveInfo', approveInfo)
  // console.log('walletAddress', walletAddress)
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const { showToast } = useCustomToast()
  const [isPending, setIsPending] = useState(false)

  const { indexedDbClient } = useTurnkey()
  const subOrgId = useSelector(_userInfo)?.subOrgId
  const walletDex = useSelector(_walletDex)
  const agentWallet = useAppSelector(agentWalletSelector)
  const { isDesktop } = useResponsive()
  const isLogin = useCheckLoginOnArb()
  

  const device = isMobile() ? 'mobile' : 'pc'

  const walletAddress = walletDex?.walletAddress

  const [approveInfo, setApproveInfo] = useState({
    feeBuilderAddress: '',
    feeBuilderPercent: '',
    agentName: isMobile() ? 'KAIROX_MOBILE' : 'KAIROX',
    agentAddress: '',
    referralCode: 'BWIN888'
  })

  const checkApproveAgent = async () => {
    const { data } = await userGqlClient.mutate({
      mutation: checkHyperLiquidWallet,
    })
    if (data?.checkHyperLiquidWallet) {
      const { feeBuilderAddress, feeBuilderPercent, referralCode, setFeeBuilder, setReferral } = data.checkHyperLiquidWallet
      const newFeeBuilderPercent = feeBuilderAddress.toLowerCase()
      setApproveInfo(prev => ({
        ...prev,
        feeBuilderAddress: newFeeBuilderPercent,
        feeBuilderPercent: `1%`,
        referralCode: referralCode
      }))
      // To do
      const f = 100000 * feeBuilderPercent / 100
      dispatch(
        futuresUserInfoActions.updateBuilderInfo({
          b: newFeeBuilderPercent,
          f: f
        })
      )

      const device = isMobile() ? 'mobile' : 'pc'
      const isExpired = Date.now() > (ls.get(`${walletDex?.walletAddress}_${device}_approve_expired_ts`) || 0)

      let isExistAgent = await hasAgentWallet(walletDex?.walletAddress)
      if (!isExistAgent || isExpired || !setFeeBuilder || !setReferral) {
        dispatch(
          futuresUserInfoActions.updateAuthorizationStatus(false)
        )
        await initAgentWalletIfNeeded(walletDex?.walletAddress)

      } else {
        dispatch(
          futuresUserInfoActions.updateAuthorizationStatus(true)
        )
      }

      const wallet = await getAgentWallet(walletDex?.walletAddress)
      const key = hashAddress(walletDex?.walletAddress)
      dispatch(
        futuresUserInfoActions.updateAgentWallet({
          key: key,
          id: walletDex?.walletAddress
        })
      )
      setApproveInfo(prev => ({
        ...prev,
        agentAddress: wallet.address
      }))


    }
  }

  


  const updateApproveAgentStastus = async () => {
    const { feeBuilderAddress, feeBuilderPercent } = approveInfo
    const now = Date.now();
    // hyperqliuid 默认过期时间是90天
    const sixtyDaysLater = now + 90 * 24 * 60 * 60 * 1000;
    let status: boolean



    const percent = parseFloat(feeBuilderPercent.replace('%', ''))
    try {
      await userGqlClient.mutate({
        mutation: updateHyperLiquidWalletMutation,
        variables: {
          input: {
            agentExpiredAt: sixtyDaysLater,
            setReferral: true,
            setFeeBuilder: true,
            feeBuilderAddress: feeBuilderAddress,
            feeBuilderPercent: percent,
            referralCode: approveInfo.referralCode
          }
        }
      })

      showToast(t('futuresDetails.loginAuth.approveSuccess'))
      status = true
      ls.set(`${walletAddress}_${device}_approve_expired_ts`, sixtyDaysLater)
    } catch (error) {
      showToast(t('futuresDetails.loginAuth.approveFailed'))
      status = false
    }

    dispatch(
      futuresUserInfoActions.updateAuthorizationStatus(status)
    )
  }

  const handleSetReferrer = async () => {
    const nonce = Date.now()

    const orderAction = {
      "type": "setReferrer",
      code: approveInfo.referralCode
    }

    try {
      const realAgentWallet = await getAgentWalletByHashKey(agentWallet.key)

      const wallet = privateKeyToAccount(realAgentWallet.privateKey)

      const signature = await signStandardL1Action(orderAction, wallet, null, nonce)

      const response = await fetch(`${Configs.getHyperliquidConfig().apiUrl}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: orderAction,
          nonce: nonce,
          signature: signature,
          vaultAddress: null
        })
      })

      const result = await response.json()

      if (result.response === 'Referrer already set') {
        return {
          status: true
        }
      }

      if (result.status === 'err') {
        return {
          status: false,
          info: result.response
        }
      }

      return {
        status: true
      }

    } catch (error) {
      return {
        status: false,
        info: typeof error === 'object' ? JSON.stringify(error) : error
      }
    }
  }

  const signatureApproveAgent = async () => {
    const { agentAddress, agentName } = approveInfo

    try {
      const operation = 'approveAgent'
      const payload = {
        agentAddress: agentAddress,
        agentName: agentName
      }
      const { signableData, nonce, message: action } = await buildSignableData({ operation, payload })
      const walletAddress = getAddress(walletDex?.walletAddress)


      const activityRes = await indexedDbClient?.signRawPayload({
        organizationId: subOrgId,
        signWith: walletAddress,
        payload: signableData,
        encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
        hashFunction: 'HASH_FUNCTION_KECCAK256',
      });

      const signature = activityRes?.activity?.result?.signRawPayloadResult
      if (!signature) {
        return {
          status: false,
          info: t('futuresDetails.loginAuth.getSignatureFailed')
        }
      }

      const response = await fetch(`${Configs.getHyperliquidConfig().apiUrl}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          nonce,
          signature: {
            r: `0x${signature.r}`,
            s: `0x${signature.s}`,
            v: Number(signature.v)
          }
        }),
      })

      const result = await response.json()

      if (result.response === 'Extra agent already used.') {
        return {
          status: true
        }
      }

      if (result.status === 'err') {
        return {
          status: false,
          info: result.response
        }
      }

      return {
        status: true
      }


    } catch (error) {
      return {
        status: false,
        info: typeof error === 'object' ? JSON.stringify(error) : error
      }
    }
  }


  const signatureSetBuilderFee = async () => {
    const { feeBuilderPercent, feeBuilderAddress } = approveInfo

    try {
      const operation = 'approveBuilderFee'
      const payload = {
        builder: feeBuilderAddress,
        maxFeeRate: feeBuilderPercent
      }

      const { signableData, nonce, message: action } = await buildSignableData({ operation, payload })
      const walletAddress = getAddress(walletDex?.walletAddress)

      const activityRes = await indexedDbClient?.signRawPayload({
        organizationId: subOrgId,
        signWith: walletAddress,
        payload: signableData,
        encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
        hashFunction: 'HASH_FUNCTION_KECCAK256',
      });


      const signature = activityRes?.activity?.result?.signRawPayloadResult
      if (!signature) {
        return {
          status: false,
          info: t('futuresDetails.loginAuth.getSignatureFailed')
        }
      }


      const response = await fetch(`${Configs.getHyperliquidConfig().apiUrl}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          nonce,
          signature: {
            r: `0x${signature.r}`,
            s: `0x${signature.s}`,
            v: Number(signature.v)
          }
        }),
      })

      const result = await response.json()


      if (result.status === 'err') {
        return {
          status: false,
          info: result.response
        }
      }

      return {
        status: true,
      }


    } catch (error) {
      return {
        status: false,
        info: typeof error === 'object' ? JSON.stringify(error) : error
      }
    }
  }

  const clearApproveStatus = () => {
    setIsPending(false)
    setOpen(false)
    ls.remove(`${walletAddress}_${device}_approve_expired_ts`)
  }


  const handleApproveAgent = async () => {
    if (!indexedDbClient || !subOrgId || !agentWallet) return
    setIsPending(true)
    Promise.all([signatureApproveAgent(), signatureSetBuilderFee()]).then(async (res) => {
      const signatureApproveAgentResult = res[0]
      if (!signatureApproveAgentResult.status) {
        signatureApproveAgentResult.info && showToast(signatureApproveAgentResult.info)
        clearApproveStatus()
        return
      }
      const signatureSetBuilderFeeResult = res[1]

      if (!signatureSetBuilderFeeResult.status) {
        signatureSetBuilderFeeResult.info && showToast(signatureSetBuilderFeeResult.info)
        clearApproveStatus()
        return
      }
      const setReferrerResult = await handleSetReferrer()

      if (!setReferrerResult.status) {
        setReferrerResult.info && showToast(setReferrerResult.info)
        clearApproveStatus()
        return
      }

      setIsPending(false)
      updateApproveAgentStastus()
      setOpen(false)
    }).catch((error) => {
      clearApproveStatus()
      error && showToast(error)
    });

  }

  useEffect(() => {
    if (isLogin && walletDex?.walletAddress) {
      checkApproveAgent()
    }
  }, [isLogin, walletDex?.walletAddress])

  useEffect(() => {
    setIsPending(false)
  }, [open])

  useEffect(() => {
    eventBus.on(NEED_APPROVE, (data: any) => {
      setOpen(true)
    })
    return () => {
      eventBus.remove(NEED_APPROVE)
    }
  }, [])

  const confirmModalContent = (
    <>
      <div className="relative">
        <div className="mb-[45px] xl:mb-10  relative flex items-center">
          {/* <div className='bg-[url(/images/futuresDetail/approve-index-1-active.png)] bg-cover bg-center  size-8 mr-2'></div> */}
          <img className='size-8 mr-2' src="/images/futuresDetail/approve-index-1.png" alt='' />
          <div className='flex-1'>
            <p className='mb-1.5 text-[#FFFFFF] text-[calc(1rem*(16/16))] leading-[calc(1rem*(16/16))]'>
              {t('futuresDetails.loginAuth.connect')}
            </p>
            <p className='text-[#FFFFFF80] text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]'>
              {t('futuresDetails.loginAuth.desc')}
            </p>
          </div>
        </div>

        <div className='mb-6 xl:mb-3  flex items-center'>
          <img className='size-8 mr-2' src="/images/futuresDetail/approve-index-2.png" alt='' />
          <div className='flex-1'>
            <p className='mb-1.5 text-[#FFFFFF] text-[calc(1rem*(16/16))] leading-[calc(1rem*(16/16))]'>
              {t('futuresDetails.loginAuth.approve')}
            </p>
            <p className='text-[#FFFFFF80] text-[calc(1rem*(13/16))] leading-[calc(1rem*(13/16))]'>
              {t('futuresDetails.loginAuth.approvedesc')}
            </p>
          </div>

        </div>
      </div>

      <div className='mb-9 xl:mb-5 flex items-center text-[#FFFFFF] text-[calc(1rem*(11/16))] leading-[calc(1rem*(15/16))]
        bg-[#FF1D1D1A] p-2 rounded-[8px]'>
        <img src="/images/futuresDetail/danger-icon.svg" className='mr-1.5' alt='' />
        {t('futuresDetails.loginAuth.warning')}
      </div>

      <Button
        variant="purpleDefault"
        className=" text-white w-full rounded-[50px]  text-[calc(1rem*(18/16))] h-[44px]"
        onClick={() => { handleApproveAgent() }}
        isLoading={isPending}
        disabled={isPending}
      >
        {t('futuresDetails.loginAuth.approve')}
      </Button>
    </>
  )
  const btnClass = 'bg-[var(--tab-buy-bg)]'
  const buttonChildrenClass = ''

  const TirggerCom = (
    
    <ButtonGreen
      className={cn(
        btnClass,
      )}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        setOpen(true)
      }}
      buttonChildrenClass={buttonChildrenClass}
    >
      {t('futuresDetails.loginAuth.button')}
    </ButtonGreen>
  )

  return (
    <>
    {isDesktop ? <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        {TirggerCom}
      </DialogTrigger> */}

      <DialogContent className="bg-[#232329]">
        <DialogHeader>
          <div className='flex items-center'>
            <DialogTitle className="text-[18px] ">{t('futuresDetails.common.marginMode')}</DialogTitle>
          </div>
        </DialogHeader>
        {confirmModalContent}

      </DialogContent>
    </Dialog>
      : <Drawer open={open} onOpenChange={setOpen}>
      
        <DrawerContent className="w-full bg-[#232329] max-w-[768px] mx-auto">
          <DrawerHeader className="py-5 px-3.5 flex w-full items-center justify-between">
            <DrawerTitle className="text-[calc(1rem*(18/16))] leading-[calc(1rem*(18/16))]">{t('futuresDetails.loginAuth.connect')}</DrawerTitle>
            <img
              src="/images/icons/icon-x.svg"
              className="w-6 h-6 cursor-pointer"
              onClick={() => setOpen(false)}
              alt="close"
            />
          </DrawerHeader>

          <div className="px-3 pb-8">
            {confirmModalContent}

          </div>
        </DrawerContent>
      </Drawer>}

      <RestrictRegiongDialog open={openRestrictRegiongDialog} setOpen={setOpenRestrictRegiongDialog} />
    </>
  )
}
export default ButtonApproveAgent