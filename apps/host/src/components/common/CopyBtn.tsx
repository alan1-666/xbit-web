// import useCustomTranslation from '@/hooks/useCustomTranslation.ts';
import React, { useCallback, useState } from 'react';
import { LuCheckCheck } from 'react-icons/lu';
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils';

type CopyBtnProps = React.ComponentProps<'span'> & {
  text: string,
  colorClassName?: string,
  className?: string,
  icon?: React.ReactNode,
  onClick?: () => void,
}

export default function CopyBtn({ text, colorClassName, className, icon, ...rest }: CopyBtnProps) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);

  const copy = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation()
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(t('toast.copiedSuccess'))
        setChecked(true);
        setTimeout(() => {
          setChecked(false);
        }, 1000);
      })
      .catch((err) => {
        console.warn(err);
      });
  }, [text]);

  return (
    <span
      {...rest}
      onClick={copy}
      className={`cursor-pointer ${checked ? 'text-lime-500' : colorClassName ?? 'text-slate-50'} ${className ?? ''}`}
    >
      {checked ?
        <LuCheckCheck size={16} className="min-w-4" /> :
        icon ?
          icon :
          <img src="/images/icons/icon-copy-stroke.svg" className="w-4 min-w-4" alt="" />
      }
    </span>
  );
}