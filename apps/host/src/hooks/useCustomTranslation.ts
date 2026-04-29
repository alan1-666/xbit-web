import { useTranslation } from 'react-i18next';

const useCustomTranslation = () => {
  const { t, i18n } = useTranslation();

  const translate = (key: string, options?: any): string => {
    const fallback = `${t('unknown')}`;
    return `${t([key, fallback], options)}`;
  };

  return { t: translate, i18n };
};

export default useCustomTranslation;
