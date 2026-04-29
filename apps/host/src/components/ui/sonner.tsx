import { IconCheckCircle } from '@components/icon/stroke/IconCheckCircle.tsx'
import { Toaster as Sonner } from 'sonner'
import { IconToastError } from '../icon/solid/IconToastError'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      duration={1500}
      position="top-center"
      // closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg rounded-[8px]',
          description: 'group-[.toast]:text-muted-foreground text-white text-sm',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton: 'group-[.toast]:text-muted-foreground top-4! left-auto! right-0!',
        },
      }}
      icons={{
        success: <IconCheckCircle currentColor="#009C46" className="size-5" />,
        warning: <IconToastError className="size-4" />,
        error: <IconToastError className="size-4" />,
      }}
      style={
        {
          '--normal-bg': '#232329',
          '--normal-text': '#FFFFFF',
          '--normal-border': 'transparent',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
