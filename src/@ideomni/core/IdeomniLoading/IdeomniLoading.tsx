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
	const [showLoading, setShowLoading] = useState(true); // Always start visible to prevent hydration mismatch

	useEffect(() => {
		// If we have a delay, hide initially then show after delay
		if (delay > 0) {
			setShowLoading(false);
			const timer = setTimeout(() => {
				setShowLoading(true);
			}, delay);

			return () => clearTimeout(timer);
		}
	}, [delay]);

	return (
		<div
			className={clsx(
				className,
				'flex flex-1 min-h-full h-full w-full self-center flex-col items-center justify-center p-6'
			)}
			style={{
				visibility: showLoading ? 'visible' : 'hidden',
				opacity: showLoading ? 1 : 0,
				transition: 'opacity 0.2s ease-in-out'
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
