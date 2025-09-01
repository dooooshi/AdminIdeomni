# Resource Consumption History API

## Overview

The Resource Consumption History API provides endpoints for teams to view their resource consumption and provision history. This allows teams to track water and power usage, costs, and income from infrastructure services.

## API Endpoints

### 1. Get Team Resource Consumption History

**Endpoint:** `GET /api/user/team/resource-consumption/history`

**Description:** Get the resource consumption history for the current team. Shows all water and power consumption transactions.

**Authentication:** Required (User JWT Token)

**Query Parameters:**
- `resourceType` (optional): Filter by resource type (WATER or POWER)
- `purpose` (optional): Filter by consumption purpose (RAW_MATERIAL_PRODUCTION, PRODUCT_MANUFACTURING)
- `startDate` (optional): Start date for the history query (ISO 8601 format)
- `endDate` (optional): End date for the history query (ISO 8601 format)
- `limit` (optional): Number of records to return (default: 100, max: 500)

**Response:**
```json
[
  {
    "id": "cuid123",
    "resourceType": "WATER",
    "quantity": 300,
    "unitPrice": 0.5,
    "totalAmount": 150,
    "purpose": "RAW_MATERIAL_PRODUCTION",
    "status": "SUCCESS",
    "facilityId": "facility123",
    "facilityName": "Iron Mine",
    "providerFacilityId": "facility456",
    "providerFacilityName": "Water Plant",
    "providerTeamId": "team789",
    "providerTeamName": "Blue Team",
    "referenceType": "PRODUCTION",
    "referenceId": "production123",
    "transactionDate": "2024-01-15T10:30:00.000Z",
    "initiatedBy": "user123"
  }
]
```

### 2. Get Team Resource Consumption Summary

**Endpoint:** `GET /api/user/team/resource-consumption/summary`

**Description:** Get a summary of resource consumption for the current team, including total costs and breakdown by resource type.

**Authentication:** Required (User JWT Token)

**Query Parameters:**
- `startDate` (optional): Start date for the summary (ISO 8601 format)
- `endDate` (optional): End date for the summary (ISO 8601 format)

**Response:**
```json
{
  "teamId": "team123",
  "teamName": "Red Team",
  "totalTransactions": 25,
  "totalCost": 3500.50,
  "byResourceType": {
    "WATER": {
      "count": 15,
      "amount": 1500
    },
    "POWER": {
      "count": 10,
      "amount": 2000.50
    }
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z"
  }
}
```

### 3. Get Facility Resource Consumption History

**Endpoint:** `GET /api/user/facility/{facilityId}/resource-consumption/history`

**Description:** Get resource consumption history for a specific facility owned by the team.

**Authentication:** Required (User JWT Token)

**Path Parameters:**
- `facilityId`: The facility ID

**Query Parameters:**
- `resourceType` (optional): Filter by resource type (WATER or POWER)
- `startDate` (optional): Start date for the history query (ISO 8601 format)
- `endDate` (optional): End date for the history query (ISO 8601 format)
- `limit` (optional): Number of records to return (default: 100, max: 500)

**Response:** Same format as team consumption history

### 4. Get Team Resource Provision History

**Endpoint:** `GET /api/user/team/resource-provision/history`

**Description:** Get history of resources provided by the team to others (income from water/power plants).

**Authentication:** Required (User JWT Token)

**Query Parameters:**
- `resourceType` (optional): Filter by resource type (WATER or POWER)
- `startDate` (optional): Start date for the history query (ISO 8601 format)
- `endDate` (optional): End date for the history query (ISO 8601 format)
- `limit` (optional): Number of records to return (default: 100, max: 500)

**Response:** Same format as consumption history, but from provider perspective

## Usage Examples

### Example 1: Get Water Consumption for Last 30 Days

```bash
curl -X GET "http://localhost:2999/api/user/team/resource-consumption/history?resourceType=WATER&startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 2: Get Resource Consumption Summary

```bash
curl -X GET "http://localhost:2999/api/user/team/resource-consumption/summary" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 3: Get Facility-Specific Consumption

```bash
curl -X GET "http://localhost:2999/api/user/facility/facility123/resource-consumption/history?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 4: Get Resource Provision Income History

```bash
curl -X GET "http://localhost:2999/api/user/team/resource-provision/history?resourceType=POWER" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Codes

- `TEAM_NOT_MEMBER`: User is not a member of any team
- `RESOURCE_NOT_FOUND`: Facility not found
- `UNAUTHORIZED`: Invalid or missing JWT token
- `VALIDATION_ERROR`: Invalid query parameters

## Implementation Notes

1. **Data Source**: All data comes from the `ResourceTransaction` table which records all resource consumption history
2. **Includes**: The API automatically includes related facilities and teams for display names
3. **Filtering**: The API supports filtering by resource type, purpose, and date range
4. **Limits**: Maximum 500 records per request to prevent performance issues
5. **Permissions**: Users can only view consumption history for their own team

## Integration with Resource Consumption Service

This API uses the internal `ResourceConsumptionService` which provides:
- `getConsumptionHistory()`: Retrieve historical transactions with filtering
- `getConsumptionSummary()`: Calculate aggregated consumption statistics

The service automatically handles:
- Including related entities (facilities, teams)
- Filtering by various criteria
- Calculating summaries and totals

## Performance Considerations

1. **Indexes**: The ResourceTransaction table has indexes on:
   - `consumerTeamId` + `transactionDate`
   - `providerTeamId` + `transactionDate`
   - `consumerFacilityId` + `resourceType`
   - `purpose` + `transactionDate`

2. **Pagination**: Use the `limit` parameter to control response size

3. **Date Filtering**: Always provide date ranges when possible to reduce data volume

## Future Enhancements

1. **Export Functionality**: Add CSV/Excel export for consumption reports
2. **Aggregation Options**: Add hourly/daily/monthly aggregation options
3. **Cost Analysis**: Add cost trend analysis and predictions
4. **Alerts**: Add consumption threshold alerts
5. **Comparison**: Add team-to-team comparison features