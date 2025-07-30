'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';

interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onPinchZoom?: (scale: number, center: { x: number; y: number }) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onTap?: (x: number, y: number) => void;
  onLongPress?: (x: number, y: number) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', velocity: number) => void;
  disabled?: boolean;
  className?: string;
}

interface TouchPoint {
  x: number;
  y: number;
  identifier: number;
}

const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  children,
  onPinchZoom,
  onPan,
  onTap,
  onLongPress,
  onSwipe,
  disabled = false,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<TouchPoint[]>([]);
  const lastTouchRef = useRef<TouchPoint[]>([]);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialDistanceRef = useRef<number | null>(null);
  const initialCenterRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);
  const gestureStartTimeRef = useRef<number>(0);

  const getTouchPoints = useCallback((touches: TouchList): TouchPoint[] => {
    return Array.from(touches).map(touch => ({
      x: touch.clientX,
      y: touch.clientY,
      identifier: touch.identifier
    }));
  }, []);

  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint): number => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getCenter = useCallback((p1: TouchPoint, p2: TouchPoint): { x: number; y: number } => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (disabled) return;

    event.preventDefault();
    const touches = getTouchPoints(event.touches);
    touchStartRef.current = touches;
    lastTouchRef.current = touches;
    longPressTriggeredRef.current = false;
    gestureStartTimeRef.current = Date.now();

    if (touches.length === 1) {
      // Single touch - start pan and long press detection
      panStartRef.current = { x: touches[0].x, y: touches[0].y };
      
      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        if (!longPressTriggeredRef.current && touches.length === 1) {
          longPressTriggeredRef.current = true;
          onLongPress?.(touches[0].x, touches[0].y);
        }
      }, 500); // 500ms for long press
      
    } else if (touches.length === 2) {
      // Two finger touch - start pinch zoom
      clearLongPressTimer();
      panStartRef.current = null;
      
      const distance = getDistance(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);
      
      initialDistanceRef.current = distance;
      initialCenterRef.current = center;
    }
  }, [disabled, getTouchPoints, getDistance, getCenter, onLongPress, clearLongPressTimer]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (disabled) return;

    event.preventDefault();
    const touches = getTouchPoints(event.touches);
    
    if (touches.length === 1 && panStartRef.current && !longPressTriggeredRef.current) {
      // Single finger pan
      const deltaX = touches[0].x - lastTouchRef.current[0].x;
      const deltaY = touches[0].y - lastTouchRef.current[0].y;
      
      // Clear long press if we've moved significantly
      const startDistance = getDistance(touches[0], { 
        x: panStartRef.current.x, 
        y: panStartRef.current.y, 
        identifier: 0 
      });
      
      if (startDistance > 10) {
        clearLongPressTimer();
      }
      
      onPan?.(deltaX, deltaY);
      
    } else if (touches.length === 2 && initialDistanceRef.current && initialCenterRef.current) {
      // Two finger pinch zoom
      clearLongPressTimer();
      
      const currentDistance = getDistance(touches[0], touches[1]);
      const currentCenter = getCenter(touches[0], touches[1]);
      
      const scale = currentDistance / initialDistanceRef.current;
      
      onPinchZoom?.(scale, currentCenter);
    }
    
    lastTouchRef.current = touches;
  }, [disabled, getTouchPoints, getDistance, getCenter, onPan, onPinchZoom, clearLongPressTimer]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (disabled) return;

    event.preventDefault();
    clearLongPressTimer();
    
    const touches = getTouchPoints(event.touches);
    const endTime = Date.now();
    const gestureDuration = endTime - gestureStartTimeRef.current;
    
    if (touches.length === 0 && touchStartRef.current.length === 1 && !longPressTriggeredRef.current) {
      // Single tap or swipe
      const startTouch = touchStartRef.current[0];
      const endTouch = lastTouchRef.current[0];
      
      const deltaX = endTouch.x - startTouch.x;
      const deltaY = endTouch.y - startTouch.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance < 10 && gestureDuration < 200) {
        // Tap
        onTap?.(endTouch.x, endTouch.y);
      } else if (distance > 50 && gestureDuration < 300) {
        // Swipe
        const velocity = distance / gestureDuration;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > absY) {
          onSwipe?.(deltaX > 0 ? 'right' : 'left', velocity);
        } else {
          onSwipe?.(deltaY > 0 ? 'down' : 'up', velocity);
        }
      }
    }
    
    // Reset state
    if (touches.length === 0) {
      touchStartRef.current = [];
      lastTouchRef.current = [];
      panStartRef.current = null;
      initialDistanceRef.current = null;
      initialCenterRef.current = null;
      longPressTriggeredRef.current = false;
    }
  }, [disabled, getTouchPoints, onTap, onSwipe, clearLongPressTimer]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add touch event listeners with passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        touchAction: 'none', // Disable default touch behaviors
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        position: 'relative'
      }}
    >
      {children}
    </Box>
  );
};

export default TouchGestureHandler;