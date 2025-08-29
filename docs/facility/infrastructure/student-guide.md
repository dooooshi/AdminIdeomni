# Infrastructure System - Student Guide

## Quick Start Guide

Welcome to the Infrastructure Management System! This guide will help you understand how to connect your facilities to essential infrastructure services and cooperate with other teams.

**Important**: All API endpoints automatically use your team and activity information from your login session. You don't need to specify your team ID or activity ID in any API calls - the system knows who you are!

## Understanding Infrastructure Requirements

### Which Facilities Need Infrastructure?

Your facilities fall into different categories. Only some require infrastructure to operate:

#### Facilities That NEED Infrastructure ✅
**Raw Material Production:**
- 🏭 MINE (矿场)
- ⛏️ QUARRY (采石场)
- 🌲 FOREST (林场)
- 🌾 FARM (农场)
- 🐄 RANCH (养殖场)
- 🐟 FISHERY (渔场)

**Functional Facilities:**
- 🏭 FACTORY (工厂)
- 🛍️ MALL (商场)
- 📦 WAREHOUSE (仓库)

#### Facilities That DON'T Need Infrastructure ❌
**Infrastructure (they provide it!):**
- 💧 WATER_PLANT (水厂)
- ⚡ POWER_PLANT (电厂)
- 📡 BASE_STATION (基站)
- 🚒 FIRE_STATION (消防站)

**Population Facilities:**
- 🏫 SCHOOL (学校)
- 🏥 HOSPITAL (医院)
- 🌳 PARK (公园)
- 🎬 CINEMA (影院)

### The Four Essential Infrastructure Types

For your production and functional facilities to work, you need ALL FOUR types:

1. **💧 Water** - Connection to a water plant
2. **⚡ Power** - Connection to a power plant
3. **📡 Base Station** - Coverage from a base station
4. **🚒 Fire Station** - Coverage from a fire station

**Important:** Your facility will only be fully operational when all four are connected!

### One Connection Rule ⚠️

**Critical Restriction**: Each facility can only have ONE connection per infrastructure type!

- ✅ ONE water connection (can't connect to multiple water plants)
- ✅ ONE power connection (can't connect to multiple power plants)
- ✅ ONE base station subscription (can't subscribe to multiple base stations)
- ✅ ONE fire station subscription (can't subscribe to multiple fire stations)

**If you want to switch providers:**
1. First disconnect from current provider
2. Then request connection to new provider

**For pending requests:**
- Can only have ONE pending request per type
- Must cancel existing pending request before applying to a different provider

## How to Check Your Facility Status

### Step 1: Check Individual Facility Status

```http
GET /api/infrastructure/status/facility/{your-facility-id}
```

This tells you:
- Which infrastructure you have ✅
- Which infrastructure you're missing ❌
- Your operational status (FULL, PARTIAL, or NON_OPERATIONAL)
- Current providers and their prices

#### Understanding the Response:
```json
{
  "operationalStatus": "PARTIAL",  // Your facility is partially working
  "missingInfrastructure": ["POWER", "FIRE_STATION"], // You need these!
  "infrastructureStatus": {
    "water": { 
      "connected": true,  // ✅ You have water!
      "unitPrice": 10     // You pay 10 gold per water unit
    },
    "power": { 
      "connected": false  // ❌ You need power!
    }
  }
}
```

### Step 2: Check All Your Team's Facilities

```http
GET /api/infrastructure/status/team/facilities
```

This gives you an overview of all your facilities and their status.

## Finding and Connecting to Infrastructure

### For Water and Power (Connection-Based)

These work by creating direct connections. The farther away, the more it costs the provider in operation points.

#### Step 1: Discover Available Providers

```http
GET /api/infrastructure/discovery/available/connections/{your-facility-id}
```

This shows you:
- Available water plants 💧
- Available power plants ⚡
- Distance to each provider
- Their prices
- If a valid path exists (can't cross water/marine tiles!)

#### Step 2: Request a Connection

Found a good provider? Request a connection:

```http
POST /api/infrastructure/connections/request
{
  "consumerFacilityId": "your-facility-id",
  "providerFacilityId": "their-water-plant-id",
  "connectionType": "WATER"
}
```

#### Step 3: Wait for Approval

The provider team will review your request and either:
- ✅ **Accept** - You're connected! Start using water/power
- ❌ **Reject** - Try another provider

#### Step 4: Monitor Your Connections

```http
GET /api/infrastructure/connections/consumer
```

### For Base Station and Fire Station (Range-Based)

These work by area coverage. You need to be within their influence range.

#### Step 1: Discover Services in Range

```http
GET /api/infrastructure/discovery/available/services/{your-facility-id}
```

This shows you:
- Base stations in range 📡
- Fire stations in range 🚒
- Their annual fees
- Distance from you

**Range Formula:** 
- Level 1 facility = covers only its own tile
- Level 2 facility = covers adjacent tiles (range 1)
- Level 3 facility = covers 2 tiles away (range 2)

#### Step 2: Subscribe to a Service

```http
POST /api/infrastructure/services/subscribe
{
  "consumerFacilityId": "your-facility-id",
  "serviceId": "their-base-station-id"
}
```

#### Step 3: Manage Subscriptions

```http
GET /api/infrastructure/services/subscriptions/consumer
```

## Becoming an Infrastructure Provider

If your team owns infrastructure facilities, you can provide services to others and earn revenue!

### Managing Water/Power Plants

#### Check Your Capacity

```http
GET /api/infrastructure/operations/provider/capacity/{your-plant-id}
```

This shows:
- Total operation points (based on facility level)
- Used points (current connections)
- Available points (for new connections)

**Capacity Formula:**
- Each connection costs: `distance + 1` operation points
- Level increases capacity: `basePoints × index^(level-1)`

#### Review Connection Requests

```http
GET /api/infrastructure/connections/requests/provider
```

#### Accept/Reject Requests

Accept:
```http
PUT /api/infrastructure/connections/requests/{request-id}/accept
{
  "unitPrice": 12  // Your price per unit
}
```

Reject:
```http
PUT /api/infrastructure/connections/requests/{request-id}/reject
{
  "reason": "Sorry, we're at full capacity"
}
```


### Managing Base/Fire Stations

#### Check Your Coverage Area

```http
GET /api/infrastructure/operations/influence-range/{your-station-id}
```

This shows:
- Your coverage radius
- Which tiles you cover
- Potential customers in range

#### Manage Service Subscriptions

View requests:
```http
GET /api/infrastructure/services/subscriptions/provider
```

Accept subscription:
```http
PUT /api/infrastructure/services/subscriptions/{subscription-id}/accept
{
  "annualFee": 1000
}
```


## Cost Management

### Understanding Costs

#### Water/Power Costs
- **Payment**: Per unit consumed
- **Formula**: `consumption × unitPrice`
- **When**: Continuous billing

#### Base/Fire Station Costs
- **Payment**: Annual fee
- **When**: Paid upfront each year

### Monitoring Your Expenses

Check requirements and costs:
```http
GET /api/infrastructure/operations/consumer/requirements/{your-facility-id}
```

This shows:
- Daily resource consumption
- Current prices
- Estimated daily/annual costs

## Strategic Tips

### For Consumers

1. **Location Matters** 🗺️
   - Build facilities near existing infrastructure
   - Avoid marine/water areas between you and providers

2. **Choose Providers Wisely** 🎯
   - You can only have ONE provider per infrastructure type
   - Research thoroughly before committing - switching requires disconnection
   - Consider provider reliability, not just price

3. **Compare Before Committing** 💰
   - Check ALL available providers before sending a request
   - Once connected, switching has downtime costs
   - Remember: only one pending request allowed per type

4. **Plan Ahead** 📋
   - Secure all four infrastructure types early
   - Non-operational facilities can't produce!
   - Coordinate with teammates to avoid conflicting requests

5. **Build Relationships** 🤝
   - Build good relationships with provider teams
   - Consider long-term partnerships
   - Reliable providers are worth slightly higher prices

### For Providers

1. **Strategic Positioning** 📍
   - Build infrastructure in central locations
   - Maximize your coverage area

2. **Capacity Management** 📊
   - Don't overcommit your operation points
   - Save capacity for premium customers

3. **Pricing Strategy** 💵
   - Set competitive prices to attract customers
   - Consider your operational costs
   - Balance revenue with customer acquisition

4. **Upgrade Wisely** ⬆️
   - Higher levels = more capacity and efficiency
   - Upgrades expand your coverage/capacity
   - Plan upgrades based on demand

## Common Issues and Solutions

### "Path crosses marine tiles"
**Problem:** Water/power connection blocked by ocean
**Solution:** Find providers on your side of the water

### "Out of range"
**Problem:** Too far from base/fire station
**Solution:** Find closer providers or wait for them to upgrade

### "Insufficient capacity"
**Problem:** Provider has no operation points left
**Solution:** Try another provider or wait for upgrades

### "Already connected"
**Problem:** Your facility already has an active connection of this type
**Solution:** You can only have ONE connection per type. Disconnect from current provider first, then connect to new one

### "Pending request exists"
**Problem:** Your facility already has a pending request for this infrastructure type
**Solution:** You can only have ONE pending request per type. Cancel the existing request first:
1. Find the pending request in your requests list
2. Cancel it
3. Then create a new request to a different provider

## Quick Reference - Essential APIs

### Status Checks
- Facility status: `GET /api/infrastructure/status/facility/{id}`
- Team overview: `GET /api/infrastructure/status/team/facilities`

### Discovery
- Find water/power: `GET /api/infrastructure/discovery/available/connections/{id}`
- Find services: `GET /api/infrastructure/discovery/available/services/{id}`

### Connections (Water/Power)
- Request: `POST /api/infrastructure/connections/request`
- View as consumer: `GET /api/infrastructure/connections/consumer`
- View as provider: `GET /api/infrastructure/connections/provider`

### Services (Base/Fire Station)
- Subscribe: `POST /api/infrastructure/services/subscribe`
- View subscriptions: `GET /api/infrastructure/services/subscriptions/consumer`

### Calculations
- Distance: `GET /api/infrastructure/operations/distance`
- Path validation: `GET /api/infrastructure/operations/path-validation`
- Provider capacity: `GET /api/infrastructure/operations/provider/capacity/{id}`

## Cooperation Strategies

### Forming Infrastructure Alliances
- **Mutual Support**: Trade infrastructure services
- **Regional Monopolies**: Control infrastructure in an area
- **Price Agreements**: Coordinate pricing with allies

### Competitive Strategies
- **Undercutting**: Offer lower prices than competitors
- **Exclusive Deals**: Offer special rates for exclusive connections
- **Strategic Denial**: Refuse connections to rival teams

## Activity Lifecycle

### Early Game (Days 1-3)
- Focus on securing all four infrastructure types
- Build relationships with infrastructure providers
- Consider building your own infrastructure if none available

### Mid Game (Days 4-7)
- Optimize connections for better prices
- Consider switching providers if better deals appear
- Infrastructure providers should upgrade for more capacity

### Late Game (Days 8-10)
- Maximize operational uptime
- Infrastructure providers maximize revenue
- Prepare for activity end (all connections will reset)

## Key Metrics to Track

### For Your Facilities
- **Operational Uptime**: % of time with full infrastructure
- **Infrastructure Costs**: Total spent on infrastructure
- **Cost per Unit**: Average cost for resources

### For Infrastructure Providers
- **Utilization Rate**: Used capacity / Total capacity
- **Revenue**: Total earned from connections/subscriptions
- **Customer Count**: Number of active connections

## Remember!

1. **All Four or Nothing**: You need ALL four infrastructure types for full operation
2. **Distance Matters**: Farther connections cost more (for providers)
3. **Cooperation is Key**: Work with other teams for mutual benefit
4. **Plan Ahead**: Secure infrastructure before you need it
5. **Monitor Costs**: Keep track of your infrastructure expenses

Good luck managing your infrastructure! 🎯