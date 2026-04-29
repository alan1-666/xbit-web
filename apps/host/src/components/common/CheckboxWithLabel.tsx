import { CheckboxXbit } from '@components/ui/checkbox-xbit.tsx'
import { cn } from '@/lib/utils.ts'

type CheckboxWithLabelProps = {
  isChecked?: boolean,
  checked?: boolean,
  defaultChecked?: boolean,
  onChange?: (checked?: boolean) => any,
  label?: string | React.ReactNode,
  labelWrapperClassName?: string,
  containerClassName?: string,
  isDisabled?: boolean,
}

/**
 * CheckboxWithLabel component provides a custom styled checkbox with an associated label
 * @param {object} props - Component props
 * @param {string | React.ReactNode} [props.label] - The label text to display next to the checkbox
 * @param {boolean} [props.defaultChecked] - Default checked state for uncontrolled component
 * @param {function} [props.onChange] - Callback function when checkbox state changes
 * @param {string} [props.containerClassName] - Additional CSS classes for the container element
 * @param {string} [props.labelWrapperClassName] - Additional CSS classes for the label wrapper
 * @param {boolean} [props.isDisabled=false] - Whether the checkbox is disabled
 */
const CheckboxWithLabel = ({ defaultChecked, checked, onChange, label, labelWrapperClassName, containerClassName, isDisabled = false }: CheckboxWithLabelProps) => {
  const handleCheckedChange = (checked?: boolean) => {
    if (isDisabled) {
      return
    }

    if (onChange) {
      onChange(checked)
    }
  }

  return (
    <label
      className={cn(
        'flex items-center gap-[4px] select-none',
        containerClassName,
        isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <CheckboxXbit defaultChecked={defaultChecked} checked={checked} disabled={isDisabled} onCheckedChange={(checked) => handleCheckedChange(checked)} />
      <span
        className={cn(
          'block text-[calc(1rem*(11/16))] text-[#FFFFFF99] leading-[1] relative top-[-0.5px]',
          labelWrapperClassName,
        )}
      >
        {label && label}
      </span>
    </label>
  )
}

export default CheckboxWithLabel
