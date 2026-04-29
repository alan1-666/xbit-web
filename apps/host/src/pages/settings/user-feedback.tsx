import HeaderWithBack from '@components/header/HeaderWithBack.tsx'
import { useTranslation } from 'react-i18next'
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { CopyButton } from '@components/common/copy-button.tsx'
import { SelectableDrawer } from '@components/settings/SelectableDrawer.tsx'
import { cn } from '@/lib/utils.ts'
import { IconX } from '@components/icon'
import { Link } from 'react-router-dom'
import { APP_PATH } from '@/lib/constant.ts'

const mockReasons = [
  '问题问题问题问题问题问题问题问题',
  '问题问题问题问题问题问题问题',
  '问题问题问题问题问题',
  '问题问题问题问题',
  '问题问题问题问题问题问题问题问题',
]

const Label = ({ title }: { title: string }) => {
  return <div className="text-[calc(14rem/16)] text-[#FFFFFFA6] mb-2">{title}</div>
}

const InputWrapper = ({
  children,
  suffix,
  className,
}: {
  children: ReactNode
  suffix?: ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        'flex items-center px-3 py-4 bg-[#232329] rounded-[10px] text-[#FFFFFF80] text-[calc(14rem/16)] gap-2.5 cursor-pointer',
        className,
      )}
    >
      {children}
      {suffix}
    </div>
  )
}

const convertFileToImage = (file: File) => {
  return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

const UploadedImage = ({ file, onRemoved }: { file: File; onRemoved: () => void }) => {
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null)

  useEffect(() => {
    convertFileToImage(file)
      .then((src) => setImageSrc(src))
      .catch((error) => console.error('Error reading file:', error))
  }, [file])

  return (
    <div className="relative group cursor-pointer">
      <img src={imageSrc as string} alt={file.name} className="w-20 h-20 object-cover rounded-[8px]" />
      <button
        className="absolute top-0 right-0 size-4 hidden group-hover:flex text-white bg-red-500 rounded-full p-1 items-center justify-center"
        onClick={() => onRemoved()}
      >
        <IconX />
      </button>
    </div>
  )
}

export const UserFeedbackPage = () => {
  const { t } = useTranslation()
  const [category, setCategory] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles)
      const currentFiles = [...files]
      const newFiles = fileArray.filter((file) => !currentFiles.some((f) => f.name === file.name))
      setFiles((prevFiles) => [...prevFiles, ...newFiles])
      event.target.value = '' // Clear the input value to allow re-selection of the same file
    }
  }

  const handleFileRemoval = (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name))
  }

  return (
    <div className="w-full h-screen">
      <HeaderWithBack
        title={t('appSettings.userFeedback')}
        className="bg-transparent"
        right={<Link to={APP_PATH.MEME_SETTINGS_USER_FEEDBACK_PROGRESS}>查看进度</Link>}
      />
      <div className="px-3 flex-1 overflow-y-auto no-scrollbar space-y-6">
        <div>
          <Label title="请选择问题分类" />
          <SelectableDrawer
            title="请选择问题分类"
            list={mockReasons}
            renderItem={(item) => <div className="">{item}</div>}
            onItemClick={(item) => setCategory(item)}
          >
            <InputWrapper className={category ? 'text-white' : ''}>{category ?? '请选择问题分类'}</InputWrapper>
          </SelectableDrawer>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <Label title="请输入您的反馈内容" />
            <div className="text-[#FFFFFFA6] text-[calc(14rem/16)]">0/5000</div>
          </div>
          <InputWrapper>
            <textarea
              className="w-full min-h-52 placeholder:text-[#FFFFFF80] text-white text-[calc(14rem/16)] resize-none"
              placeholder="请输入您的反馈内容 最多5000字  (必填）"
            />
          </InputWrapper>
          <div
            className="bg-[#232329] size-[52px] flex items-center justify-center rounded-[8px] cursor-pointer mt-2"
            onClick={selectFile}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 9H13" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 13V5" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelection}
              accept="image/*"
              multiple
            />
          </div>
          <div className="flex flex-items gap-2 mt-2">
            {files.map((file, index) => (
              <UploadedImage file={file} key={file.name + index} onRemoved={() => handleFileRemoval(file)} />
            ))}
          </div>
        </div>
        <div>
          <Label title="您的联系邮箱" />
          <InputWrapper>
            <input placeholder="请输入您的邮箱！（必填）" className="w-full placeholder:text-[#FFFFFF80] text-white" />
          </InputWrapper>
          <div className="flex items-center text-[calc(14rem/16)] text-[#FFFFFFA6] gap-1 mt-2">
            官方联系邮箱: support@xbit.com
            <CopyButton text="support@xbit.com" icon="/images/icons/ic-copy-solid.svg" />
          </div>
        </div>
      </div>
    </div>
  )
}
