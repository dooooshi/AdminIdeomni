# Map Module

A comprehensive interactive hexagonal map component system with zoom, pan, and rich tooltip functionality.

## Structure

```
src/components/map/
├── index.ts                    # Main exports
├── components/                 # Core map components
│   ├── HexagonalMap.tsx       # Main interactive map component
│   ├── HexTile.tsx           # Individual hexagon tile component
│   └── MapBackground.tsx     # Background patterns and gradients
├── ui/                        # UI/Layout components
│   ├── MapContainer.tsx      # Container with zoom controls
│   ├── MapHeader.tsx         # Header with breadcrumb and actions
│   ├── MapStatistics.tsx     # Statistics panel
│   ├── SelectedTileInfo.tsx  # Selected tile information panel
│   └── MapLegend.tsx         # Terrain type legend
├── hooks/                     # Custom hooks
│   └── useMapZoom.ts         # Zoom and pan functionality
├── utils/                     # Utility functions
│   └── hexUtils.ts           # Hexagonal grid calculations
└── types/                     # Types and data
    ├── index.ts              # Main type definitions
    └── mapData.ts            # Sample map data
```

## Features

### Core Components

- **HexagonalMap**: Interactive hexagonal grid with zoom, pan, and hover functionality
- **HexTile**: Individual hexagon tiles with tooltips and terrain-based styling
- **MapBackground**: Sophisticated background patterns and gradients

### UI Components

- **MapContainer**: Complete map interface with zoom controls and statistics
- **MapHeader**: Page header with breadcrumb navigation and action buttons
- **MapStatistics**: Real-time terrain statistics panel
- **SelectedTileInfo**: Detailed information for selected tiles
- **MapLegend**: Visual legend for terrain types

### Functionality

- **Zoom**: Mouse wheel, keyboard shortcuts (Ctrl/Cmd + +/-/0), and button controls
- **Pan**: Drag to pan when zoomed in
- **Hover**: Rich tooltips with tile information
- **Click**: Tile selection with detailed information display
- **Responsive**: Adapts to different screen sizes
- **Theming**: Full support for light/dark themes

## Usage

```tsx
import { MapContainer, sampleMapData } from 'src/components/map';

function MyMapPage() {
  const handleTileClick = (tile) => {
    console.log('Tile clicked:', tile);
  };

  return (
    <MapContainer
      tiles={sampleMapData}
      onTileClick={handleTileClick}
    />
  );
}
```

## Technical Details

### Zoom System
- Range: 0.5x to 3.0x
- Smooth animations with cubic-bezier easing
- Point-under-cursor zoom centering
- Keyboard shortcuts support

### Coordinate System
- Uses axial coordinates for hexagonal grid
- Efficient pixel position calculations
- Proper bounds calculation for viewport

### Styling
- Material-UI theme integration
- Sophisticated color palette with transparency
- Responsive typography and spacing
- Backdrop blur effects for modern appearance

## Dependencies

- React 18+
- Material-UI 5+
- react-i18next (for internationalization)
- @ideomni/core (for icons and components) 