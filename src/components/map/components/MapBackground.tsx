import React from 'react';
import { useTheme, alpha } from '@mui/material/styles';
import { MapBackgroundProps } from '../types';
import { getHexDimensions } from '../utils/hexUtils';

/**
 * MapBackground component - Renders the background patterns and gradients for the map
 */
const MapBackground: React.FC<MapBackgroundProps> = ({ bounds, hexConfig }) => {
	const theme = useTheme();
	const { width: hexWidth, height: hexHeight } = getHexDimensions(hexConfig.baseSize);
	const viewBoxWidth = bounds.maxX - bounds.minX;
	const viewBoxHeight = bounds.maxY - bounds.minY;

	return (
		<>
			{/* Enhanced background pattern system for better visual depth */}
			<defs>
				{/* Primary grid pattern with sophisticated spacing */}
				<pattern
					id="primaryGridPattern"
					patternUnits="userSpaceOnUse"
					width={hexWidth}
					height={hexHeight * 0.75}
				>
					{/* Sophisticated grid dots using project color palette */}
					<circle
						cx={hexWidth / 2}
						cy={hexHeight * 0.375}
						r="0.8"
						fill={alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.06 : 0.04)}
					/>
					{/* Secondary grid dots for enhanced depth */}
					<circle
						cx={hexWidth / 4}
						cy={hexHeight * 0.1875}
						r="0.3"
						fill={alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.02 : 0.015)}
					/>
					<circle
						cx={hexWidth * 0.75}
						cy={hexHeight * 0.5625}
						r="0.3"
						fill={alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.02 : 0.015)}
					/>
				</pattern>

				{/* Subtle grid lines pattern */}
				<pattern
					id="gridLinesPattern"
					patternUnits="userSpaceOnUse"
					width={hexWidth}
					height={hexHeight * 0.75}
				>
					{/* Horizontal grid lines */}
					<line
						x1="0"
						y1={hexHeight * 0.375}
						x2={hexWidth}
						y2={hexHeight * 0.375}
						stroke={alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.015 : 0.01)}
						strokeWidth="0.5"
					/>
					{/* Vertical grid lines */}
					<line
						x1={hexWidth / 2}
						y1="0"
						x2={hexWidth / 2}
						y2={hexHeight * 0.75}
						stroke={alpha(theme.palette.divider, theme.palette.mode === 'dark' ? 0.015 : 0.01)}
						strokeWidth="0.5"
					/>
				</pattern>

				{/* Enhanced background gradient */}
				<radialGradient id="backgroundGradient" cx="50%" cy="50%" r="70%">
					<stop 
						offset="0%" 
						stopColor={alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.003 : 0.002)} 
					/>
					<stop 
						offset="100%" 
						stopColor={alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.01 : 0.005)} 
					/>
				</radialGradient>
			</defs>

			{/* Layered background system for enhanced visual hierarchy */}
			{/* Base gradient background */}
			<rect
				x={bounds.minX}
				y={bounds.minY}
				width={viewBoxWidth}
				height={viewBoxHeight}
				fill="url(#backgroundGradient)"
			/>

			{/* Grid lines layer */}
			<rect
				x={bounds.minX}
				y={bounds.minY}
				width={viewBoxWidth}
				height={viewBoxHeight}
				fill="url(#gridLinesPattern)"
			/>

			{/* Primary grid dots layer */}
			<rect
				x={bounds.minX}
				y={bounds.minY}
				width={viewBoxWidth}
				height={viewBoxHeight}
				fill="url(#primaryGridPattern)"
			/>
		</>
	);
};

export default MapBackground; 