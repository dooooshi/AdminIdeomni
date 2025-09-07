# Transportation Module

## Background

The Transportation Module provides an instant logistics system for moving raw materials and products between facilities within the business simulation platform. This system enables teams to optimize their supply chains by transferring inventory between their own facilities or trading with other teams, with strategic cost and environmental tradeoffs.

### Target Users Type
- **Primary Users**: Student teams managing multiple facilities with inventory
- **Secondary Users**: Administrators configuring transportation costs and tier systems

### Expected Impact
- **Business Metrics**: 
  - Enable efficient resource distribution across facility networks
  - Reduce inventory holding costs through just-in-time transfers
  - Support cross-team trading and cooperation
- **User Benefits**: 
  - Instant inventory transfers between facilities
  - Strategic choice between cost and carbon footprint
  - Flexible tier system based on distance
- **Technical Benefits**: 
  - Atomic transactions ensuring data consistency
  - Integration with existing facility-space inventory system
  - Admin-configurable parameters for different scenarios

### Platform Overview
The transportation system integrates with the existing facility infrastructure, leveraging:
- **Facility Space Management**: Source and destination inventory tracking
- **Infrastructure Distance Calculation**: Hexagonal grid pathfinding
- **Team Account System**: Automated fee collection
- **Carbon Emission Tracking**: Environmental impact monitoring

**Technology Stack**:
- **Framework**: NestJS with Fastify adapter (port 2999)
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript
- **Package Manager**: pnpm (always use pnpm, never npm)
- **Authentication**: JWT with dual-tier system (Admin + User)
- **i18n**: English and Chinese language support

## Implementation Details

### Core Features

#### 1. Instant Transfer System
- Immediate inventory deduction from source facility
- Immediate inventory addition to destination facility
- Atomic transactions (all or nothing)
- No delivery time or in-transit status

#### 2. Space-Based Pricing Model
Four transportation tiers with exclusive hex distance ranges and space-based pricing:
- **Tier A**: Economy tier - ONLY for 1-3 hexes (5 gold per space unit per transport unit)
- **Tier B**: Standard tier - ONLY for 4-6 hexes (3 gold per space unit per transport unit)
- **Tier C**: Express tier - ONLY for 7-9 hexes (2 gold per space unit per transport unit)
- **Tier D**: Premium tier - ONLY for >9 hexes (1 gold per space unit per transport unit)

**Note**: Space units are based on the carbon emission value of items (quantity × carbon emission per item)

#### 3. Dual Distance System

**Critical**: The transportation system uses TWO different distance measurements:

1. **Hex Distance** (for Tier Selection)
   - Simple hex count between facilities
   - Determines which tier is available
   - Each hex distance range has exactly ONE available tier:
     - 1-3 hexes: Tier A only
     - 4-6 hexes: Tier B only
     - 7-9 hexes: Tier C only
     - >9 hexes: Tier D only

2. **Transportation Cost Units** (for Fee Calculation)
   - Sum of `transportationCostUnit` values from each MapTile along the optimal path
   - Each tile has its own cost (e.g., mountain=3, plain=1)
   - Used to calculate the actual transportation fee

**Example**: 
- Hex distance: 5 hexes (straight line) → Tier B is available
- Path tiles: [1, 3, 2, 1, 1] → Total transport cost units = 8
- Final cost: Space units × 3 gold × 8 transport units

#### 4. Carbon Emission Tracking
- Each tier has different carbon emission rates
- Emissions calculated per unit transported per distance
- Contributes to team's overall carbon footprint

### Database Models
- Location: `prisma/models/transportation.prisma`
- Key models:
  - `TransportationConfig`: Admin-managed tier settings
  - `TransportationOrder`: Completed transfer records
  - `TransportationCostLog`: Audit trail for fees

### API Endpoints
- Controller: `src/transportation/controllers/`
- Services: `src/transportation/services/`
- DTOs: `src/transportation/dto/`

#### Admin Endpoints
- `POST /api/admin/transportation-configs` - Create configuration
- `PUT /api/admin/transportation-configs/:id` - Update configuration
- `GET /api/admin/transportation-configs` - List configurations

#### User Endpoints
- `POST /api/transportation/calculate` - Calculate transfer cost
- `POST /api/transportation/transfer` - Execute instant transfer
- `GET /api/transportation/available-routes` - Get available tiers
- `GET /api/transportation/history` - View transfer history

### Architecture Decisions

#### 1. Instant Execution Model
- **Decision**: Transfers complete instantly rather than having delivery time
- **Rationale**: Simplifies gameplay and reduces system complexity
- **Impact**: No need for tracking in-transit items or delivery schedules

#### 2. System-Collected Fees
- **Decision**: Transportation fees go to the system, not other players
- **Rationale**: Prevents exploitation and maintains economic balance
- **Impact**: Acts as a gold sink in the game economy

#### 3. Exclusive Tier-Distance Mapping
- **Decision**: Each tier is exclusively available for its specific distance range
- **Rationale**: Simplifies decision-making and prevents cost optimization exploits
- **Impact**: Distance automatically determines the tier, focus shifts to route planning

#### 5. Hybrid Distance Calculation
- **Decision**: Use hex distance for tier selection, transportationCostUnit sum for fee calculation
- **Rationale**: Simplifies tier selection while maintaining terrain-based cost variation
- **Impact**: Clear tier boundaries with terrain-sensitive pricing

#### 4. Integration with Facility Space
- **Decision**: Direct integration with FacilitySpaceInventory
- **Rationale**: Leverages existing inventory management system
- **Impact**: Maintains consistency with space constraints

### Testing Strategy

#### Integration Tests
- Transfer between same-team facilities
- Cross-team transfers
- Distance calculation accuracy
- Tier availability validation
- Insufficient funds handling
- Insufficient space handling

#### Performance Tests
- Concurrent transfer requests
- Large quantity transfers
- Path calculation optimization

## Quick Links

### Project Resources
- [CLAUDE.md](/CLAUDE.md) - Project guidelines and conventions
- [API Documentation](http://localhost:2999/docs) - Swagger UI
- [Prisma Studio](http://localhost:5555) - Database management

### Related Documentation
- [Integration Summary](./integration-summary.md) - How transportation integrates with existing models
- [Facility Space Management](../facility/facility-space/README.md)
- [Infrastructure System](../facility/infrastructure/README.md)
- [Team Account System](../team/account/README.md)

## Notes & Decisions Log

### Important Decisions

1. **Instant vs Delayed Delivery** (2024-01)
   - Chose instant delivery for simplicity
   - Reduces complexity of tracking shipments
   - Better user experience for simulation

2. **Space-Based Cost Calculation** (2024-01)
   - Costs are calculated based on space units (carbon emission units)
   - Tier A: 5 gold per space unit per transport unit
   - Tier B: 30 gold per 10 space units per transport unit (3 gold per space unit)
   - Tier C: 200 gold per 100 space units per transport unit (2 gold per space unit)
   - Tier D: 1000 gold per 1000 space units per transport unit (1 gold per space unit)
   - Space units come from:
     - Raw Materials: `RawMaterial.carbonEmission`
     - Products: `ProductFormula.productFormulaCarbonEmission`
     - Inventory: `FacilityInventoryItem.totalSpaceOccupied`

3. **Carbon Emission Units** (2024-01)
   - Emissions add to facility's carbon footprint
   - Measured per unit per transport unit distance
   - Aligns with facility space carbon metrics

4. **Dual Distance System** (2024-01)
   - **Hex distance**: Determines tier availability (1-3=A, 4-6=B, 7-9=C, >9=D)
   - **Transport cost units**: Sum of MapTile.transportationCostUnit values for fee calculation
   - Tier selection based on simple hex count
   - Fee calculation based on terrain difficulty
   - Pathfinding algorithms minimize total transportation cost

### Open Questions

1. Should there be daily/weekly transfer limits?
2. Should certain item types have transfer restrictions?
3. Should weather or events affect transportation availability?

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Exploitation through rapid transfers | Economic imbalance | Implement rate limiting or cooldowns |
| Network congestion from mass transfers | Performance degradation | Queue system for bulk operations |
| Cross-team collusion | Unfair advantage | Activity organizer monitoring tools |
| Insufficient funds causing failed transfers | Poor user experience | Pre-validation and cost preview |

## Development Workflow

### Adding New Features
1. Update business rules documentation
2. Modify Prisma schema if needed
3. Run `pnpm run prisma:generate`
4. Implement service logic
5. Add API endpoints
6. Write integration tests
7. Update API documentation

### Configuration Management
1. Admin creates TransportationConfig for each map template
2. Configuration includes all tier parameters
3. Changes take effect immediately for new transfers
4. Historical transfers maintain their original costs

### Monitoring
- Track total transfer volume by team
- Monitor carbon emissions from transportation
- Track tier usage patterns
- Identify bottleneck routes