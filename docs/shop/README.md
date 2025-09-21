# Raw Material Shop Module (MVP)

## Background

### Target Users Type
- **Primary Users**: Students - Team members who purchase raw materials for production
- **Secondary Users**: Managers - Activity managers who collectively manage the shop and set prices

### Expected Impact
- **Business Metrics**:
  - Enable centralized material distribution within activities
  - Track material flow and consumption patterns
  - Create controlled economy simulation for learning
- **User Benefits**:
  - Managers control pricing and availability
  - Students buy at fixed prices (non-negotiable)
  - Teams learn resource management and market dynamics
- **Technical Benefits**:
  - Activity-scoped resource management
  - Simplified pricing model with fixed rates
  - Complete transaction and history tracking

### Platform Overview
The Raw Material Shop module provides a centralized marketplace for each activity where managers control material pricing and availability. The shop serves all teams within the activity, offering the standardized raw material catalog (172 materials across 7 categories) at fixed prices set by managers. "Fixed pricing" means students cannot negotiate - they buy at whatever price managers set. Managers can update prices anytime. Students purchase materials that are instantly delivered to their designated facility spaces.

**Technology Stack**:
- **Framework**: NestJS with Fastify adapter (port 2999)
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript
- **Package Manager**: pnpm (always use pnpm, never npm)
- **Authentication**: JWT with role-based system (Manager, Student, Worker)
- **i18n**: English and Chinese language support

## Core Concepts

### Shop Structure
- One shop per activity, shared by all teams in that activity
- Shop starts empty - managers must add materials they want to sell
- All managers can add/remove materials and set/update prices
- Shop can offer any selection from the 172 raw materials catalog
- Fixed pricing model - students buy at manager-set prices (no negotiation)

### Transaction Flow
1. Managers add materials to shop with initial prices
2. Managers set quantities to sell (or unlimited)
3. Managers can update prices anytime as needed
4. Students from any team in the activity browse available materials
5. Student selects materials and target facility space
6. System validates team funds and facility ownership
7. Transaction completes with instant delivery to facility
8. Transaction recorded in shop history and account history
9. All team members can view their team's purchase history

Note: Activity context is automatically determined from the user's authentication (via team membership) - no need to specify activityId in API calls

## Implementation Details

### Database Models
- Location: `prisma/models/raw-material-shop.prisma`
- Core entities: ActivityShop, ShopMaterial, ShopTransaction, ShopHistory, ShopPriceHistory

### API Endpoints
- Controller: `src/shop/controllers/raw-material-shop.controller.ts`
- Services: `src/shop/services/raw-material-shop.service.ts`
- DTOs: `src/shop/dto/`

### Architecture Decisions
- Activity-scoped shop with collaborative management
- Fixed pricing model - non-negotiable but adjustable by managers
- No price constraints - managers have full pricing control
- Direct material delivery to facility spaces
- Complete audit trail including price change history
- Integration with account history for financial tracking

### Testing Strategy
- Unit tests for pricing calculations
- Integration tests for transaction flow
- Load tests for concurrent purchases

## Quick Links

### Project Resources
- [CLAUDE.md](/CLAUDE.md) - Project guidelines and conventions
- [Raw Material List](/docs/facility/raw_material/raw_material_list/) - Material catalog reference
- [API Documentation](http://localhost:2999/docs) - Swagger UI
- [Prisma Studio](http://localhost:5555) - Database management

## MVP Scope

### Phase 1 Features (Current)
- Activity-based shop with multi-manager control
- Shop starts empty - managers explicitly add materials
- Manager-controlled pricing (set and update anytime)
- Control which materials to sell and in what quantity
- Purchase transactions with instant delivery
- Team purchase history for students (transparency within teams)
- Shop history tracking all changes (additions, removals, price updates)
- Account history integration

### Future Enhancements
- Material availability scheduling
- Bulk purchase options
- Material consumption forecasting
- Budget allocation tools
- Automated restocking

## Notes & Decisions Log

### Important Decisions
- One shop per activity serving all teams
- Managers have full control over pricing and availability
- Fixed pricing = non-negotiable (students can't bargain)
- No price constraints - managers set any price > 0
- Direct delivery to facility spaces (no transport delay)
- Complete audit trail including price history

### Open Questions
- Should there be purchase limits per team per day?
- How to handle manager conflicts on pricing?
- Should materials have availability windows?
- Integration with production planning?

### Risks & Mitigations
- **Risk**: Manager conflicts on pricing
  - **Mitigation**: Price change history and notifications to all managers
- **Risk**: Resource exhaustion
  - **Mitigation**: Availability limits and fair distribution
- **Risk**: Transaction overload
  - **Mitigation**: Queue-based processing