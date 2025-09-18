# MTO Type 2: MALL-Based Competitive Bidding System

## Executive Summary

MTO Type 2 is a marketplace-driven Made-To-Order procurement system exclusive to teams operating MALL facilities. Unlike the population-based distribution of Type 1, Type 2 creates a competitive bidding environment where MALL operators submit products with self-determined pricing, competing for procurement budgets that are dynamically allocated based on MALL location populations at settlement time.

## Background

### Target Users
- **Primary Users**: Teams with MALL facilities (entrepreneurs managing retail infrastructure)
- **Secondary Users**: Game managers (configuring procurement requirements and monitoring market dynamics)
- **System Users**: Automated budget distribution and settlement systems

### Expected Impact
- **Business Metrics**:
  - Enhanced competitive dynamics through price-based competition
  - Strategic MALL placement incentivization in high-population areas
  - Market efficiency through supply-demand price discovery
  - Increased revenue opportunities for efficient producers
- **User Benefits**:
  - Freedom to set competitive pricing strategies
  - Direct control over profit margins
  - Rewards for efficient production and strategic facility placement
  - Clear market feedback through settlement results
- **Technical Benefits**:
  - Dynamic budget allocation algorithm
  - Efficient price-based sorting and fulfillment
  - Scalable settlement processing for multiple MALLs

## System Overview

MTO Type 2 implements a sophisticated competitive marketplace where:
1. Only teams with **MALL facilities** can participate in procurement
2. Teams submit products to their MALLs with **self-determined unit prices**
3. At settlement, budgets are **dynamically allocated** based on MALL tile populations
4. Products are purchased in **price order** (lowest first) until budget exhaustion
5. Teams can retrieve unsettled products post-settlement

### Critical Distinctions from Type 1
- **Participation**: Restricted to MALL owners vs. open to all teams
- **Pricing**: Market-driven (teams set prices) vs. fixed procurement price
- **Distribution**: Competitive bidding vs. guaranteed demand per tile
- **Risk**: Teams bear inventory risk vs. guaranteed purchase up to requirements
- **Strategy**: Price optimization and MALL placement vs. production and logistics

### Platform Integration Requirements
- **Facility Management**: Verification of MALL ownership and capacity
- **Manager Product Formula**: Exact specification matching (identical to Type 1)
- **Team Account Module**: Payment processing and transaction management
- **Transportation System**: Product delivery to MALLs and unsettled returns

## Key Features

### 1. MALL-Exclusive Participation
- Automatic verification of MALL facility ownership
- Product storage within MALL facility space constraints
- Strategic advantage for teams investing in retail infrastructure
- **One submission per team per tile** - teams can submit to multiple tiles

### 2. Competitive Price Mechanism
- Teams set individual unit prices for submissions
- No price floors or ceilings (pure market dynamics)
- **Submissions are final** - no modifications or withdrawals allowed
- Price visibility restrictions until settlement
- Historical price analytics for strategy optimization

### 3. Dynamic Budget Distribution
- Real-time population calculation for MALL tiles
- Proportional budget allocation based on population ratios
- Fair opportunity for all MALL locations
- Transparent allocation formulas and history

### 4. Level and Price-Based Fulfillment
- **Priority given to highest level MALLs** (Level 5 → Level 1)
- Within same level, sorted by unit price (ascending)
- Sequential purchase until budget depletion
- Partial order fulfillment support
- Clear settlement priority visibility

### 5. Settlement Processing
- Automated formula validation for all submissions
- Atomic transaction processing per tile
- Immediate payment upon successful settlement
- Detailed settlement reports with fulfillment metrics

### 6. Unsettled Product Management
- Clear identification of unsettled inventory
- Flexible return options to any facility
- Transportation fee calculation for returns
- Time-limited retrieval windows

### 7. Internationalization (i18n)
- Full support for English and Chinese
- Localized pricing displays and number formatting
- Translated status messages and notifications
- Multi-language settlement reports

## Core Components

### Data Models
- `manager_requirement_product_type_2`: Main procurement configuration
- `mto_type_2_submission`: MALL product submissions with pricing
- `mto_type_2_mall_budget`: Per-tile budget allocations
- `mto_type_2_settlement`: Settlement transaction records
- `mto_type_2_calculation_history`: Budget distribution audit trail

### Business Logic
- **MALL Verification Engine**: Validates facility ownership and capacity
- **Budget Distribution Calculator**: Computes per-tile allocations
- **Price Sorter**: Orders submissions by competitive pricing
- **Settlement Processor**: Executes price-based fulfillment
- **Payment Handler**: Manages team account transactions

### Integration Points
- **Facility Management System**: MALL verification and capacity checks
- **Product Formula System**: Specification validation
- **Team Account Module**: Financial transactions
- **Transportation System**: Delivery and return logistics
- **Population System**: Dynamic budget allocation basis

## User Journey

### Manager Flow
1. Configure MTO Type 2 with formula and overall budget
2. Set release and settlement times
3. System announces to all MALL-owning teams
4. Monitor submission activity and pricing trends
5. Review settlement results and market dynamics

### MALL Owner Flow
1. Receive MTO Type 2 announcement at release time
2. Analyze product formula and market opportunity
3. Determine competitive pricing strategy
4. Submit products from MALL inventory with pricing
5. Await settlement results
6. Receive payments or arrange unsettled returns

### Non-MALL Team Flow
1. View MTO Type 2 announcements (read-only)
2. Consider MALL facility investment for future participation
3. Potentially supply products to MALL-owning teams

## Technical Architecture

### Services
- `MtoType2Service`: Core business orchestration
- `MallVerificationService`: Facility ownership validation
- `BudgetDistributionService`: Dynamic allocation calculation
- `PriceCompetitionService`: Submission sorting and fulfillment
- `SettlementService`: Transaction processing

### Controllers
- `AdminMtoType2Controller`: Administrative configuration
- `MallMtoType2Controller`: MALL owner operations
- `PublicMtoType2Controller`: Read-only public access

### Database Schema
- Optimized for high-volume submissions
- Indexed for price-based queries
- Transaction-safe settlement processing
- Complete audit trail maintenance

## Performance Considerations

### Scalability
- Efficient handling of thousands of submissions
- Optimized price sorting algorithms
- Batch processing for settlement transactions
- Caching for frequently accessed MTO data

### Reliability
- ACID compliance for financial transactions
- Rollback capabilities for failed settlements
- Comprehensive error handling and recovery
- Real-time monitoring and alerting

### Response Time Targets
- Submission processing < 100ms
- Budget calculation < 200ms for 100 MALLs
- Settlement completion < 10s for 10,000 submissions
- Query operations < 50ms

## Security & Compliance

### Access Control
- MALL ownership verification for submissions
- Manager-only configuration endpoints
- Read-only public visibility for non-participants
- JWT-based authentication throughout

### Data Integrity
- Formula validation before submission acceptance
- Price tampering prevention
- Settlement atomicity guarantees
- Complete audit logging

### Competitive Fairness
- Price opacity until settlement
- Simultaneous settlement processing
- No preferential treatment algorithms
- Transparent allocation formulas

## Success Metrics

### Business Metrics
- Average number of submissions per MTO
- Price variance and competition intensity
- MALL facility utilization rates
- Settlement fulfillment percentages

### System Metrics
- Submission processing throughput
- Settlement execution time
- System availability (target 99.9%)
- Error rates < 0.1%

### User Satisfaction
- MALL owner participation rates
- Repeat submission frequency
- Price discovery effectiveness
- Fair competition perception

## Documentation

- [Data Model](./data-model.md) - Complete schema definitions
- [Business Rules](./business-rules.md) - Detailed business logic
- [API Specification](./api-specification.md) - Comprehensive endpoint documentation
- [Integration Guide](./integration.md) - System integration specifications
- [i18n Design](./i18n-design.md) - Internationalization implementation

## Version History

- v1.0.0 - Initial implementation with core bidding functionality
- Planned: v1.1.0 - Advanced pricing analytics and recommendations
- Planned: v1.2.0 - Multi-round bidding support
- Planned: v1.3.0 - Cross-MTO bundle opportunities