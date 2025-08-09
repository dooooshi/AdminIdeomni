# Land Purchase User Guide

This guide provides step-by-step instructions for students and workers to purchase land, manage their team's territorial holdings, and understand the land ownership system in the business simulation platform.

## Getting Started

### Prerequisites

Before you can purchase land, ensure you have:

1. **Active User Account**: Valid login credentials and JWT authentication token
2. **Team Membership**: Must be an active member of a simulation team
3. **Activity Enrollment**: Must be enrolled in a current business simulation activity
4. **Team Resources**: Team must have sufficient gold and carbon balances

### Understanding the Land System

The land system allows teams to purchase area on hexagonal map tiles using gold and carbon resources. Each tile can be partially owned by multiple teams, and ownership provides strategic advantages in the simulation.

**Key Concepts:**
- **Tiles**: Hexagonal map areas with different land types (PLAIN, COASTAL, MARINE)
- **Area**: Fractional units of land that can be purchased (0.001 to 100 units)
- **Dynamic Pricing**: Tile prices change based on activity state and demand
- **Team Ownership**: Shared ownership model where multiple teams can own portions of the same tile

## Step-by-Step Purchase Process

### Step 1: Explore Available Tiles

First, discover which tiles are available for purchase in your activity.

**API Call:**
```bash
GET /user/land-purchase/available-tiles
```

**What You'll See:**
```json
{
  "success": true,
  "data": [
    {
      "tileId": 1,
      "axialQ": 0,
      "axialR": 0,
      "landType": "PLAIN",
      "currentGoldPrice": 50.30,
      "currentCarbonPrice": 20.10,
      "currentPopulation": 1250,
      "totalOwnedArea": 3.5,
      "teamOwnedArea": 1.25,
      "availableArea": 21.5,
      "canPurchase": true
    }
  ],
  "count": 25
}
```

**Understanding the Response:**
- `tileId`: Unique identifier for the tile
- `axialQ`, `axialR`: Hexagonal coordinates
- `landType`: Type of terrain (affects pricing and benefits)
- `currentGoldPrice`/`currentCarbonPrice`: Current cost per area unit
- `totalOwnedArea`: Total area owned by all teams
- `teamOwnedArea`: Area your team currently owns
- `availableArea`: Remaining area available for purchase
- `canPurchase`: Whether your team can make additional purchases

### Step 2: Analyze Tile Details

Get detailed information about a specific tile before making a purchase decision.

**API Call:**
```bash
GET /user/land-purchase/tiles/{tileId}/details
```

**Example:** `GET /user/land-purchase/tiles/1/details`

**What You'll See:**
```json
{
  "success": true,
  "data": {
    "tile": {
      "id": 1,
      "axialQ": 0,
      "axialR": 0,
      "landType": "PLAIN",
      "initialGoldPrice": 45.00,
      "initialCarbonPrice": 18.00,
      "initialPopulation": 1200,
      "transportationCostUnit": 5.50
    },
    "currentState": {
      "currentGoldPrice": 50.30,
      "currentCarbonPrice": 20.10,
      "currentPopulation": 1250,
      "lastUpdated": "2025-07-20T10:30:00Z"
    },
    "ownership": [
      {
        "teamName": "Team Alpha",
        "ownedArea": 3.25,
        "totalSpent": 450.75,
        "purchaseCount": 3,
        "lastPurchaseDate": "2025-07-20T10:30:00Z"
      }
    ],
    "totalOwnedArea": 8.75,
    "availableArea": 16.25
  }
}
```

**Key Analysis Points:**
- **Price Trends**: Compare initial vs current prices to understand market movement
- **Competition**: See which teams already own area on this tile
- **Availability**: Check how much area remains for purchase
- **Strategic Value**: Consider population, land type, and transportation costs

### Step 3: Calculate Purchase Cost

Before committing to a purchase, calculate the exact cost for your desired area.

**API Call:**
```bash
GET /user/land-purchase/calculate-cost/{tileId}/{area}
```

**Example:** `GET /user/land-purchase/calculate-cost/1/2.5`

**What You'll See:**
```json
{
  "success": true,
  "data": {
    "goldCost": 125.75,
    "carbonCost": 50.30,
    "totalCost": 176.05,
    "goldPrice": 50.30,
    "carbonPrice": 20.12
  }
}
```

**Cost Breakdown:**
- `goldCost`: Total gold required (goldPrice × area)
- `carbonCost`: Total carbon required (carbonPrice × area)
- `totalCost`: Combined cost in equivalent units
- Current per-unit prices for reference

### Step 4: Validate Purchase Capability

Verify that your team has sufficient resources and can complete the purchase.

**API Call:**
```bash
GET /user/land-purchase/validate-purchase/{tileId}/{area}
```

**Example:** `GET /user/land-purchase/validate-purchase/1/2.5`

**Successful Validation:**
```json
{
  "success": true,
  "data": {
    "canPurchase": true,
    "goldCost": 125.75,
    "carbonCost": 50.30,
    "totalCost": 176.05,
    "availableArea": 22.5,
    "teamGoldBalance": 500.00,
    "teamCarbonBalance": 200.00,
    "errors": []
  }
}
```

**Insufficient Resources Example:**
```json
{
  "success": true,
  "data": {
    "canPurchase": false,
    "goldCost": 125.75,
    "carbonCost": 50.30,
    "totalCost": 176.05,
    "availableArea": 22.5,
    "teamGoldBalance": 100.00,
    "teamCarbonBalance": 30.00,
    "errors": [
      "Insufficient gold balance: need 125.75, have 100.00",
      "Insufficient carbon balance: need 50.30, have 30.00"
    ]
  }
}
```

### Step 5: Execute the Purchase

Once you've validated the purchase, proceed with the actual transaction.

**API Call:**
```bash
POST /user/land-purchase/purchase
```

**Request Body:**
```json
{
  "tileId": 1,
  "area": 2.5,
  "maxGoldCost": 130.00,
  "maxCarbonCost": 55.00,
  "description": "Strategic expansion for resource access"
}
```

**Request Parameters:**
- `tileId` (required): The tile to purchase area on
- `area` (required): Amount of area to purchase (0.001-100)
- `maxGoldCost` (optional): Maximum gold you're willing to spend (price protection)
- `maxCarbonCost` (optional): Maximum carbon you're willing to spend (price protection)
- `description` (optional): Note about the purchase purpose

**Successful Purchase Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx1a2b3c4d5e6f7g8h9i0j1",
    "tileId": 1,
    "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
    "purchasedArea": 2.5,
    "goldCost": 125.75,
    "carbonCost": 50.30,
    "purchaseDate": "2025-07-20T10:30:00Z",
    "status": "ACTIVE",
    "goldPriceAtPurchase": 50.30,
    "carbonPriceAtPurchase": 20.10,
    "description": "Strategic expansion for resource access"
  },
  "message": "Successfully purchased 2.5 area on tile 1"
}
```

### Step 6: Verify Your Purchase

After completing a purchase, verify it appears in your team's records.

**Check Purchase History:**
```bash
GET /user/land-purchase/history?page=1&pageSize=10
```

**Check Updated Team Ownership:**
```bash
GET /user/land-purchase/owned-lands
```

## Using Price Protection

Price protection helps you avoid overpaying if tile prices increase between validation and purchase.

### Setting Maximum Costs

When making a purchase, you can set maximum limits:

```json
{
  "tileId": 1,
  "area": 2.5,
  "maxGoldCost": 130.00,    // Won't pay more than 130 gold
  "maxCarbonCost": 55.00    // Won't pay more than 55 carbon
}
```

### What Happens When Limits Are Exceeded

If prices increase beyond your limits, the purchase will fail with a clear error:

```json
{
  "statusCode": 400,
  "message": "Gold cost exceeds maximum limit",
  "error": "Price Protection Exceeded",
  "details": {
    "resource": "gold",
    "actualCost": 135.50,
    "maxCost": 130.00
  }
}
```

## Managing Your Land Portfolio

### Viewing Team Ownership Summary

Get a comprehensive overview of all land your team owns:

**API Call:**
```bash
GET /user/land-purchase/owned-lands
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
    "teamName": "Team Alpha",
    "totalOwnedArea": 15.75,
    "totalSpent": 2500.50,
    "totalGoldSpent": 1800.25,
    "totalCarbonSpent": 700.25,
    "tilesOwnedCount": 8,
    "totalPurchases": 12,
    "firstPurchaseDate": "2025-07-15T10:30:00Z",
    "lastPurchaseDate": "2025-07-20T10:30:00Z"
  }
}
```

### Reviewing Purchase History

Track all your team's land purchases with filtering options:

**API Call:**
```bash
GET /user/land-purchase/history?tileId=1&status=ACTIVE&page=1
```

**Filtering Options:**
- `page`: Page number for pagination
- `pageSize`: Number of items per page (default: 20, max: 100)
- `tileId`: Filter by specific tile
- `status`: Filter by purchase status (ACTIVE, CANCELLED, EXPIRED)
- `startDate`: Filter purchases after this date
- `endDate`: Filter purchases before this date

## Strategic Considerations

### Choosing the Right Tiles

**Land Type Benefits:**
- **PLAIN**: Generally lower cost, good for initial expansion
- **COASTAL**: Medium cost, potential maritime access benefits
- **MARINE**: Higher cost, specialized strategic value

**Factors to Consider:**
- **Current vs Initial Pricing**: Look for undervalued tiles
- **Competition Level**: Avoid heavily contested tiles unless strategic
- **Population Density**: Higher population may indicate better value
- **Transportation Costs**: Lower costs improve resource efficiency
- **Available Area**: Ensure sufficient room for future expansion

### Budget Management

**Best Practices:**
- **Set Spending Limits**: Don't spend all resources on land
- **Use Price Protection**: Protect against sudden price increases
- **Diversify Holdings**: Spread purchases across multiple tiles
- **Monitor Market Trends**: Watch pricing patterns over time

### Timing Your Purchases

**Optimal Timing:**
- **Early Activity**: Lower competition, better prices
- **After Price Drops**: Capitalize on market fluctuations
- **Strategic Moments**: Coordinate with team strategy
- **Before Competitors**: Secure key tiles before others

## Common Workflows

### Basic Purchase Workflow

1. List available tiles
2. Calculate cost for desired area
3. Validate purchase capability
4. Execute purchase with price protection
5. Verify purchase in history

### Strategic Analysis Workflow

1. Get detailed tile information
2. Compare multiple tile options
3. Analyze current vs historical pricing
4. Review competitor activity
5. Make informed purchase decision

### Portfolio Management Workflow

1. Review current team ownership
2. Analyze purchase history and patterns
3. Identify expansion opportunities
4. Plan future purchases within budget
5. Monitor market conditions

## Troubleshooting Common Issues

### "User not an active team member"

**Problem**: You're not currently an active member of a team.

**Solutions:**
- Contact your manager to join a team
- Verify your team membership status
- Ensure you're enrolled in the current activity

### "Insufficient team resources"

**Problem**: Your team doesn't have enough gold or carbon.

**Solutions:**
- Wait for resource replenishment
- Reduce the area amount you're trying to purchase
- Coordinate with team members for resource strategy

### "Tile not found in current activity"

**Problem**: The tile you're trying to purchase doesn't exist in your activity.

**Solutions:**
- Verify the tile ID is correct
- Check that you're in the right activity
- Use the available tiles endpoint to see valid options

### "Price protection exceeded"

**Problem**: Tile prices increased beyond your maximum limits.

**Solutions:**
- Increase your maximum cost limits
- Try purchasing a smaller area
- Wait for potential price decreases

## Advanced Features

### Bulk Analysis

To analyze multiple tiles efficiently:

1. Get all available tiles
2. Use calculate-cost endpoint for each tile of interest
3. Compare costs and benefits
4. Make informed decisions about tile priority

### Market Monitoring

Track market conditions by:

1. Regularly checking tile details for price changes
2. Monitoring competitor activity in ownership breakdowns
3. Analyzing your purchase history for spending patterns
4. Using validation endpoint to check purchase feasibility

This guide provides the foundation for effective land management in the business simulation platform. Combine these techniques with strategic thinking and team coordination for optimal results.