import { useState, useCallback, useRef, useEffect } from 'react';
import { Transform, ZoomConfig } from '../types';
import { clamp } from '../utils/hexUtils';

interface UseMapZoomProps {
	initialZoom?: number;
	zoomConfig: ZoomConfig;
	onZoomChange?: (zoomLevel: number) => void;
}

interface UseMapZoomReturn {
	transform: Transform;
	isAnimating: boolean;
	isDragging: boolean;
	zoomIn: () => void;
	zoomOut: () => void;
	resetZoom: () => void;
	handleWheel: (event: React.WheelEvent, containerRef: React.RefObject<HTMLDivElement>) => void;
	handleMouseDown: (event: React.MouseEvent) => void;
	handleMouseMove: (event: React.MouseEvent) => void;
	handleMouseUp: () => void;
}

/**
 * Custom hook for managing map zoom and pan functionality
 */
export const useMapZoom = ({
	initialZoom = 1,
	zoomConfig,
	onZoomChange
}: UseMapZoomProps): UseMapZoomReturn => {
	const [transform, setTransform] = useState<Transform>({
		x: 0,
		y: 0,
		scale: initialZoom
	});
	const [isAnimating, setIsAnimating] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	
	const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Helper function to trigger smooth animation
	const triggerAnimation = useCallback(() => {
		setIsAnimating(true);
		
		// Clear any existing timeout
		if (animationTimeoutRef.current) {
			clearTimeout(animationTimeoutRef.current);
		}
		
		// Reset animation state after animation completes
		animationTimeoutRef.current = setTimeout(() => {
			setIsAnimating(false);
		}, zoomConfig.animationDuration);
	}, [zoomConfig.animationDuration]);

	// Update transform when initialZoom prop changes
	useEffect(() => {
		setTransform(prev => ({ ...prev, scale: initialZoom }));
		triggerAnimation();
	}, [initialZoom, triggerAnimation]);

	// Zoom in function
	const zoomIn = useCallback(() => {
		const newScale = clamp(
			transform.scale + zoomConfig.zoomStep,
			zoomConfig.minZoom,
			zoomConfig.maxZoom
		);
		
		if (newScale !== transform.scale) {
			setTransform(prev => ({ ...prev, scale: newScale }));
			triggerAnimation();
			onZoomChange?.(newScale);
		}
	}, [transform.scale, zoomConfig, onZoomChange, triggerAnimation]);

	// Zoom out function
	const zoomOut = useCallback(() => {
		const newScale = clamp(
			transform.scale - zoomConfig.zoomStep,
			zoomConfig.minZoom,
			zoomConfig.maxZoom
		);
		
		if (newScale !== transform.scale) {
			setTransform(prev => ({ ...prev, scale: newScale }));
			triggerAnimation();
			onZoomChange?.(newScale);
		}
	}, [transform.scale, zoomConfig, onZoomChange, triggerAnimation]);

	// Reset zoom function
	const resetZoom = useCallback(() => {
		setTransform({ x: 0, y: 0, scale: 1 });
		triggerAnimation();
		onZoomChange?.(1);
	}, [onZoomChange, triggerAnimation]);

	// Handle mouse wheel zoom with smooth centering
	const handleWheel = useCallback((
		event: React.WheelEvent,
		containerRef: React.RefObject<HTMLDivElement>
	) => {
		event.preventDefault();
		
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;

		// Calculate mouse position relative to container
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		// Determine zoom direction and amount
		const deltaScale = event.deltaY > 0 ? -zoomConfig.zoomStep : zoomConfig.zoomStep;
		const newScale = clamp(
			transform.scale + deltaScale,
			zoomConfig.minZoom,
			zoomConfig.maxZoom
		);
		
		if (newScale !== transform.scale) {
			// Calculate zoom point relative to current transform
			const zoomPointX = (mouseX - centerX - transform.x) / transform.scale;
			const zoomPointY = (mouseY - centerY - transform.y) / transform.scale;

			// Calculate new transform to keep zoom point under mouse
			const newX = mouseX - centerX - zoomPointX * newScale;
			const newY = mouseY - centerY - zoomPointY * newScale;

			setTransform({
				x: newX,
				y: newY,
				scale: newScale
			});

			onZoomChange?.(newScale);
		}
	}, [transform, zoomConfig, onZoomChange]);

	// Handle mouse drag for panning
	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		if (event.button === 0) { // Left mouse button
			setIsDragging(true);
			setDragStart({ x: event.clientX - transform.x, y: event.clientY - transform.y });
			event.preventDefault();
		}
	}, [transform.x, transform.y]);

	const handleMouseMove = useCallback((event: React.MouseEvent) => {
		if (isDragging) {
			const newX = event.clientX - dragStart.x;
			const newY = event.clientY - dragStart.y;
			setTransform(prev => ({ ...prev, x: newX, y: newY }));
		}
	}, [isDragging, dragStart]);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Keyboard shortcuts for zoom
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Only handle shortcuts when no input is focused
			const activeElement = document.activeElement as HTMLElement;
			const isInputFocused = activeElement?.tagName === 'INPUT' || 
								  activeElement?.tagName === 'TEXTAREA' || 
								  activeElement?.contentEditable === 'true';
			
			if (isInputFocused) return;

			if (event.ctrlKey || event.metaKey) {
				switch (event.key) {
					case '=':
					case '+':
						event.preventDefault();
						zoomIn();
						break;
					case '-':
						event.preventDefault();
						zoomOut();
						break;
					case '0':
						event.preventDefault();
						resetZoom();
						break;
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [zoomIn, zoomOut, resetZoom]);

	// Cleanup animation timeout on unmount
	useEffect(() => {
		return () => {
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current);
			}
		};
	}, []);

	return {
		transform,
		isAnimating,
		isDragging,
		zoomIn,
		zoomOut,
		resetZoom,
		handleWheel,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp
	};
}; 