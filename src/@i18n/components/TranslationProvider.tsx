import React, { createContext, useContext, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface I18nContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  isReady: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

/**
 * Translation provider component
 */
export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const contextValue: I18nContextType = {
    currentLanguage: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang).then(() => {}),
    isReady: i18n.isInitialized,
  };

  return (
    <I18nextProvider i18n={i18n}>
      <I18nContext.Provider value={contextValue}>
        {children}
      </I18nContext.Provider>
    </I18nextProvider>
  );
};

/**
 * Hook to use i18n context
 */
export const useI18nContext = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18nContext must be used within a TranslationProvider');
  }
  return context;
};

/**
 * HOC to wrap components with TranslationProvider
 */
export const withTranslationProvider = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return function WrappedComponent(props: P) {
    return (
      <TranslationProvider>
        <Component {...props} />
      </TranslationProvider>
    );
  };
};