import ButtonGradient from '@/components/common/buttons/ButtonGradient'
import {
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  FailCircleIcon,
} from '@/components/wallet-backup/icon'
import React, { useState, useEffect } from 'react'
import HeaderBackTransparent from '@/components/header/HeaderBackTransparent'
import { useTranslation } from 'react-i18next'

const MOCK_MNEMONIC = [
  'abandon',
  'ability',
  'able',
  'about',
  'above',
  'absent',
  'absorb',
  'abstract',
  'absurd',
  'abuse',
  'access',
  'accident',
]

type ScreenType = 'hidden' | 'verify' | 'verifying'

const MnemonicBackupChecklistPage: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('hidden')
  const [mnemonicRevealed, setMnemonicRevealed] = useState(false)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const { t } = useTranslation()

  // ...existing code...

  useEffect(() => {
    if (currentScreen === 'verify') {
      setShuffledWords(MOCK_MNEMONIC)
    }
  }, [currentScreen])

  const handleRevealMnemonic = () => {
    setMnemonicRevealed(true)
  }

  const handleProceedToShown = () => {
    if (mnemonicRevealed) {
      setCurrentScreen('verify')
    } else {
      handleRevealMnemonic()
    }
  }

  const handleWordSelect = (word: string) => {
    if (selectedWords.length < 12 && !selectedWords.includes(word)) {
      setSelectedWords([...selectedWords, word])
    }
  }

  const handleWordRemove = (index: number) => {
    const newSelectedWords = selectedWords.filter((_, i) => i !== index)
    setSelectedWords(newSelectedWords)
  }

  const handleStartVerifying = () => {
    console.log('verifying')
  }

  const getRemainingWords = () => {
    return shuffledWords
  }

  const renderHiddenScreen = () => (
    <div className="flex-1 flex flex-col px-3">
      <h2 className="text-[1.375rem] font-[380] text-white">{t('walletBackup.mnemonicChecklist.backupTitle')}</h2>
      <div className="flex flex-col gap-4 mt-[13px] text-xs">
        <div className="flex items-center gap-2">
          <CheckCircleIcon />
          {t('walletBackup.mnemonicChecklist.recommendations.handwrite')}
        </div>
        <div className="flex items-center gap-2">
          <FailCircleIcon />
          {t('walletBackup.mnemonicChecklist.recommendations.noCopy')}
        </div>
        <div className="flex items-center gap-2">
          <FailCircleIcon />
          {t('walletBackup.mnemonicChecklist.recommendations.noScreenshot')}
        </div>
      </div>
      <p className="text-sm text-white/50 mt-3">
        {t('walletBackup.mnemonicChecklist.backupInstructions')}
      </p>

      {!mnemonicRevealed ? (
        <div className="w-full flex flex-col items-center justify-center bg-[#ECECED]/4 mt-5 rounded-[8px] pt-[98px] pb-[66px]">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <EyeIcon />
          </div>
          <p className="text-white/50 text-sm text-center mb-4">
            {t('walletBackup.mnemonicChecklist.showMnemonic')} <br /> {t('walletBackup.mnemonicChecklist.showMnemonicWarning')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 w-full mt-5">
            {MOCK_MNEMONIC.map((word, index) => (
              <div
                key={index}
                className="bg-[#ECECED]/4 rounded-[8px] px-3 py-[11px] text-center flex gap-2 items-center border border-[#ECECED]/8"
              >
                <span className="text-sm text-white/50">{index + 1}</span>
                <span className="text-sm text-white font-medium">{word}</span>
              </div>
            ))}
          </div>
          <div className="text-end">
            <button
              onClick={() => setMnemonicRevealed(false)}
              className="mt-2.5 inline-flex items-center gap-1 px-3 py-[11px] bg-[#ECECED]/12 rounded-[200px] text-sm font-[380]"
            >
              {t('walletBackup.mnemonicChecklist.hide')} <EyeOffIcon />
            </button>
          </div>
        </>
      )}

      <div className="flex-1"></div>

      <ButtonGradient className="rounded-full w-full max-h-11 text-base mt-6 mb-3" onClick={handleProceedToShown}>
        {t('walletBackup.mnemonicChecklist.nextStep')}
      </ButtonGradient>
    </div>
  )

  const renderVerifyScreen = () => (
    <div className="flex-1 flex flex-col px-3">
      <h2 className="text-[1.375rem] font-[380] text-white">{t('walletBackup.mnemonicChecklist.verifyTitle')}</h2>
      <p className="text-sm text-white/50 mt-3">{t('walletBackup.mnemonicChecklist.verifyInstructions')}</p>

      <div className="mt-6 bg-[#232329] rounded-2xl px-3 py-4 ">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className={`rounded-lg px-3 py-[11px] inline-flex items-center h-10 ${
                selectedWords[index]
                  ? selectedWords[index] !== shuffledWords[index]
                    ? 'border bg-[#DC1162]/10 border-[#F23F58]'
                    : 'bg-white/8 border border-[#ECECED]/8'
                  : ''
              }`}
            >
              {selectedWords[index] ? (
                <button
                  onClick={() => handleWordRemove(index)}
                  className="w-full text-sm inline-flex gap-2 items-center"
                >
                  <span className=" text-white/50 ">{index + 1}</span>
                  <span className=" text-white ">{selectedWords[index]}</span>
                </button>
              ) : (
                <> </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 mt-3 px-3 py-4 ">
        <div className="grid grid-cols-3 gap-2.5">
          {getRemainingWords().map((word, index) => {
            const isSelected = selectedWords.includes(word)
            const selectedIndex = selectedWords.indexOf(word)
            const isCorrect = isSelected && selectedIndex !== -1 && MOCK_MNEMONIC[selectedIndex] === word
            const isIncorrect = isSelected && selectedIndex !== -1 && MOCK_MNEMONIC[selectedIndex] !== word

            return (
              <button
                key={index}
                onClick={() => handleWordSelect(word)}
                className={`py-[11px] px-3 rounded-lg text-sm ${
                  isIncorrect
                    ? 'bg-[#ECECED]/12 text-[#FFFFFF]/36'
                    : isCorrect
                      ? 'bg-white text-[#1A1A1A]/50'
                      : 'bg-white text-black'
                }`}
              >
                {word}
              </button>
            )
          })}
        </div>
      </div>

      <ButtonGradient
        className="rounded-full w-full max-h-11 text-base mt-6 mb-3"
        onClick={handleStartVerifying}
        disabled={selectedWords.length !== 12}
      >
        {t('walletBackup.mnemonicChecklist.complete')}
      </ButtonGradient>
    </div>
  )

  return (
    <div className="h-screen flex flex-col ">
      <HeaderBackTransparent title={''} className="!px-3" />
      {currentScreen === 'hidden' && renderHiddenScreen()}
      {currentScreen === 'verify' && renderVerifyScreen()}
    </div>
  )
}

export default MnemonicBackupChecklistPage