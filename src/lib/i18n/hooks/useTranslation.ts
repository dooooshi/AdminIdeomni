import { useTranslation as useReactI18nextTranslation } from 'react-i18next';

export const useTranslation = (ns?: string | string[]) => {
  return useReactI18nextTranslation(ns);
};

export default useTranslation;