# Land Management System

A comprehensive land management system for business simulation activities, providing both manager oversight and student purchasing capabilities.

## Overview

This land management system enables teams to purchase, own, and manage territorial land areas on hexagonal map tiles using gold and carbon resources. The system includes both manager oversight tools and student purchasing interfaces.

## Features

### Manager Features
- **Interactive Map View**: Comprehensive overview of land ownership across all teams
- **Analytics Dashboard**: Detailed analytics with charts and team performance metrics
- **Oversight Tools**: Activity-wide monitoring and reporting capabilities

### Student Features
- **Interactive Purchase Map**: Visual land purchasing interface with real-time validation
- **Portfolio Management**: Team land ownership tracking and purchase history
- **Purchase Workflow**: Guided purchase process with cost calculation and validation

## System Architecture

### Core Components

```
src/
├── types/land.ts                    # TypeScript type definitions
├── lib/services/landService.ts      # API service with 13 endpoints
├── components/land/                 # Reusable UI components
│   ├── LandPurchaseModal.tsx       # Purchase interface modal
│   ├── LandOwnershipCard.tsx       # Ownership display component
│   └── index.ts                    # Component exports
└── app/(control-panel)/land-management/
    ├── page.tsx                    # Main hub page
    ├── layout.tsx                  # Layout wrapper
    ├── manager/                    # Manager interfaces
    │   ├── map/page.tsx           # Manager map view
    │   ├── overview/page.tsx      # Manager overview dashboard
    │   └── analytics/page.tsx     # Manager analytics page
    └── student/                    # Student interfaces
        ├── map/page.tsx           # Student purchase map
        └── portfolio/page.tsx     # Student portfolio page
```

### API Integration

The system implements all 13 API endpoints from the land management documentation:

#### Student/Worker Endpoints (8)
- `POST /user/land-purchase/purchase` - Purchase land area
- `GET /user/land-purchase/history` - Purchase history with filtering
- `GET /user/land-purchase/owned-lands` - Team ownership summary
- `GET /user/land-purchase/available-tiles` - Available tiles for purchase
- `GET /user/land-purchase/tiles/:id/details` - Detailed tile information
- `GET /user/land-purchase/validate-purchase/:id/:area` - Purchase validation
- `GET /user/land-purchase/calculate-cost/:id/:area` - Cost calculation
- `GET /user/land-purchase/summary` - Alternative ownership summary

#### Manager Endpoints (5)
- `GET /user/manager/land-status/overview` - Activity-wide overview
- `GET /user/manager/land-status/tiles` - Detailed tile ownership
- `GET /user/manager/land-status/tiles/:id/ownership` - Specific tile ownership
- `GET /user/manager/land-status/analytics` - Comprehensive analytics
- `GET /user/manager/land-status/summary` - High-level summary statistics

## Key Features

### Purchase System
- **Real-time Validation**: Cost calculation and resource validation before purchase
- **Price Protection**: Optional maximum cost limits to protect against price volatility
- **Visual Interface**: Interactive map with tile selection and purchase workflow
- **Error Handling**: Comprehensive error messages and validation feedback

### Map Integration
- **Hexagonal Map**: Integrates with existing map components for visual representation
- **Ownership Overlays**: Visual indication of team ownership and availability
- **Interactive Elements**: Click-to-select tiles with detailed information panels
- **Zoom and Pan**: Full map navigation capabilities

### Analytics and Reporting
- **Purchase Trends**: Time-based analytics with charts and visualizations
- **Team Rankings**: Performance comparison by area owned and spending
- **Land Type Analysis**: Distribution and performance by land type
- **Revenue Tracking**: Comprehensive financial analytics

## Usage

### For Students
1. Navigate to "Land Management" → "Land Map"
2. Explore available tiles on the interactive map
3. Click on tiles to view details and pricing
4. Use the purchase interface to buy land with validation
5. Monitor team portfolio in "Land Portfolio" section

### For Managers
1. Access manager views through navigation or main hub
2. Use "Manager Map View" for ownership visualization
3. Review "Manager Overview" for activity-wide statistics
4. Analyze trends in "Manager Analytics" with detailed charts

### For Admins
Admin users have access to all manager functionality through the control panel navigation.

## Navigation Integration

The system integrates with the existing navigation configuration:

- **Admin Navigation**: Full manager interface access
- **Manager Navigation** (userType: 1): Manager oversight tools
- **Student Navigation** (userType: 3): Purchase and portfolio management

## Internationalization

Comprehensive i18n support with:
- English (en-US) translations
- Chinese (zh-CN) translations
- Extensible localization structure
- Context-aware translations for all UI elements

## Security and Validation

### Role-Based Access
- **Students**: Can purchase land and view their team's data only
- **Managers**: Can view all activity data and analytics but cannot make purchases
- **Activity Scoping**: All operations are scoped to user's current activity

### Data Protection
- **Team Isolation**: Users can only access their own team's detailed data
- **Input Validation**: Comprehensive validation for all purchase inputs
- **Price Protection**: Safeguards against sudden price increases
- **Error Handling**: Structured error handling with user-friendly messages

## Technical Implementation

### State Management
- React hooks for local state management
- Optimistic updates for better user experience
- Error boundaries for graceful error handling
- Loading states and progress indicators

### Performance Optimization
- **Lazy Loading**: Components loaded on demand
- **Pagination**: Large datasets handled with pagination
- **Caching**: Strategic caching of frequently accessed data
- **Debounced Validation**: Efficient real-time validation

### UI/UX Design
- **Material-UI Components**: Consistent design system
- **Responsive Design**: Mobile-friendly interfaces
- **Dark/Light Theme**: Supports both theme modes
- **Accessibility**: ARIA labels and keyboard navigation

## Future Enhancements

Potential future features based on the documentation:
- **Land Transfer**: Team-to-team land trading capabilities
- **Land Leasing**: Temporary land usage agreements
- **Resource Generation**: Land-based resource production
- **Territory Bonuses**: Benefits for contiguous land ownership
- **Advanced Analytics**: Predictive analytics and forecasting

## Development Guidelines

### Adding New Features
1. Update type definitions in `src/types/land.ts`
2. Add API methods to `landService.ts`
3. Create UI components in `components/land/`
4. Add pages to appropriate role directories
5. Update navigation and localization files

### Testing
- Unit tests for service methods
- Integration tests for API endpoints
- Component testing for UI elements
- E2E testing for complete workflows

### Code Style
- TypeScript strict mode enabled
- Consistent error handling patterns
- Comprehensive JSDoc documentation
- Material-UI design system adherence

This land management system provides a complete, production-ready solution that integrates seamlessly with the existing codebase architecture and design patterns.