# 🌍 I18n Module Documentation

A comprehensive internationalization module for the AdminIdeomni application, built on top of react-i18next with enhanced TypeScript support and development tools.

## 📁 Module Structure

```
src/@i18n/
├── components/           # Pre-built i18n components
│   ├── LanguageSwitcher.tsx
│   └── TranslationProvider.tsx
├── core/                # Core configuration and instances
│   ├── config.ts        # i18n configuration options
│   ├── constants.ts     # Language constants and mappings
│   ├── initialization.ts # Enhanced initialization with dev features
│   └── instance.ts      # Core i18n instance and utilities
├── hooks/               # React hooks for i18n
│   ├── useI18n.ts      # Main hook with backward compatibility
│   ├── useLanguage.ts  # Language management hooks
│   └── useTranslation.ts # Translation hooks with namespace support
├── locales/             # Translation files
│   ├── en-US/          # English translations
│   ├── zh-CN/          # Chinese translations
│   └── index.ts        # Locale resource consolidation
├── types/               # TypeScript type definitions
│   ├── config.ts       # Configuration types
│   ├── index.ts        # Main type exports
│   └── locales.ts      # Locale-specific types
├── utils/               # Utility functions
│   ├── development.ts  # Development tools and validation
│   ├── formatters.ts   # Locale-aware formatting utilities
│   ├── helpers.ts      # General i18n helper functions
│   └── validators.ts   # Translation validation utilities
├── i18n.ts             # Main i18n instance initialization
└── index.ts            # Barrel export for all functionality
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { useI18n, useTranslation } from '@i18n';

function MyComponent() {
  // Option 1: Enhanced useI18n hook (recommended for new components)
  const { t, changeLanguage, currentLanguage, languages } = useI18n();
  
  // Option 2: Standard useTranslation hook
  const { t: translate, i18n } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => changeLanguage('zh-CN')}>
        Switch to Chinese
      </button>
    </div>
  );
}
```

### Translation Provider Setup

```typescript
import { TranslationProvider } from '@i18n';

function App() {
  return (
    <TranslationProvider>
      {/* Your app components */}
    </TranslationProvider>
  );
}
```

## 🔧 Available Hooks

### `useI18n()`
Main hook providing comprehensive i18n functionality with backward compatibility.

```typescript
const {
  t,                    // Translation function
  i18n,                 // i18n instance
  currentLanguage,      // Current language code
  changeLanguage,       // Function to change language
  language,             // Current language object (legacy compatibility)
  languages,            // Available languages array
  languageId,           // Current language ID
  langDirection,        // Text direction (ltr/rtl)
  isReady,              // Initialization status
  hasTranslation        // Check if translation exists
} = useI18n();
```

### `useTranslation(namespace?)`
Standard react-i18next hook with optional namespace support.

```typescript
const { t, i18n } = useTranslation('common');
const { t: tAuth } = useTranslation('auth');
```

### Specialized Translation Hooks

```typescript
import { 
  useCommonTranslation,
  useAuthTranslation,
  useNavigationTranslation,
  useMapTranslation 
} from '@i18n';

const { t: tCommon } = useCommonTranslation();
const { t: tAuth } = useAuthTranslation();
```

### Language Management Hooks

```typescript
import { 
  useLanguage,
  useLanguageDirection,
  useLanguageCode,
  useLanguageSwitcher 
} from '@i18n';

// Language management
const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();

// Direction support
const { direction, isRtl, isLtr } = useLanguageDirection();

// Quick language switching
const { switchLanguage } = useLanguageSwitcher();
```

## 🌐 Supported Languages

- **English (US)** - `en-US` 🇺🇸
- **Chinese (Simplified)** - `zh-CN` 🇨🇳

## 📦 Available Namespaces

- `common` - Shared UI elements and common actions
- `auth` - Authentication and authorization
- `navigation` - Navigation menus and breadcrumbs
- `landManagement` - Land management features
- `facilityManagement` - Facility management
- `teamManagement` - Team management features
- `userManagement` - User administration
- `adminManagement` - Admin tools
- `map` - Map-related features
- `activity` - Activity management
- `activityManagement` - Activity administration
- `teamAccounts` - Team accounts and resources
- `teamAdministration` - Team administration tools

## 🛠 Utility Functions

### Formatting Utilities

```typescript
import { 
  formatNumber,
  formatCurrency,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatFileSize 
} from '@i18n';

const formattedPrice = formatCurrency(1234.56, 'USD', 'en-US');
const formattedDate = formatDate(new Date(), 'zh-CN');
```

### Language Helpers

```typescript
import { 
  isLanguageSupported,
  getLanguageInfo,
  normalizeLanguageCode,
  detectBrowserLanguage 
} from '@i18n';

const isSupported = isLanguageSupported('en-US'); // true
const langInfo = getLanguageInfo('zh-CN');
const normalized = normalizeLanguageCode('en'); // 'en-US'
```

### Validation Utilities

```typescript
import { 
  validateLanguageCode,
  validateTranslationKey,
  validateTranslationValue 
} from '@i18n';

const validation = validateLanguageCode('en-US');
if (!validation.isValid) {
  console.error(validation.errors);
}
```

## 🔬 Development Features

### Translation Validation

```typescript
import { validateAllTranslations, generateCoverageReport } from '@i18n';

// Automatically validate all translations in development
if (process.env.NODE_ENV === 'development') {
  validateAllTranslations(allTranslations);
}
```

### Enhanced Initialization

```typescript
import { initializeI18n } from '@i18n';

// Initialize with development features
await initializeI18n({
  enableValidation: true,
  enableDebugging: true,
  defaultLanguage: 'zh-CN'
});
```

### Hot Reloading (Development)

```typescript
import { hotReloadTranslations } from '@i18n';

// Hot reload translations during development
await hotReloadTranslations('en-US', 'common', newTranslations);
```

## 📱 Components

### Language Switcher

```typescript
import { LanguageSwitcher } from '@i18n';

function Header() {
  return (
    <div>
      <LanguageSwitcher variant="button" size="medium" />
    </div>
  );
}
```

### Translation Provider

```typescript
import { TranslationProvider } from '@i18n';

// Wrap your app with the translation provider
function App() {
  return (
    <TranslationProvider>
      <YourAppComponents />
    </TranslationProvider>
  );
}
```

## 🔧 Configuration

The module uses centralized configuration in `core/config.ts`:

```typescript
export const i18nConfig = {
  lng: 'zh-CN',                    // Default language
  fallbackLng: 'en-US',           // Fallback language
  debug: process.env.NODE_ENV === 'development',
  keySeparator: false,            // Allows keys like 'button.save'
  nsSeparator: ':',               // Namespace separator
  defaultNS: 'common',            // Default namespace
  // ... more options
};
```

## 🎯 Best Practices

### 1. Use Namespaces
```typescript
// Good
const { t } = useTranslation('auth');
const title = t('loginForm.title');

// Better
const { t: tAuth } = useAuthTranslation();
const title = tAuth('loginForm.title');
```

### 2. Consistent Import Pattern
```typescript
// Always import from the barrel export
import { useI18n, useTranslation, formatCurrency } from '@i18n';

// Avoid direct file imports
// import { useI18n } from '@i18n/hooks/useI18n'; // ❌
```

### 3. Type Safety
```typescript
import type { SupportedLanguageCode, TranslationNamespace } from '@i18n';

function changeLanguage(lang: SupportedLanguageCode) {
  // TypeScript will enforce only supported languages
}
```

### 4. Development Validation
```typescript
// Use development utilities to catch missing translations
import { validateAllTranslations, logMissingTranslations } from '@i18n';

if (process.env.NODE_ENV === 'development') {
  // Automatic validation on startup
  validateAllTranslations(allTranslations);
}
```

## 🚨 Migration from Legacy

The module maintains backward compatibility with legacy components:

```typescript
// Legacy pattern (still supported)
import useI18n from '@i18n/useI18n'; // ❌ Old way
const { language, languages, changeLanguage } = useI18n();

// Modern pattern (recommended)
import { useI18n } from '@i18n'; // ✅ New way
const { language, languages, changeLanguage } = useI18n();
```

## 🐛 Troubleshooting

### Common Issues

1. **Missing Translations**: Use development validation to identify gaps
2. **Circular Imports**: Always import from `@i18n` barrel export
3. **Type Errors**: Ensure proper TypeScript configuration
4. **Performance**: Use namespace-specific hooks for better tree-shaking

### Debug Mode

Enable debug mode in development:

```typescript
import { initializeI18n } from '@i18n';

await initializeI18n({
  enableDebugging: true // Shows missing keys and language changes
});
```

## 📊 Bundle Optimization

The module is optimized for tree-shaking:

- Use namespace-specific hooks when possible
- Import only needed utilities
- Development features are excluded from production builds

## 🤝 Contributing

When adding new translations:

1. Add to both `en-US` and `zh-CN` locales
2. Use descriptive, hierarchical keys
3. Test with validation utilities
4. Update TypeScript types if needed

---

**Note**: This module replaces all legacy i18n implementations and provides a single, consistent API for internationalization throughout the application.