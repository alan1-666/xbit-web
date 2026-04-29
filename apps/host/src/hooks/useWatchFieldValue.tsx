import { useFormContext, useWatch } from 'react-hook-form';

// watch single field value in react-hook-form
export const useWatchFieldValue = (name: string) => {
  const { control } = useFormContext();
  const watchFieldValue = useWatch({ control, name });
  return watchFieldValue;
};

//watch multiple field values in react-hook-form
export const useWatchFieldValues = (names: string[]) => {
  const { control } = useFormContext();
  const watchFieldValues = useWatch({ control, name: names });
  return watchFieldValues;
};

