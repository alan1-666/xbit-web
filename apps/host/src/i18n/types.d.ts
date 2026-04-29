import en from '../../public/locales/en/translation.json';

export type TranslationKeys = RecursiveKeyOf<typeof en>;

type RecursiveKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${RecursiveKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'en';
    resources: {
      translation: {
        [key in TranslationKeys]: string;
      };
    };
  }
}
