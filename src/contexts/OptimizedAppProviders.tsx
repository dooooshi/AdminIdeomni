'use client';

import { SnackbarProvider } from 'notistack';
import { useMemo } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale/en-US';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Provider } from 'react-redux';
import ErrorBoundary from '@ideomni/utils/ErrorBoundary';
import AppContext from 'src/contexts/AppContext';

import { IdeomniSettingsProvider } from '@ideomni/core/IdeomniSettings/IdeomniSettingsProvider';
import { I18nProvider } from '@/lib/i18n/components/I18nProvider';
import store from '../store/store';
import MainThemeProvider from './MainThemeProvider';

type OptimizedAppProvidersProps = {
	children?: React.ReactNode;
};

/**
 * Optimized providers component that combines multiple providers to reduce nesting
 * and improve performance by minimizing context re-renders.
 */
function OptimizedAppProviders(props: OptimizedAppProvidersProps) {
	const { children } = props;
	
	// Memoize static app context value to prevent unnecessary re-renders
	const appContextValue = useMemo(() => ({}), []);
	
	// Memoize notistack configuration to prevent re-renders
	const notistackConfig = useMemo(() => ({
		maxSnack: 5,
		anchorOrigin: {
			vertical: 'bottom' as const,
			horizontal: 'right' as const
		},
		classes: {
			containerRoot: 'bottom-0 right-0 mb-2 mr-2 z-99'
		}
	}), []);

	return (
		<ErrorBoundary>
			{/* Combine Redux and AppContext providers at the same level */}
			<Provider store={store}>
				<AppContext.Provider value={appContextValue}>
					{/* Date/Time and Settings providers */}
					<LocalizationProvider
						dateAdapter={AdapterDateFns}
						adapterLocale={enUS}
					>
						<IdeomniSettingsProvider>
							{/* I18n and Theme providers - these need to be nested due to dependencies */}
							<I18nProvider>
								<MainThemeProvider>
									{/* Notistack at the end for toast notifications */}
									<SnackbarProvider {...notistackConfig}>
										{children}
									</SnackbarProvider>
								</MainThemeProvider>
							</I18nProvider>
						</IdeomniSettingsProvider>
					</LocalizationProvider>
				</AppContext.Provider>
			</Provider>
		</ErrorBoundary>
	);
}

export default OptimizedAppProviders; 