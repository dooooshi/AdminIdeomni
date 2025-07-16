'use client';

import OptimizedAppProviders from '../contexts/OptimizedAppProviders';

type AppProps = {
	children?: React.ReactNode;
};

/**
 * The main App component - now optimized with reduced provider nesting.
 */
function App(props: AppProps) {
	const { children } = props;

	return (
		<OptimizedAppProviders>
			{children}
		</OptimizedAppProviders>
	);
}

export default App;
