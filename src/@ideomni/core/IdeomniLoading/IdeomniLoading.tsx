import { useState, useEffect } from 'react';
import clsx from 'clsx';
import Box from '@mui/material/Box';

export type IdeomniLoadingProps = {
	delay?: number;
	className?: string;
};

/**
 * IdeomniLoading displays a loading state with an optional delay
 * Fixed to prevent hydration mismatches by ensuring consistent server/client rendering
 */
function IdeomniLoading(props: IdeomniLoadingProps) {
	const { delay = 0, className } = props;
	const [showLoading, setShowLoading] = useState(delay === 0); // Start with true only if no delay
	const [isClient, setIsClient] = useState(false);

	// Detect client-side hydration
	useEffect(() => {
		setIsClient(true);
		
		// Only set up delay if we have one and are on client
		if (delay > 0) {
			const timer = setTimeout(() => {
				setShowLoading(true);
			}, delay);

			return () => clearTimeout(timer);
		}
	}, [delay]);

	// For SSR/SSG: always show loading immediately to prevent hydration mismatch
	// For client: respect the delay logic
	const shouldShow = !isClient || showLoading;

	return (
		<div
			className={clsx(
				className,
				'flex flex-1 min-h-full h-full w-full self-center flex-col items-center justify-center p-6'
			)}
			style={{
				visibility: shouldShow ? 'visible' : 'hidden',
				opacity: shouldShow ? 1 : 0,
				transition: isClient ? 'opacity 0.2s ease-in-out' : 'none'
			}}
		>
			<Box
				id="spinner"
				sx={{
					'& > div': {
						backgroundColor: 'palette.secondary.main'
					}
				}}
			>
				<div className="bounce1" />
				<div className="bounce2" />
				<div className="bounce3" />
			</Box>
		</div>
	);
}

export default IdeomniLoading;
