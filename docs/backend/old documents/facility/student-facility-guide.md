# Student Facility Management Guide

## Overview

This guide provides comprehensive instructions for students to effectively use the Facility Building System within business simulation activities. Learn how to view available facilities, build new ones, upgrade existing facilities, and manage your team's facility portfolio for optimal business performance.

## Getting Started

### Prerequisites

Before you can build facilities, ensure you have:

1. **Active Account**: Valid student account with login credentials
2. **Team Membership**: Active membership in a business simulation team
3. **Activity Enrollment**: Participation in a current business activity
4. **Land Ownership**: Your team must own land on the tiles where you want to build

### Initial Setup Checklist

```bash
✓ Login to your account
✓ Verify team membership status
✓ Check current activity participation
✓ Review team resource balances (gold and carbon)
✓ Identify owned land tiles
✓ Familiarize yourself with available facility types
```

## Understanding Facility Types

### Facility Categories

#### 1. Raw Material Production (6 types)
These facilities generate basic resources for your business operations.

| Facility | Best For | Land Types | Build Cost | Upgrade Potential |
|----------|----------|------------|------------|-------------------|
| **MINE** | High-value extraction | PLAIN | High | Excellent (Level 4) |
| **QUARRY** | Construction materials | PLAIN | Medium-High | Good (Level 3) |
| **FOREST** | Sustainable resources | PLAIN | Medium | Good (Level 3) |
| **FARM** | Food production | COASTAL, PLAIN | Low-Medium | Good (Level 3-4) |
| **RANCH** | Livestock products | PLAIN | Medium | Good (Level 3) |
| **FISHERY** | Marine resources | MARINE, COASTAL | Medium | Good (Level 3-4) |

**💡 Student Tip**: Start with FARM or FOREST facilities - they're affordable and provide steady returns.

#### 2. Functional Facilities (3 types)
These facilities process materials and drive business operations.

| Facility | Best For | Land Types | Build Cost | Upgrade Potential |
|----------|----------|------------|------------|-------------------|
| **FACTORY** | Manufacturing | COASTAL, PLAIN | High | Excellent (Level 3-4) |
| **MALL** | Retail operations | COASTAL, PLAIN | Medium-High | Good (Level 2-3) |
| **WAREHOUSE** | Storage & logistics | COASTAL, PLAIN | Medium | Good (Level 2-3) |

**💡 Student Tip**: Build WAREHOUSE early to support other facility operations.

#### 3. Infrastructure (3 types)
Essential services that support all other operations.

| Facility | Best For | Land Types | Build Cost | Upgrade Potential |
|----------|----------|------------|------------|-------------------|
| **WATER_PLANT** | Water services | MARINE, PLAIN | High | Good (Level 2-3) |
| **POWER_PLANT** | Energy generation | PLAIN | Very High | Good (Level 3) |
| **BASE_STATION** | Communications | MARINE, PLAIN | High | Good (Level 2-3) |

**💡 Student Tip**: Infrastructure is expensive but essential - plan these investments carefully.

#### 4. Community Services (5 types)
Facilities that support team welfare and community needs.

| Facility | Best For | Land Types | Build Cost | Upgrade Potential |
|----------|----------|------------|------------|-------------------|
| **HOSPITAL** | Healthcare | COASTAL, PLAIN | High | Good (Level 2-3) |
| **SCHOOL** | Education | PLAIN | Medium-High | Limited (Level 2) |
| **FIRE_STATION** | Emergency services | PLAIN | Medium-High | Limited (Level 2) |
| **PARK** | Recreation | PLAIN | Low | Limited (Level 2) |
| **CINEMA** | Entertainment | PLAIN | Medium | Limited (Level 2) |

**💡 Student Tip**: PARK is the cheapest facility - great for beginners to learn the system.

## Step-by-Step Building Guide

### Step 1: Research Available Facilities

Before building, explore what's available for your activity:

```bash
# Using curl (for advanced users)
curl -X GET "http://localhost:2999/api/user/facility-configs/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Or use the web interface:
# Navigate to: Business Activity → Facilities → Available Configurations
```

**What to Look For:**
- Facilities compatible with your owned land types
- Build costs vs. your team's current resources
- Upgrade potential for long-term growth
- Maximum instances allowed per tile

### Step 2: Check Your Resources

Always verify your team's resource balance before planning builds:

```bash
# Check team resources
curl -X GET "http://localhost:2999/api/user/facilities/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Resource Planning Tips:**
- Keep 20% of resources in reserve for emergencies
- Plan multiple facilities together for cost efficiency
- Consider upgrade costs in your planning

### Step 3: Validate Build Capability

Use the validation endpoint to check if you can build before attempting:

```bash
# Validate building a MINE on tile 5
curl -X GET "http://localhost:2999/api/user/facilities/validate-build/5/MINE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Validation Response Interpretation:**
- `canBuild: true` - You're ready to build
- `canBuild: false` - Check the `errors` array for issues
- Review `costs` and `resources` sections for planning

### Step 4: Build Your Facility

Once validation passes, proceed with the build:

```bash
# Build a MINE on tile 5
curl -X POST "http://localhost:2999/api/user/facilities/build" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tileId": 5,
    "facilityType": "MINE",
    "description": "Primary gold mining operation",
    "maxGoldCost": 250.0,
    "maxCarbonCost": 100.0
  }'
```

**Build Parameters Explained:**
- `tileId`: The tile number where you want to build
- `facilityType`: Exact facility type (case-sensitive)
- `description`: Optional description for your records
- `maxGoldCost`/`maxCarbonCost`: Price protection limits (optional but recommended)

### Step 5: Monitor Construction

After building, verify the facility was created successfully:

```bash
# Check your team's facilities
curl -X GET "http://localhost:2999/api/user/facilities/owned" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Upgrading Facilities

### Understanding Upgrade Costs

Facility upgrades use progressive cost calculations:

**Formula**: `Upgrade Cost = Base Cost × (Multiplier ^ (Level - 1))`

**Example: MINE Upgrade (Base: 150 Gold, 60 Carbon, Multiplier: 1.6)**
- Level 1→2: 150 Gold, 60 Carbon (210 total)
- Level 2→3: 240 Gold, 96 Carbon (336 total)
- Level 3→4: 384 Gold, 154 Carbon (538 total)

### Upgrade Process

#### Step 1: Calculate Upgrade Costs

```bash
# Calculate costs to upgrade MINE from level 1 to 3
curl -X GET "http://localhost:2999/api/user/facility-configs/upgrade-costs?facilityType=MINE&fromLevel=1&toLevel=3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 2: Perform the Upgrade

```bash
# Upgrade facility to level 3
curl -X PUT "http://localhost:2999/api/user/facilities/FACILITY_ID/upgrade" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetLevel": 3,
    "maxUpgradeCost": 600.0
  }'
```

**Upgrade Tips:**
- Always use `maxUpgradeCost` for price protection
- Upgrade facilities with low multipliers first (FARM: 1.2x)
- Plan upgrade timing around resource abundance
- Focus on facilities with immediate impact

## Strategic Facility Management

### Beginner Strategy (First 5 Facilities)

1. **PARK** (PLAIN) - Learn the system, low cost
2. **FARM** (COASTAL/PLAIN) - Essential food production
3. **WAREHOUSE** (COASTAL/PLAIN) - Support operations
4. **MINE** or **QUARRY** (PLAIN) - Resource generation
5. **FACTORY** (COASTAL/PLAIN) - Value-added production

**Budget Allocation:**
- 60% on production facilities (FARM, MINE)
- 25% on functional facilities (WAREHOUSE, FACTORY)
- 15% kept in reserve

### Intermediate Strategy (6-12 Facilities)

**Phase 2 Expansion:**
6. **WATER_PLANT** - Essential infrastructure
7. **FISHERY** (if coastal land available)
8. **MALL** - Retail operations
9. **HOSPITAL** - Community services
10. **POWER_PLANT** - Advanced infrastructure

**Focus Areas:**
- Upgrade existing facilities to level 2-3
- Diversify across facility categories
- Build on different land types for variety

### Advanced Strategy (13+ Facilities)

**Optimization Phase:**
- Specialize in high-return facilities
- Maximize upgrade levels (3-4) on key facilities
- Build specialized facilities (BASE_STATION)
- Focus on ROI and efficiency metrics

### Resource Management Strategies

#### Conservative Approach (Low Risk)
- Keep 30% resources in reserve
- Build only after thorough validation
- Focus on low-cost, reliable facilities
- Upgrade slowly and systematically

#### Balanced Approach (Medium Risk)
- Keep 20% resources in reserve  
- Mix of production and functional facilities
- Strategic upgrades based on ROI
- Moderate expansion pace

#### Aggressive Approach (High Risk)
- Keep 10% resources in reserve
- Fast expansion with high-value facilities
- Quick upgrades to maximize returns
- Accept higher risk for faster growth

## Troubleshooting Common Issues

### Build Failures

#### "Team does not own land on this tile"
**Solution:**
1. Verify tile ownership: Check land management section
2. Purchase land on the target tile
3. Choose a different tile where your team owns land

#### "Insufficient gold/carbon"
**Solution:**
1. Check current team balance
2. Request resource transfer from team members
3. Choose a cheaper facility type
4. Wait for resource accumulation

#### "Facility not allowed on this land type"
**Solutions:**
1. Check facility-land compatibility:
   - MARINE: FISHERY, WATER_PLANT, BASE_STATION
   - COASTAL: FISHERY, FARM, FACTORY, MALL, WAREHOUSE, HOSPITAL
   - PLAIN: Most facilities (16 types)
2. Choose compatible facility for land type
3. Find tiles with compatible land type

#### "Maximum instances reached"
**Solution:**
1. Check current facility count on tile
2. Some facilities have instance limits (usually 1-3 per tile)
3. Choose different tile or facility type

### Upgrade Issues

#### "Facility not owned by team"
**Solution:**
1. Verify facility ownership in team facility list
2. Ensure you're upgrading team facilities, not other teams'
3. Check facility ID accuracy

#### "Target level exceeds maximum"
**Solution:**
1. Check facility's maximum level in configurations
2. Choose appropriate target level
3. Some facilities have limited upgrade potential

#### "Price protection exceeded"
**Solution:**
1. Increase `maxUpgradeCost` parameter
2. Upgrade to lower level first
3. Check actual costs vs. expectations

## Best Practices for Students

### Planning and Research

1. **Study Before Building**
   - Review all available facility types
   - Understand land type requirements
   - Calculate total costs including upgrades

2. **Team Coordination**
   - Discuss strategy with team members
   - Coordinate resource usage
   - Plan complementary facility builds

3. **Budget Management**
   - Always maintain resource reserves
   - Use price protection on large investments
   - Plan upgrade paths in advance

### Operational Excellence

1. **Start Small, Scale Smart**
   - Begin with low-cost facilities
   - Learn system mechanics
   - Gradually increase investment size

2. **Diversification Strategy**
   - Build across different categories
   - Use various land types
   - Balance production and services

3. **Upgrade Optimization**
   - Prioritize low-multiplier facilities
   - Focus on high-impact upgrades
   - Time upgrades with resource abundance

### Monitoring and Analysis

1. **Regular Facility Reviews**
   - Check facility status regularly
   - Monitor team facility summary
   - Track resource consumption patterns

2. **Performance Analysis**
   - Compare costs vs. benefits
   - Identify most efficient facilities
   - Plan future investments accordingly

3. **Team Collaboration**
   - Share facility strategies
   - Coordinate with team land purchases
   - Optimize collective facility portfolio

## API Quick Reference for Students

### Essential Endpoints

```bash
# View available facility configurations
GET /api/user/facility-configs/summary

# Check facilities by land type
GET /api/user/facility-configs/by-land-type?landType=COASTAL

# Calculate upgrade costs
GET /api/user/facility-configs/upgrade-costs?facilityType=MINE&toLevel=3

# Validate before building
GET /api/user/facilities/validate-build/{tileId}/{facilityType}

# Build facility
POST /api/user/facilities/build

# Upgrade facility
PUT /api/user/facilities/{facilityId}/upgrade

# View your team's facilities
GET /api/user/facilities/owned

# Get team facility summary
GET /api/user/facilities/summary

# Check facilities on specific tile
GET /api/user/facilities/tile/{tileId}
```

### Common Request Examples

```bash
# Basic facility build
{
  "tileId": 1,
  "facilityType": "FARM",
  "description": "Main agricultural facility"
}

# Protected facility build
{
  "tileId": 5,
  "facilityType": "MINE",
  "maxGoldCost": 250.0,
  "maxCarbonCost": 100.0,
  "description": "Gold mining operation"
}

# Facility upgrade
{
  "targetLevel": 2,
  "maxUpgradeCost": 300.0
}
```

## Success Metrics for Students

### Performance Indicators

1. **Facility Portfolio Growth**
   - Number of facilities built
   - Total investment value
   - Facility type diversity

2. **Resource Efficiency**
   - Cost per facility
   - Resource utilization rate
   - Upgrade completion rate

3. **Strategic Planning**
   - Build success rate
   - Validation usage
   - Price protection utilization

### Learning Objectives Achievement

- **Basic Understanding**: Successfully build first 3 facilities
- **Intermediate Mastery**: Complete 8+ facilities with 50% upgraded to level 2+
- **Advanced Expertise**: Manage 15+ facilities with strategic upgrade paths and ROI optimization

By following this guide, students will develop expertise in facility management that mirrors real-world business infrastructure planning and resource allocation strategies.