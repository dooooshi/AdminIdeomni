'use client';

import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import { motion } from 'motion/react';
import { useState } from 'react';
import { 
	MapHeader, 
	MapContainer, 
	sampleMapData, 
	type MapTile 
} from 'src/components/map';

const container = {
	show: {
		transition: {
			staggerChildren: 0.04
		}
	}
};

const item = {
	hidden: { opacity: 0, y: 20 },
	show: { opacity: 1, y: 0 }
};

/**
 * Hexagonal Game Map Page
 */
function TestMapPage() {
	const handleTileClick = (tile: MapTile) => {
		console.log('Tile clicked:', tile);
	};

	const handleRefresh = () => {
		console.log('Refreshing map...');
	};

	const handleSettings = () => {
		console.log('Opening settings...');
	};

	const handleExpand = () => {
		console.log('Expanding map...');
	};

	return (
		<IdeomniPageSimple
			header={
				<MapHeader 
					onRefresh={handleRefresh}
					onSettings={handleSettings}
				/>
			}
			content={
				<motion.div
					className="w-full p-6 md:p-8"
					variants={container}
					initial="hidden"
					animate="show"
				>
					{/* Full Width Map Container */}
					<motion.div
						variants={item}
						className="w-full"
					>
						<MapContainer
							tiles={sampleMapData}
							onTileClick={handleTileClick}
							onExpand={handleExpand}
						/>
					</motion.div>
				</motion.div>
			}
		/>
	);
}

export default TestMapPage; 