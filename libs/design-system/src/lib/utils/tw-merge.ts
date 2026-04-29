import { twMerge } from 'tailwind-merge';

export const cn = (...classes: (string | undefined | boolean)[]) => {
  return twMerge(classes.filter(Boolean).join(' '));
};