# Infrastructure Feature - Product Requirements Document

## Executive Summary

Based on the requirements analysis and data strategy, this PRD defines the implementation specifications for the Infrastructure feature. This feature transforms the simulation from independent facility building to a realistic ecosystem where infrastructure dependencies drive strategic decisions, team cooperation, and resource management learning.

## Feature Overview

### Core Concept
All Raw Material Production and Functional facilities require connections to four types of infrastructure to operate:
1. **WATER_PLANT** - Provides water resources via action point-based connections
2. **POWER_PLANT** - Provides power resources via action point-based connections
3. **BASE_STATION** - Provides communication services within influence range
4. **FIRE_STATION** - Provides safety services within influence range

### Key Mechanics
- **Connection-based Infrastructure** (Water/Power): Use action points to establish connections
- **Range-based Infrastructure** (Base/Fire): Provide services within influence radius
- **Cross-team Cooperation**: Teams can share infrastructure services with configurable pricing
- **Level Scaling**: Higher levels provide more action points and larger influence ranges

## User Stories

### As a Student Team Member (User Type 3 - The Players)
- I want to connect my team's facilities to infrastructure so they can operate
- I want to optimize connection paths to minimize action point usage
- I want to set prices for other teams using my team's infrastructure
- I want to request access to other teams' infrastructure services
- I want to upgrade my team's infrastructure to serve more facilities
- I want to learn resource management through gameplay
- I want to collaborate with my teammates on infrastructure strategy

### As a Manager (User Type 1 - Activity Administrator)
- I want to configure infrastructure parameters for the activity
- I want to monitor all teams' infrastructure usage and strategies
- I want to adjust difficulty by changing action points and costs
- I want to track learning outcomes from infrastructure decisions
- I want to intervene when teams are struggling
- I want to assist teams with questions and technical issues
- I want to see which infrastructure my facility is connected to
- I want to know if my facility has all required infrastructure services
- I want to apply for connections to nearby infrastructure
- I want to understand the cost of infrastructure connections

### As an Admin (Super Admin or Limited Admin - Platform Level)
- I want to configure action points and costs for each infrastructure type
- I want to set level-based multipliers for scaling
- I want to monitor infrastructure usage across teams
- I want to adjust infrastructure requirements per map template

## Functional Requirements

### Infrastructure Connections

#### Water and Power Plants
1. **Action Point System**
   - Each plant has action points based on level
   - Level 1: Base action points (configurable, default 10)
   - Level 2+: Base × multiplier (configurable)
   - Each connection consumes (distance + 1) action points

2. **Connection Rules**
   - Calculate distance using hexagonal grid algorithm
   - Connections cannot cross MARINE land type
   - Facilities can connect to any team's infrastructure
   - Connection remains active until explicitly removed

3. **Production Costs**
   - Each unit of water/power has a gold cost
   - Level 1: Base cost (configurable, default 4 gold)
   - Level 2+: Base × cost multiplier (configurable)

#### Base and Fire Stations
1. **Influence Range**
   - Level 1: Services only the station's tile (range 0)
   - Level 2+: Range = (level - 1) tiles
   - All facilities within range can use services

2. **Service Rules**
   - Automatic coverage within influence range
   - No action point consumption
   - Can serve unlimited facilities within range

### Cross-Team Cooperation

1. **Service Requests**
   - Teams can apply to use other teams' infrastructure
   - Request includes: facility ID, infrastructure ID, proposed terms
   - Infrastructure owner can approve/reject requests

2. **Pricing System**
   - Infrastructure owners set unit prices for services
   - Water/Power: Price per unit consumed
   - Base/Fire: Service fee per billing period
   - Prices can be updated at any time

3. **Approval Workflow**
   - Pending requests visible to infrastructure owner
   - Owner reviews and approves/rejects
   - Approved connections become active immediately
   - Audit log tracks all decisions

### Configuration Management

1. **Admin Settings** (per map template)
   - Initial action points for water/power plants
   - Action point multipliers per level
   - Production unit gold costs
   - Cost multipliers per level
   - Maximum connection distance (optional)

2. **Validation Rules**
   - Facilities cannot operate without all 4 infrastructure types
   - Connections validated on establishment and facility operations
   - Insufficient action points prevent new connections

## Non-Functional Requirements

### Performance
- Distance calculations must complete in < 50ms
- Path validation must complete in < 100ms
- Connection queries must return in < 200ms
- Support 100+ simultaneous connections per activity

### Scalability
- System must handle 50+ teams per activity
- Support 500+ facilities per activity
- Efficient caching for frequently calculated paths

### Security
- Team-based access control for infrastructure management
- Audit logging for all cross-team operations
- Validate all pricing changes and service requests

### Usability
- Clear visualization of infrastructure connections
- Intuitive approval workflow for service requests
- Real-time updates when connections change
- Helpful error messages for connection failures

## Success Metrics

### Engagement Metrics
- Average number of infrastructure connections per team
- Percentage of cross-team service sharing
- Infrastructure upgrade frequency

### Strategic Metrics
- Diversity in connection strategies
- Revenue generated from service sharing

### System Metrics
- Connection establishment success rate
- Average response time for distance calculations
- Cache hit rate for path validations

## User Journey Maps

### Connecting to Infrastructure (Student Team Process)
1. Team identifies facility needing infrastructure
2. Team member views available infrastructure options
3. System calculates distance and action point cost
4. System validates path (no MARINE crossing)
5. Team discusses and decides on best option
6. Team member confirms connection
7. System establishes connection and updates facility status
8. Team learns from cost-benefit outcomes

### Cross-Team Service Request (Between Student Teams)
1. Team A identifies needed infrastructure owned by Team B
2. Team A submits service request with proposed terms
3. Team B receives notification of request
4. Team B reviews request and pricing
5. Team B approves/rejects request (team decision)
6. If approved, connection established immediately
7. Billing begins based on agreed pricing
8. Both teams learn from negotiation process
9. Activity Manager monitors for fairness

## Dependencies

### Technical Dependencies
- Existing HexagonalGridService for distance calculations
- Facility management system for facility data
- Team management system for ownership
- Activity system for context

### Data Dependencies
- Map tiles with land type information
- Facility instances with location data
- Team membership and permissions

## Constraints

### Business Constraints
- All facilities must have all 4 infrastructure types to operate
- Infrastructure can only be built on appropriate land types
- Connections cannot cross MARINE tiles

### Technical Constraints
- Must integrate with existing Prisma models
- Must use existing authentication system
- Must support i18n (English/Chinese)

## Future Enhancements

### Phase 2 Considerations
- Infrastructure damage and repair mechanics
- Emergency infrastructure sharing during crises
- Specialized infrastructure types for specific industries

### Long-term Vision
- Infrastructure networks with redundancy
- Regional infrastructure monopolies
- Infrastructure technology upgrades
- Environmental impact considerations