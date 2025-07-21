// Core map components
export { default as HexagonalMap } from './components/HexagonalMap';
export { default as HexTile } from './components/HexTile';
export { default as MapBackground } from './components/MapBackground';

// UI components
export { default as MapContainer } from './ui/MapContainer';
export { default as MapHeader } from './ui/MapHeader';
export { default as MapStatistics } from './ui/MapStatistics';
export { default as SelectedTileInfo } from './ui/SelectedTileInfo';
export { default as MapLegend } from './ui/MapLegend';

// Configuration components
export { default as TileConfigurationPanel } from './ui/TileConfigurationPanel';
export { default as TemplateGenerationForm } from './ui/TemplateGenerationForm';
export { default as MapConfigurationInterface } from './ui/MapConfigurationInterface';
export { default as ActivityTileStateManager } from './ui/ActivityTileStateManager';

// Activity Tile State Management components
export { default as ActivitySelector } from './ui/ActivitySelector';
export { default as ActivityTileStatePanel } from './ui/ActivityTileStatePanel';
export { default as ActivityAnalyticsPanel } from './ui/ActivityAnalyticsPanel';

// Hooks
export { useMapZoom } from './hooks/useMapZoom';

// Utilities
export * from './utils/hexUtils';

// Types and data
export * from './types';
export { sampleMapData } from './types/mapData'; 