import { useEffect, useState } from 'react'
import { _activeWallet, newWalletActions } from '@/redux/modules/newWallet.slice'
import { useSelector } from 'react-redux'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useTurnkey } from '@turnkey/sdk-react'
import { decryptExportBundle, generateP256KeyPair } from '@turnkey/crypto'
import { _userInfo } from '@/redux/modules/newAuth.slice'
import MnemonicBackupChecklistPage from '../WalletBackup/MnemonicBackupChecklist'

const PassPhaseComponent = () => {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [memonic, setMemonic] = useState<string[]>([])
  const isFirstLogin = useAppSelector((state) => state.newWallet.isFirstLogin)
  const verify = useAppSelector((state) => state.newWallet.verify)
  const { indexedDbClient } = useTurnkey()
  const userInfo = useSelector(_userInfo)
  const activeWallet = useSelector(_activeWallet)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (activeWallet?.isConnected && isFirstLogin && Object.keys(verify).length > 0 && userInfo) {
      onExportPassphrase()
    }
  }, [activeWallet, isFirstLogin, userInfo, verify])

  const onExportPassphrase = async () => {
    const keypair = generateP256KeyPair()
    const activity = await indexedDbClient?.exportWallet({
      walletId: activeWallet?.walletId,
      targetPublicKey: keypair.publicKeyUncompressed,
      language: 'MNEMONIC_LANGUAGE_ENGLISH',
    })

    decryptExportBundle({
      exportBundle: activity?.exportBundle as string,
      embeddedKey: keypair.privateKey,
      organizationId: userInfo?.subOrgId,
      returnMnemonic: true,
    }).then((res) => {
      if (res) {
        setMemonic(res.split(' '))
        setOpenDrawer(true)
        dispatch(newWalletActions.updateVerifyWallet({}))
        dispatch(newWalletActions.updateIsFirstLogin(false))
      }
    })
  }

  return (
    <>
      <MnemonicBackupChecklistPage memonic={memonic} openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
    </>
  )
}

export default PassPhaseComponent
