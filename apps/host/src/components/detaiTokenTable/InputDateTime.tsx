import { ChangeEvent, Dispatch, SetStateAction, useMemo } from 'react'
import { TimeWheelDateType } from '@/redux/modules/tokenDetail.slice.ts'
import debounce from 'lodash-es/debounce'
import { cn } from '@/lib/utils'

type InputDateTimeProps = {
  currentDateTime: TimeWheelDateType | undefined,
  setTime: Dispatch<SetStateAction<TimeWheelDateType | undefined>>
  customOnClick?: () => void
}

const InputDateTime = ({
  currentDateTime,
  setTime,
  customOnClick
}: InputDateTimeProps) => {

  const formatDate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    let result: string;
    if (digits.length <= 4) result = digits;
    else if (digits.length <= 6) result = digits.slice(0, 4) + '/' + digits.slice(4);
    else result = digits.slice(0, 4) + '/' + digits.slice(4, 6) + '/' + digits.slice(6, 8);
    return result;
  };

  const formatTime = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    let result: string;
    if (digits.length <= 2) result = digits;
    else result = digits.slice(0, 2) + ':' + digits.slice(2, 4);
    return result;
  };

  const debouncedDispatch = useMemo(
    () => debounce((payload: TimeWheelDateType) => {
      setTime(payload);
    }, 500),
    [setTime]
  );

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const formatted = formatDate(e.target.value);
    const [year, month, day] = formatted.split("/")
    debouncedDispatch({
      year,
      month,
      day
    });
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const formatted = formatTime(e.target.value);
    const [hour, minute] = formatted.split(":")
    debouncedDispatch({
      hour,
      minute
    });
  };

  return (
    <div className={cn("flex gap-1.5", customOnClick ? 'cursor-pointer' : 'cursor-default')} onClick={customOnClick}>
      <input
        type="text"
        value={`${currentDateTime?.year}/${currentDateTime?.month}/${currentDateTime?.day}`}
        onChange={handleDateChange}
        className={cn("flex max-w-[75px] rounded", customOnClick ? 'cursor-pointer' : 'cursor-default')}
        readOnly
        maxLength={10}
      />
      <input
        type="text"
        value={`${currentDateTime?.hour}:${currentDateTime?.minute}`}
        onChange={handleTimeChange}
        className={cn("flex max-w-[37px] rounded", customOnClick ? 'cursor-pointer' : 'cursor-default')}
        readOnly
        maxLength={5}
      />
    </div>
  )
}

export default InputDateTime