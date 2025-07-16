import { Reducer } from '@reduxjs/toolkit';
import { useEffect, useState } from 'react';
import rootReducer from './rootReducer';
import store from './store';

/**
 * Track injected reducers to avoid duplicates
 */
const injectedReducers = new Set<string>();

/**
 * A Higher Order Component that injects a reducer into the Redux store.
 */
const withReducer =
	<P extends object>(key: string, reducer: Reducer) =>
	(WrappedComponent: React.FC<P>) => {
		/**
		 * The component that wraps the provided component with the injected reducer.
		 */
		return function WithInjectedReducer(props: P) {
			const [isInjected, setIsInjected] = useState<boolean>(false);

			useEffect(() => {
				const injectReducer = async () => {
					// Only inject if it has not been injected yet
					if (!injectedReducers.has(key)) {
						if (!key || !reducer) {
							setIsInjected(true);
							return;
						}

						try {
							rootReducer.inject(
								{
									reducerPath: key,
									reducer
								},
								{
									overrideExisting: true
								}
							);

							// Add to the set of injected reducers
							injectedReducers.add(key);

							// Dispatch a dummy action to ensure the Redux store recognizes the new reducer
							store.dispatch({ type: `@@INIT/${key}` });
						} catch (error) {
							console.error(`Failed to inject reducer for key: ${key}`, error);
						}
					}
					
					setIsInjected(true);
				};

				injectReducer();
			}, []);

			if (!isInjected) {
				return null; // Brief loading state instead of 30-second timeout
			}

			return <WrappedComponent {...props} />;
		};
	};

export default withReducer;
