# MTO Type 1: Population-Based Made-To-Order System

## Executive Summary

MTO Type 1 is a population-driven Made-To-Order procurement system where market demand is automatically calculated based on tile population distribution. The system enables teams to fulfill product requirements across multiple geographic tiles, with automatic demand allocation and settlement mechanisms.

## Background

### Target Users
- **Primary Users**: Student teams (role: entrepreneurs managing production facilities)
- **Secondary Users**: Game managers (setting up MTO requirements and monitoring fulfillment)
- **System Users**: Automated settlement and distribution systems

### Expected Impact
- **Business Metrics**:
  - Increased team engagement through predictable demand patterns
  - Revenue generation opportunities based on production capabilities
  - Market efficiency through population-based demand distribution
- **User Benefits**:
  - Clear visibility of market requirements per tile
  - Fair distribution of opportunities based on geographic reach
  - Automated settlement reducing manual intervention
- **Technical Benefits**:
  - Scalable demand calculation algorithm
  - Automated budget allocation and settlement
  - Integration with existing team account and transportation systems

## System Overview

MTO Type 1 implements a sophisticated demand generation and fulfillment system where:
1. Market requirements are generated based on **population distribution** across tiles (via Population System)
2. Teams deliver products matching **Manager Product Formulas** to specific tiles
3. **Transportation fees** are calculated using the platform's dual distance system
4. Settlement occurs automatically at predetermined times with payment processing

### Critical Platform Integrations
- **Population System**: Drives demand calculation using ActivityTileState.currentPopulation
- **Manager Product Formula**: Defines product specifications teams must match exactly
  - Products must have identical craft categories (no more, no less)
  - Raw materials must match exactly (same types and quantities)
  - No substitutions or additions allowed
- **Transportation System**: Calculates delivery and return fees using hex distance and terrain costs

## Key Features

### 1. Population-Based Demand Calculation
- Automatic requirement calculation based on tile population
- Intelligent budget constraint management
- Fair distribution algorithm preventing oversupply
- Detailed calculation history tracking for transparency

### 2. Geographic Distribution
- Tile-specific requirements visibility
- Transportation cost considerations
- **One delivery per team per tile** (teams can serve multiple tiles)

### 3. Automated Settlement
- Time-based settlement triggers
- Product formula validation with detailed tracking
- Automatic payment processing
- Unsettled product return options
- Complete settlement history for transparency

### 4. Budget Management
- Overall budget constraints
- Per-tile requirement adjustments
- Overflow prevention mechanisms

### 5. Internationalization (i18n)
- Full support for English and Chinese
- Translated status labels and messages
- Localized number and date formatting
- Error messages in user's language
- Calculation and settlement history descriptions

## Core Components

### Data Models
- `manager_requirement_product_type_1`: Main configuration entity
- `mto_type_1_tile_requirement`: Per-tile requirement tracking
- `mto_type_1_delivery`: Team delivery records
- `mto_type_1_settlement`: Settlement transaction records
- `mto_type_1_calculation_history`: Detailed calculation process tracking
- `mto_type_1_settlement_history`: Detailed settlement process tracking

### Business Logic
- **Demand Calculation Engine**: Computes per-tile requirements
- **Budget Constraint Processor**: Ensures total demand ≤ budget
- **Product Formula Validator**: Ensures exact match of craft categories and raw materials
- **Settlement Processor**: Validates and processes deliveries
- **Payment Integration**: Connects with team account system

### Integration Points
- **Product Formula System**: Validates product specifications
- **Team Account Module**: Processes payments and charges
- **Transportation System**: Calculates delivery costs
- **Facility Management**: Manages product storage and returns

## User Journey

### Manager Flow
1. Configure MTO Type 1 with formula, pricing, and timing
2. System calculates and displays per-tile requirements
3. Monitor delivery progress across teams
4. Review settlement results and statistics

### Team Flow
1. View available MTO Type 1 requirements at release time
2. Analyze tile-specific demand and transportation costs
3. **Deliver products to selected tiles** (one delivery per tile, can serve multiple tiles)
4. Receive payments or retrieve unsettled products

## Technical Architecture

### Services
- `MtoType1Service`: Core business logic
- `DemandCalculationService`: Requirement computation
- `SettlementService`: Settlement processing
- `DeliveryService`: Delivery management

### Controllers
- `ManagerMtoType1Controller`: Manager operations
- `TeamMtoType1Controller`: Team-facing operations

### Database Tables
- `manager_requirement_product_type_1`: Configuration
- `mto_type_1_tile_requirement`: Calculated requirements
- `mto_type_1_delivery`: Delivery records
- `mto_type_1_settlement`: Settlement history

## Performance Considerations

### Scalability
- Efficient batch processing for multi-tile calculations
- Optimized settlement algorithms for large delivery volumes
- Caching strategies for frequently accessed requirement data

### Reliability
- Transaction-safe settlement processing
- Rollback mechanisms for failed settlements
- Audit logging for all financial transactions

## Security & Compliance

### Access Control
- Manager-only configuration endpoints
- Team-restricted delivery operations (only RELEASED/IN_PROGRESS visible)
- No public access - authentication required

### Data Integrity
- Formula validation before acceptance
- Budget constraint enforcement
- Settlement atomicity guarantees

## Success Metrics

### System Metrics
- Requirement calculation time < 100ms
- Settlement processing < 5s for 1000 deliveries
- 99.9% uptime for critical operations

## Documentation

- [Data Model](./data-model.md) - Detailed schema definitions
- [Business Rules](./business-rules.md) - Complete business logic
- [API Specification](./api-specification.md) - Endpoint documentation
- [Integration Guide](./integration.md) - System integration details
- [i18n Design](./i18n-design.md) - Comprehensive internationalization support

## Version History

- v1.0.0 - Initial implementation with core features
- Planned: v1.1.0 - Multi-product bundle support
- Planned: v1.2.0 - Advanced optimization algorithms