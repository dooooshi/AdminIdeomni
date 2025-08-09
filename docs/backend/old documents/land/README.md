# Land Management System Documentation

Welcome to the comprehensive documentation for the Land Management System in the business simulation platform. This system enables teams to purchase, own, and manage territorial land areas on hexagonal map tiles using gold and carbon resources.

## Documentation Overview

This directory contains complete documentation for all aspects of the land management system:

### 📚 Core Documents

- **[Land API Reference](./land-api-reference.md)** - Complete API reference for all land-related endpoints
- **[Land System Overview](./land-system-overview.md)** - Architectural overview and technical implementation details
- **[Land Purchase User Guide](./land-purchase-user-guide.md)** - Step-by-step guide for students and workers
- **[Manager Land Oversight Guide](./manager-land-oversight.md)** - Comprehensive manager monitoring and analytics guide
- **[Land View Service Guide](./land-view-service.md)** - Technical guide for shared viewing functionality

## Quick Start

### For Students/Workers
1. Start with the **[Land Purchase User Guide](./land-purchase-user-guide.md)** for complete purchase workflows
2. Reference the **[Land API Reference](./land-api-reference.md)** for specific endpoint details
3. See the **[Land System Overview](./land-system-overview.md)** for business logic understanding

### For Managers
1. Begin with the **[Manager Land Oversight Guide](./manager-land-oversight.md)** for monitoring capabilities
2. Use the **[Land API Reference](./land-api-reference.md)** for manager-specific endpoints
3. Reference the **[Land System Overview](./land-system-overview.md)** for system architecture

### For Developers
1. Start with the **[Land System Overview](./land-system-overview.md)** for architecture and integration patterns
2. Review the **[Land View Service Guide](./land-view-service.md)** for service implementation details
3. Reference the **[Land API Reference](./land-api-reference.md)** for complete endpoint specifications

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Land Management System                   │
├─────────────────────────────────────────────────────────────┤
│  API Layer:                                                 │
│  • 13+ REST endpoints across 2 controllers                 │
│  • Role-based access (Student/Worker vs Manager)           │
├─────────────────────────────────────────────────────────────┤
│  Service Layer:                                             │
│  • LandPurchaseService (Core purchase logic)               │
│  • LandViewService (Shared viewing functionality)          │
│  • ManagerLandService (Analytics & oversight)              │
├─────────────────────────────────────────────────────────────┤
│  Data Layer:                                                │
│  • TileLandPurchase (Individual purchases)                 │
│  • TileLandOwnership (Aggregated ownership)                │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 🏗️ Core Functionality
- **Territory Acquisition**: Purchase fractional land area on hexagonal tiles
- **Dynamic Pricing**: Real-time gold and carbon pricing per tile
- **Multi-team Ownership**: Multiple teams can own portions of the same tile
- **Resource Integration**: Seamless integration with team account system

### 🛡️ Security & Validation
- **Role-based Access**: Student/Worker purchase vs Manager oversight permissions
- **Activity Scoping**: All operations scoped to user's current activity
- **Price Protection**: Optional maximum cost limits for purchase safety
- **Transaction Safety**: Database transactions ensure data consistency

### 📊 Analytics & Monitoring
- **Purchase History**: Complete audit trail of all land transactions
- **Team Rankings**: Performance comparison by area owned and spending
- **Market Analysis**: Purchase trends, tile utilization, and pricing patterns
- **Real-time Metrics**: Activity-wide statistics and performance indicators

### 🎯 Strategic Features
- **Ownership Transparency**: Full visibility into competitor land holdings
- **Market Intelligence**: Available tiles with pricing and competition data
- **Portfolio Management**: Comprehensive team land ownership summaries
- **Purchase Validation**: Pre-purchase capability and cost validation

## API Endpoints Summary

### Student/Worker Endpoints (8 endpoints)
- `POST /user/land-purchase/purchase` - Purchase land area
- `GET /user/land-purchase/history` - Purchase history with filtering
- `GET /user/land-purchase/owned-lands` - Team ownership summary
- `GET /user/land-purchase/available-tiles` - Available tiles for purchase
- `GET /user/land-purchase/tiles/:id/details` - Detailed tile information
- `GET /user/land-purchase/validate-purchase/:id/:area` - Purchase validation
- `GET /user/land-purchase/calculate-cost/:id/:area` - Cost calculation
- `GET /user/land-purchase/summary` - Alternative ownership summary

### Manager Endpoints (5 endpoints)
- `GET /user/manager/land-status/overview` - Activity-wide overview
- `GET /user/manager/land-status/tiles` - Detailed tile ownership with pagination
- `GET /user/manager/land-status/tiles/:id/ownership` - Specific tile ownership
- `GET /user/manager/land-status/analytics` - Comprehensive analytics
- `GET /user/manager/land-status/summary` - High-level summary statistics

## Integration Points

The land system integrates with several core platform systems:

- **🏦 Team Account System**: Resource deduction and balance management
- **🎯 Activity Management**: Activity-scoped operations and participant validation
- **🗺️ Hexagonal Map System**: Tile coordinates, pricing, and land types
- **👥 User Management**: Authentication, authorization, and team membership
- **📋 Operation History**: Audit trails for all land transactions

## Business Logic Highlights

### Purchase Workflow
1. **User & Team Validation**: Verify active team membership
2. **Tile & Pricing Validation**: Confirm tile exists with current pricing
3. **Cost Calculation**: Calculate gold and carbon costs with price protection
4. **Resource Validation**: Check team account balances
5. **Transaction Execution**: Atomic resource deduction and purchase recording
6. **Ownership Updates**: Update aggregated ownership records

### Ownership Management
- **Individual Purchases**: Complete audit trail via TileLandPurchase model
- **Aggregated Ownership**: Team totals via TileLandOwnership model
- **Historical Tracking**: Purchase timing and pricing evolution
- **Multi-team Support**: Shared tile ownership with detailed breakdowns

## Error Handling

The system uses a comprehensive exception hierarchy:
- **BusinessException**: Expected business logic errors (insufficient resources)
- **ValidationException**: Input validation errors (invalid parameters)
- **SystemException**: Unexpected system errors
- **BaseException**: Common exception interface with error codes

## Development Standards

- **TypeScript**: Strict typing throughout the system
- **Prisma ORM**: Database operations with transaction support
- **NestJS Framework**: Modular architecture with dependency injection
- **JWT Authentication**: Secure token-based authentication
- **Comprehensive Validation**: Input validation using class-validator
- **Exception Handling**: Structured error handling with business logic awareness

## Testing

The system includes comprehensive test coverage:
- **Unit Tests**: Service logic and business rules
- **Integration Tests**: Database operations and API endpoints
- **Validation Tests**: Input parameter validation
- **Error Handling Tests**: Exception scenarios and edge cases

## Performance Considerations

- **Database Optimization**: Indexed queries and aggregation views
- **Pagination Support**: All list endpoints support pagination
- **Transaction Management**: Efficient database connection pooling
- **Caching Strategy**: Strategic caching of frequently accessed data

## Future Enhancements

- **Land Transfer**: Team-to-team land trading capabilities
- **Land Leasing**: Temporary land usage agreements
- **Resource Generation**: Land-based resource production
- **Territory Bonuses**: Benefits for contiguous land ownership
- **Advanced Analytics**: Predictive analytics and forecasting

## Support and Troubleshooting

For common issues and troubleshooting:
- Review the specific guide for your role (Student/Worker or Manager)
- Check the API reference for correct endpoint usage
- Refer to the system overview for business logic understanding
- Examine error responses for specific problem identification

---

*This documentation covers the complete land management system as implemented in the business simulation platform. For questions or contributions, please refer to the project's main documentation or contact the development team.*