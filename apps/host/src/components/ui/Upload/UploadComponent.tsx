import { Plus } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, EyeOutlined, FileOutlined, InboxOutlined } from './icons';

// File object interface
interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  percent?: number;
  response?: any;
  error?: any;
  originFileObj?: File;
}

// Custom request handler interface
interface CustomRequestOptions {
  file: File;
  filename: string;
  onProgress: (e: { percent: number }) => void;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  abort?: () => void;
}

// Component props interface
interface UploadComponentProps {
  listType?: 'text' | 'picture' | 'picture-card';
  multiple?: boolean;
  accept?: string;
  maxCount?: number;
  disabled?: boolean;
  showUploadList?: boolean;
  onChange?: (fileList: UploadFile[]) => void;
  onPreview?: (file: UploadFile) => void;
  onRemove?: (file: UploadFile) => (boolean | Promise<boolean>);
  beforeUpload?: (file: File, fileList: UploadFile[]) => boolean | Promise<boolean>;
  customRequest?: (options: CustomRequestOptions) => { abort?: () => void };
  dragable?: boolean;
  children?: React.ReactNode;
}

const UploadComponent: React.FC<UploadComponentProps> = ({
  listType = 'text',
  multiple = false,
  accept = '',
  maxCount = Number.MAX_SAFE_INTEGER,
  disabled = false,
  showUploadList = true,
  onChange,
  onPreview,
  onRemove,
  beforeUpload,
  customRequest,
  children,
  dragable = false,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const handleClick = (): void => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleUpload(files);
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (files: File[]): Promise<void> => {
    if (fileList.length + files.length > maxCount) {
      files = files.slice(0, maxCount - fileList.length);
    }

    const newFiles: UploadFile[] = files.map(file => {
      // Create URL for preview
      const url = URL.createObjectURL(file);
      return {
        uid: `file-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        name: file.name,
        status: 'uploading',
        url,
        percent: 0,
        originFileObj: file,
      };
    });

    const updatedFileList = [...fileList, ...newFiles];
    setFileList(updatedFileList);

    // Notify parent component
    onChange?.(updatedFileList);

    // Process each file
    for (const fileInfo of newFiles) {
      // Check beforeUpload callback
      let shouldUpload = true;
      if (beforeUpload && fileInfo.originFileObj) {
        try {
          shouldUpload = await beforeUpload(fileInfo.originFileObj, updatedFileList);
        } catch (e) {
          shouldUpload = false;
        }
      }

      if (shouldUpload === false) {
        // Remove this file if upload is rejected
        setFileList(prev => prev.filter(item => item.uid !== fileInfo.uid));
        continue;
      }

      // Upload the file
      if (customRequest && fileInfo.originFileObj) {
        customRequest({
          file: fileInfo.originFileObj,
          filename: fileInfo.name,
          onProgress: ({ percent }) => {
            setFileList(prev =>
              prev.map(item =>
                item.uid === fileInfo.uid ? { ...item, percent } : item
              )
            );
          },
          onSuccess: (response) => {
            setFileList(prev =>
              prev.map(item =>
                item.uid === fileInfo.uid ? { ...item, status: 'done', response } : item
              )
            );
          },
          onError: (error) => {
            setFileList(prev =>
              prev.map(item =>
                item.uid === fileInfo.uid ? { ...item, status: 'error', error } : item
              )
            );
          }
        });
      } else {
        // Simulate upload success after 2 seconds for demo
        setTimeout(() => {
          setFileList(prev =>
            prev.map(item =>
              item.uid === fileInfo.uid ? { ...item, status: 'done', percent: 100 } : item
            )
          );
        }, 2000);
      }
    }
  };

  const handleRemove = (file: UploadFile): void => {
    // Call onRemove if provided
    if (onRemove) {
      const result = onRemove(file);
      // If result is a Promise, wait for it
      if (result && typeof result.then === 'function') {
        result.then(canRemove => {
          if (canRemove !== false) {
            removeFile(file);
          }
        });
        return;
      }
      // If result is explicitly false, don't remove
      if (result === false) return;
    }
    removeFile(file);
  };

  const removeFile = (file: UploadFile): void => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    onChange?.(newFileList);
  };

  const handlePreview = (file: UploadFile): void => {
    onPreview?.(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (e.dataTransfer.files && !disabled && dragable) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && dragable) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  // Render different upload button based on listType
  const renderUploadButton = (): React.ReactNode => {
    if (listType === 'picture-card') {
      return ( 
        <div className="w-1/4 p-1 cursor-pointer">
          <div
            className="aspect-square rounded-lg bg-gray-800 flex items-center justify-center"
            onClick={handleClick}
          >
            <Plus size={24} className="text-gray-400" />
          </div>
        </div>
      );
    }

    if (dragable) {
      return (
        <div
          className={`p-4 text-center bg-gray-50 border border-dashed ${dragOver ? 'border-blue-500' : 'border-gray-300'} rounded cursor-pointer`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <p className="text-4xl text-blue-500 mb-4">
            <InboxOutlined />
          </p>
          <p className="text-base text-gray-800">Click or drag file to this area to upload</p>
          <p className="text-sm text-gray-500">Support for a single or bulk upload</p>
        </div>
      );
    }

    return children || (
      <button
        className={`px-4 py-1 text-sm border rounded ${disabled
          ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
          : 'bg-white text-gray-800 border-gray-300 hover:text-blue-500 hover:border-blue-500 cursor-pointer'}`}
        onClick={handleClick}
        disabled={disabled}
      >
        Upload
      </button>
    );
  };

  // Render file list based on listType
  const renderFileList = (): React.ReactNode => {
    if (!showUploadList || fileList.length === 0) return null;

    if (listType === 'picture-card') {
      return (
        <>
          {fileList.map(file => (
            <div className="w-1/4 p-1">
              <div
                key={file.uid}
                className={`relative aspect-square rounded-lg border rounded overflow-hidden ${file.status === 'error' ? 'border-red-500' : 'border'
                  }`}
              >
                {/* Thumbnail */}
                <div className="w-full h-full overflow-hidden">
                  {file.url && file.status !== 'error' && (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* File name */}
                {/* <div className="px-2 truncate text-xs text-gray-700">
                  {file.name}
                </div> */}

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  {file.status === 'done' ? (
                    <p
                      className="text-white mx-1 cursor-pointer text-center w-full flex justify-center flex-wrap"
                      onClick={() => handlePreview(file)}
                    >
                      <img src='/images/orderSetting/icon-info.svg' alt='' className='w-5 aspect-square' />
                      <span className='w-full text-xs mt-1'>{t('google.auth.button.abnormality')}</span>
                    </p>
                  ) : null}
                  <span
                    className="text-white mx-1 cursor-pointer absolute right-0 top-1"
                    onClick={() => handleRemove(file)}
                  >
                    {/* <DeleteOutlined /> */}
                    <span className="block w-3 h-3 border rounded-full border-white bg-[#EFEFEF]">
                      <img src="/images/icons/icon-x.svg" alt="" />
                    </span>
                  </span>
                </div>

                {/* Progress bar */}
                {file.status === 'uploading' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${file.percent || 0}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      );
    }

    if (listType === 'picture') {
      return (
        <div className="mt-2">
          {fileList.map(file => (
            <div
              key={file.uid}
              className={`flex items-center p-2 mb-2 border rounded ${file.status === 'error' ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 mr-2 overflow-hidden">
                {file.url && file.status !== 'error' && (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm text-gray-800">{file.name}</div>

                {/* Progress bar */}
                {file.status === 'uploading' && (
                  <div className="mt-1 h-1 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${file.percent || 0}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="ml-2 flex">
                {file.status === 'done' && (
                  <span
                    className="mx-1 text-gray-500 hover:text-blue-500 cursor-pointer"
                    onClick={() => handlePreview(file)}
                  >
                    <EyeOutlined />
                  </span>
                )}
                <span
                  className="mx-1 text-gray-500 hover:text-blue-500 cursor-pointer"
                  onClick={() => handleRemove(file)}
                >
                  <DeleteOutlined />
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Text list (default)
    return (
      <div className="mt-2">
        {fileList.map(file => (
          <div
            key={file.uid}
            className="flex items-center h-6 mb-2"
          >
            {/* File icon */}
            <span className="mr-2 text-gray-400">
              <FileOutlined />
            </span>

            {/* File name */}
            <span className={`flex-1 truncate ${file.status === 'error' ? 'text-red-500' : 'text-gray-800'
              }`}>
              {file.name}
            </span>

            {/* Progress bar for uploading files */}
            {file.status === 'uploading' && (
              <div className="w-full h-0.5 bg-gray-200">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${file.percent || 0}%` }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="ml-2 flex">
              {file.status === 'done' && (
                <span
                  className="ml-2 text-gray-500 hover:text-blue-500 cursor-pointer"
                  onClick={() => handlePreview(file)}
                >
                  <EyeOutlined />
                </span>
              )}
              <span
                className="ml-2 text-gray-500 hover:text-blue-500 cursor-pointer"
                onClick={() => handleRemove(file)}
              >
                <DeleteOutlined />
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`font-sans text-sm flex flex-wrap w-full`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* File list */}
      {renderFileList()}

      {/* Upload button or drag area */}
      {renderUploadButton()}
    </div>
  );
};

export default UploadComponent;