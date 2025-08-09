# Manager Land Oversight Guide

This guide provides comprehensive instructions for managers to monitor, analyze, and oversee all land-related activities within their business simulation activities. The manager oversight system offers powerful analytics, reporting, and monitoring capabilities for territorial management.

## Overview

As a manager, you have read-only access to comprehensive land management data across your entire activity. This includes team purchases, ownership patterns, market analytics, and performance metrics. You cannot make purchases directly but have full visibility into all land-related activities.

### Key Capabilities

- **Activity-Wide Overview**: See all land purchases and ownership across teams
- **Real-Time Analytics**: Track purchase trends, revenue, and team performance
- **Tile Management**: Monitor individual tile ownership and availability
- **Team Rankings**: Compare team performance by area owned and spending
- **Market Intelligence**: Analyze pricing trends and land utilization

## Getting Started

### Prerequisites

- **Manager Role**: Must have manager-level permissions
- **Activity Assignment**: Must be assigned to manage a current activity
- **Authentication**: Valid JWT token with manager privileges

### Understanding Manager Permissions

Managers have elevated read-only access to:
- All team land purchases within their activity
- Complete ownership breakdowns by team and tile
- Historical purchase data and trends
- Team resource spending patterns
- Activity-wide performance metrics

## Core Oversight Functions

### Activity Land Overview

Get a comprehensive snapshot of all land activity in your managed activity.

**API Call:**
```bash
GET /user/manager/land-status/overview
```

**Response Overview:**
```json
{
  "success": true,
  "data": {
    "activityId": "clx1a2b3c4d5e6f7g8h9i0j1",
    "activityName": "Business Simulation 2025",
    "totalLandPurchases": 45,
    "totalAreaPurchased": 127.5,
    "totalGoldSpent": 5420.75,
    "totalCarbonSpent": 2180.30,
    "totalRevenue": 7601.05,
    "teamsWithLand": 8,
    "tilesWithOwnership": 15,
    "averageAreaPerTeam": 15.94,
    "mostActiveTile": {
      "tileId": 12,
      "purchaseCount": 8,
      "totalArea": 18.5
    },
    "topTeamByArea": {
      "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
      "teamName": "Team Alpha",
      "totalArea": 32.75
    },
    "recentPurchases": [...]
  }
}
```

### Key Metrics Explained

**Activity Summary Metrics:**
- `totalLandPurchases`: Total number of individual purchase transactions
- `totalAreaPurchased`: Sum of all area purchased across all teams
- `totalGoldSpent`/`totalCarbonSpent`: Total resources spent on land
- `totalRevenue`: Combined value of all land purchases
- `teamsWithLand`: Number of teams that own land
- `tilesWithOwnership`: Number of tiles with at least some ownership
- `averageAreaPerTeam`: Mean area owned per participating team

**Performance Indicators:**
- `mostActiveTile`: Tile with highest purchase activity
- `topTeamByArea`: Team with largest total land holdings
- `recentPurchases`: Latest purchase activity for monitoring

## Detailed Tile Management

### Tile Ownership Analysis

Get detailed ownership information for all tiles with pagination and filtering.

**API Call:**
```bash
GET /user/manager/land-status/tiles?page=1&pageSize=20&landType=PLAIN
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)
- `tileId`: Filter by specific tile ID
- `landType`: Filter by land type (PLAIN, COASTAL, MARINE)

**Response Structure:**
```json
{
  "data": [
    {
      "tileId": 1,
      "axialQ": 0,
      "axialR": 0,
      "landType": "PLAIN",
      "currentGoldPrice": 50.30,
      "currentCarbonPrice": 20.10,
      "currentPopulation": 1250,
      "totalOwnedArea": 8.75,
      "availableArea": 16.25,
      "totalRevenue": 625.50,
      "ownershipBreakdown": [
        {
          "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
          "teamName": "Team Alpha",
          "ownedArea": 3.25,
          "totalSpent": 229.05,
          "purchaseCount": 2,
          "lastPurchaseDate": "2025-07-20T10:30:00Z"
        }
      ]
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3,
  "hasNext": true,
  "hasPrevious": false
}
```

### Individual Tile Analysis

Get comprehensive information about a specific tile's ownership and activity.

**API Call:**
```bash
GET /user/manager/land-status/tiles/{tileId}/ownership
```

**Example:** `GET /user/manager/land-status/tiles/1/ownership`

**Use Cases:**
- Investigate tiles with high competition
- Analyze pricing vs demand patterns
- Monitor team expansion strategies
- Identify underutilized tiles

## Comprehensive Analytics

### Land Purchase Analytics

Access detailed analytics about purchase patterns, trends, and performance.

**API Call:**
```bash
GET /user/manager/land-status/analytics
```

**Analytics Categories:**

#### Purchase Volume Tracking
```json
"totalPurchases": {
  "today": 5,
  "thisWeek": 23,
  "thisMonth": 45,
  "total": 127
}
```

#### Revenue Analysis
```json
"totalRevenue": {
  "today": 425.50,
  "thisWeek": 2180.75,
  "thisMonth": 5420.30,
  "total": 12450.80
}
```

#### Land Type Performance
```json
"purchasesByLandType": [
  {
    "landType": "PLAIN",
    "purchases": 45,
    "area": 127.5,
    "revenue": 6250.75
  },
  {
    "landType": "COASTAL",
    "purchases": 23,
    "area": 67.25,
    "revenue": 3850.30
  }
]
```

#### Top Performing Tiles
```json
"topPerformingTiles": [
  {
    "tileId": 12,
    "axialQ": 2,
    "axialR": -1,
    "landType": "COASTAL",
    "totalRevenue": 850.25,
    "totalArea": 18.5,
    "purchases": 8
  }
]
```

#### Team Performance Rankings
```json
"teamRankings": {
  "byArea": [
    {
      "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
      "teamName": "Team Alpha",
      "totalArea": 32.75,
      "rank": 1
    }
  ],
  "bySpending": [
    {
      "teamId": "clx1a2b3c4d5e6f7g8h9i0j2",
      "teamName": "Team Alpha",
      "totalSpent": 2450.80,
      "rank": 1
    }
  ]
}
```

#### Purchase Trends
```json
"purchaseTrends": [
  {
    "date": "2025-07-20",
    "purchases": 5,
    "area": 12.75,
    "revenue": 425.50
  }
]
```

### Summary Statistics

Get high-level summary statistics for quick activity assessment.

**API Call:**
```bash
GET /user/manager/land-status/summary
```

**Key Metrics:**
- Land utilization rates
- Average revenue per tile
- Team participation levels
- Market efficiency indicators

## Manager Workflows

### Daily Monitoring Workflow

1. **Check Activity Overview**
   - Review total activity metrics
   - Identify recent purchase activity
   - Note any significant changes

2. **Analyze Team Performance**
   - Review team rankings by area and spending
   - Identify high-performing and struggling teams
   - Check for unusual purchase patterns

3. **Monitor Market Activity**
   - Check most active tiles
   - Review pricing trends
   - Identify emerging hotspots

### Weekly Analysis Workflow

1. **Comprehensive Analytics Review**
   - Examine weekly purchase trends
   - Analyze land type performance
   - Review revenue generation patterns

2. **Team Strategy Assessment**
   - Compare team expansion strategies
   - Identify successful patterns
   - Note areas for guidance

3. **Market Evolution Tracking**
   - Monitor price changes across tiles
   - Track utilization rates
   - Identify market inefficiencies

### Performance Investigation Workflow

1. **Identify Investigation Target**
   - Unusual team performance
   - Abnormal tile activity
   - Market anomalies

2. **Deep Dive Analysis**
   - Use detailed tile ownership data
   - Review specific team purchase histories
   - Analyze timing and pricing patterns

3. **Generate Insights**
   - Document findings
   - Identify actionable patterns
   - Prepare guidance for teams

## Advanced Analysis Techniques

### Comparative Analysis

**Team Performance Comparison:**
```bash
# Get overview for baseline metrics
GET /user/manager/land-status/overview

# Get detailed analytics for deeper insights
GET /user/manager/land-status/analytics

# Analyze specific high-performing teams
GET /user/manager/land-status/tiles?page=1&pageSize=50
```

**Market Opportunity Analysis:**
1. Identify underutilized tiles with low total ownership
2. Compare pricing vs purchase activity
3. Look for tiles with high availability but low competition
4. Analyze land type preferences and trends

### Trend Analysis

**Purchase Pattern Recognition:**
- Monitor daily purchase trends for cyclical patterns
- Identify peak activity periods
- Correlate activity with tile pricing changes
- Track team expansion strategies over time

**Resource Utilization Tracking:**
- Calculate gold vs carbon spending ratios
- Identify resource allocation patterns
- Monitor spending efficiency across teams
- Track resource constraint impacts

### Predictive Insights

**Market Prediction Indicators:**
- Tiles with increasing purchase activity
- Teams with accelerating expansion patterns
- Land types gaining popularity
- Price pressure indicators

**Team Success Predictors:**
- Early expansion vs late expansion strategies
- Diversification vs concentration approaches
- Resource management efficiency
- Strategic tile selection patterns

## Reporting and Communication

### Creating Activity Reports

**Weekly Activity Summary:**
1. Gather overview metrics
2. Extract top performers and key trends
3. Synthesize market activity highlights
4. Document strategic recommendations

**Team Performance Reports:**
1. Rank teams by key metrics
2. Identify standout strategies
3. Note areas for improvement
4. Provide specific actionable insights

### Data Export Strategies

While the API doesn't provide direct export, you can:
1. Collect data through systematic API calls
2. Format data for presentation
3. Create visualizations from JSON responses
4. Build custom reports using retrieved data

## Best Practices

### Monitoring Guidelines

**Regular Check Points:**
- Daily: Quick overview and recent activity
- Weekly: Comprehensive analytics review
- Monthly: Strategic trend analysis and reporting

**Alert Thresholds:**
- Unusual purchase volume spikes
- Teams falling behind in land acquisition
- Tiles reaching high utilization rates
- Significant market price movements

### Data Interpretation

**Understanding Metrics:**
- Area ownership indicates expansion success
- Purchase count shows activity level
- Revenue reflects strategic value creation
- Timing patterns reveal strategic thinking

**Contextual Analysis:**
- Consider activity phase and duration
- Account for team resource levels
- Factor in strategic objectives
- Understand land type advantages

### Team Guidance

**Strategic Recommendations:**
- Identify optimal expansion opportunities
- Suggest resource allocation improvements
- Highlight successful team strategies
- Point out market inefficiencies

**Performance Coaching:**
- Use data to support feedback
- Identify specific improvement areas
- Recognize successful strategies
- Provide market intelligence

## Troubleshooting Manager Issues

### "User is not a manager"

**Problem**: Your account doesn't have manager permissions.

**Solutions:**
- Verify your role assignment
- Contact system administrator
- Check activity assignment status

### "Not in any activity"

**Problem**: You're not assigned to manage any activity.

**Solutions:**
- Verify activity assignment
- Contact administrator for activity access
- Check that activity is currently active

### Data Inconsistencies

**Problem**: Numbers don't match between different endpoints.

**Solutions:**
- Check timestamp differences (data changes over time)
- Verify filtering parameters
- Consider pagination effects
- Account for real-time updates

## Integration with Other Systems

### Team Account Monitoring

Correlate land purchases with team account changes:
- Monitor resource spending patterns
- Identify teams with resource constraints
- Track spending efficiency

### Activity Management Integration

Connect land data with overall activity metrics:
- Correlate land activity with simulation phases
- Track engagement through land purchases
- Monitor strategic decision-making patterns

This comprehensive manager oversight system provides the tools and insights needed to effectively monitor and guide land-related activities in the business simulation platform.