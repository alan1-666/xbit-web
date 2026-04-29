export interface FormInputLabelProps {
  label: string
}

export const FormInputLabel = (props: FormInputLabelProps) => {
  const { label } = props
  return <div className="text-white font-normal text-xs mb-1 pt-2">{label}</div>
}
