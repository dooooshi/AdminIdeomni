# Simplified I18n Module

## Overview
A clean and simple internationalization module using react-i18next without unnecessary namespace complexity.

## Architecture

### Core Files
- `index.ts` - Main i18n configuration and setup
- `hooks/useTranslation.ts` - Single translation hook
- `hooks/useErrorTranslation.ts` - Error translation utilities
- `components/I18nProvider.tsx` - React provider wrapper
- `components/LanguageSwitcher.tsx` - Language switching component
- `translations/en.ts` - English translations
- `translations/en-extended.ts` - Extended English translations
- `translations/zh.ts` - Chinese translations
- `translations/zh-extended.ts` - Extended Chinese translations

## Features
- **2 Languages**: English (en-US) and Chinese (zh-CN)
- **Simple API**: Single `useTranslation()` hook
- **Local Storage**: Automatic language persistence
- **No Namespace Complexity**: Direct key access with prefixes
- **Clean TypeScript**: Full type support

## Usage

### Basic Translation
```tsx
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  // Access translations with namespace prefixes
  return (
    <div>
      {t('common.SAVE')}
      {t('navigation.DASHBOARD')}
      {t('map.TITLE')}
    </div>
  );
}
```

### Language Switching
```tsx
import { LanguageSwitcher } from '@/lib/i18n/components/LanguageSwitcher';

function Header() {
  return <LanguageSwitcher />;
}
```

### Provider Setup
```tsx
import { I18nProvider } from '@/lib/i18n/components/I18nProvider';

function App() {
  return (
    <I18nProvider>
      <YourApp />
    </I18nProvider>
  );
}
```

### Error Translation
```tsx
import { translateErrorCode } from '@/lib/i18n/hooks/useErrorTranslation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

function ErrorHandler({ errorCode }: { errorCode: string }) {
  const { t } = useTranslation();
  
  const errorMessage = translateErrorCode(errorCode, t);
  return <div>{errorMessage}</div>;
}
```

## Translation Key Structure

All translation keys use namespace prefixes for organization:

- **Common**: `common.SAVE`, `common.CANCEL`, `common.DELETE`
- **Navigation**: `navigation.DASHBOARD`, `navigation.MAP`, `navigation.ADMIN`
- **Map**: `map.TITLE`, `map.LEGEND`, `map.STATISTICS`
- **Activity**: `activity.NAME`, `activity.DESCRIPTION`, `activity.STATUS`
- **Auth**: `auth.SIGN_IN`, `auth.EMAIL`, `auth.PASSWORD`
- **Errors**: `errors.NETWORK_ERROR`, `errors.VALIDATION_FAILED`

## Key Improvements from Previous Version
1. **Removed Namespace Functions**: No more specialized hooks like `useMapTranslation()` 
2. **Single Hook**: One `useTranslation()` for all components
3. **Direct Key Access**: Simple prefixed keys instead of complex namespace configuration
4. **Cleaner Codebase**: Removed unnecessary namespace creation logic
5. **Better Maintainability**: Straightforward translation structure

## Adding New Translations

To add new translations:

1. Add the key-value pair to both language files (`en.ts` and `zh.ts`)
2. Use the appropriate namespace prefix (e.g., `'module.KEY': 'Value'`)
3. Access using `t('module.KEY')` in components

Example:
```typescript
// In en.ts
'profile.SETTINGS': 'Settings',

// In zh.ts
'profile.SETTINGS': '设置',

// In component
const { t } = useTranslation();
<button>{t('profile.SETTINGS')}</button>
```

## Supported Languages
- **English (en-US)** - Default fallback
- **Chinese Simplified (zh-CN)**

The system automatically detects the user's browser language and persists the selection in localStorage.