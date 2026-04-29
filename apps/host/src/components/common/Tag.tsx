import { cn } from '@/lib/utils'
type TagProps = {
    label: string
    color: string,
    containerClassName?: string
}
const Tag = ({label, color, containerClassName}: TagProps) => {
    return (
        <div className={cn("rounded-[200px] border-solid border-[0.5px] text-[calc(12rem/16)] leading-[calc(12rem/16)] py-0.5 px-2",
            containerClassName
        )}
        style={{color: color, 'borderColor': color}}
        >
            {label}
        </div>
    )
}
export default Tag