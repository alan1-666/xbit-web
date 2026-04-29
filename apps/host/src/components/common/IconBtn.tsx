// import useCustomTranslation from '@/hooks/useCustomTranslation.ts';
import { debounce } from 'lodash-es';
import { Button } from '../ui/button';

type IconBtnProps = React.ComponentProps<'button'> & {
  icon: "arrow-left" | "arrow-right" | "plus" | "minus" | "edit" | "delete" | React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  text?: string;
}
/**
 * @param param0 
 * @returns 
 */
export default function IconBtn({ text = '', className, icon, onClick, ...rest }: IconBtnProps) {
  return (
    <Button
      {...rest}
      variant={'ghost'}
      onClick={debounce((e: React.MouseEvent<HTMLButtonElement>) => onClick?.(e), 500)}
      className={`cursor-pointer w-auto inline-block p-0 ${className ?? ''}`}

    >
      {typeof icon === 'string' ? (
        <img src={`/images/icons/icon-${icon}.svg`} className="w-[16px] min-w-16px" alt={icon} />
      ) : (
        icon
      )}
      {text}
    </Button>
  );
}
