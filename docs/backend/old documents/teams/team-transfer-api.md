# Team Transfer API Reference

This document provides comprehensive API reference for team resource transfer operations and history tracking.

## 🚀 Quick Start

### Base URL
```
http://localhost:2999/api/user/team
```

### Authentication
All endpoints require JWT authentication:
```http
Authorization: Bearer <your_jwt_token>
```

## 💰 Transfer Operations

### Transfer Gold to Another Team

Transfer gold from your team's account to another team in the same activity.

**Endpoint:** `POST /account/transfer-gold`

**Request Body:**
```json
{
  "targetTeamId": "string",     // Required: Target team UUID
  "amount": 100,                // Required: Amount to transfer (positive integer)
  "description": "string"       // Optional: Reason for transfer
}
```

**Response:** `200 OK`
```json
{
  "id": "account123",
  "teamId": "team123",
  "gold": 900,                  // Updated balance after transfer
  "carbon": 500,
  "createdAt": "2025-07-28T10:00:00.000Z",
  "updatedAt": "2025-07-28T10:05:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid transfer (insufficient balance, same team, etc.)
- `403 Forbidden` - Not an active team member
- `404 Not Found` - Team or account not found

**Example:**
```bash
curl -X POST http://localhost:2999/api/user/team/account/transfer-gold \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetTeamId": "team456",
    "amount": 100,
    "description": "Payment for services"
  }'
```

### Transfer Carbon to Another Team

Transfer carbon from your team's account to another team in the same activity.

**Endpoint:** `POST /account/transfer-carbon`

**Request Body:**
```json
{
  "targetTeamId": "string",     // Required: Target team UUID
  "amount": 50,                 // Required: Amount to transfer (positive integer)
  "description": "string"       // Optional: Reason for transfer
}
```

**Response:** `200 OK`
```json
{
  "id": "account123",
  "teamId": "team123",
  "gold": 1000,
  "carbon": 450,                // Updated balance after transfer
  "createdAt": "2025-07-28T10:00:00.000Z",
  "updatedAt": "2025-07-28T10:05:00.000Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:2999/api/user/team/account/transfer-carbon \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetTeamId": "team456",
    "amount": 50,
    "description": "Carbon credit exchange"
  }'
```

## 📋 History Tracking

### Get Team Operation History

Retrieve paginated history of all team account operations.

**Endpoint:** `GET /account/history/operations`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20, max: 100)
- `operationType` (optional): Filter by operation type
- `resourceType` (optional): Filter by resource type (`GOLD` or `CARBON`)
- `startDate` (optional): Start date for filtering (ISO 8601)
- `endDate` (optional): End date for filtering (ISO 8601)

**Operation Types:**
- `ACCOUNT_CREATED` - Initial account creation
- `TRANSFER_OUT` - Outgoing transfer to another team
- `TRANSFER_IN` - Incoming transfer from another team
- `MANAGER_ADJUSTMENT` - Manual adjustment by manager
- `SYSTEM_GRANT` - System-granted resources
- `SYSTEM_DEDUCTION` - System deductions
- `ACTIVITY_REWARD` - Rewards from activity completion
- `FACILITY_INCOME` - Income from facilities
- `FACILITY_EXPENSE` - Expenses for facilities

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "op123",
      "teamId": "team123",
      "userId": "user456",
      "operationType": "TRANSFER_OUT",
      "amount": 100,
      "resourceType": "GOLD",
      "balanceBefore": 1000,
      "balanceAfter": 900,
      "targetTeamId": "team789",
      "sourceTeamId": null,
      "description": "Payment for services",
      "createdAt": "2025-07-28T10:00:00.000Z",
      "user": {
        "id": "user456",
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "targetTeam": {
        "id": "team789",
        "name": "Alpha Team"
      },
      "sourceTeam": null
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3,
  "hasNext": true,
  "hasPrevious": false
}
```

**Example:**
```bash
curl -X GET "http://localhost:2999/api/user/team/account/history/operations?page=1&pageSize=10&operationType=TRANSFER_OUT&resourceType=GOLD" \
  -H "Authorization: Bearer <token>"
```

### Get Team Transfer History

Retrieve transfer-specific history with directional filtering.

**Endpoint:** `GET /account/history/transfers`

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `direction` (optional): Transfer direction (`incoming`, `outgoing`, `all`)
- `resourceType` (optional): Resource type filter
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:** Same format as operation history, filtered for transfers only.

**Example:**
```bash
curl -X GET "http://localhost:2999/api/user/team/account/history/transfers?direction=outgoing&resourceType=GOLD" \
  -H "Authorization: Bearer <token>"
```

### Get Team Balance History

Retrieve balance snapshots showing account state over time.

**Endpoint:** `GET /account/history/balances`

**Query Parameters:**
- `page` (optional): Page number
- `pageSize` (optional): Items per page
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "bh123",
      "teamId": "team123",
      "goldBalance": 900,
      "carbonBalance": 550,
      "goldChange": -100,
      "carbonChange": 0,
      "operationId": "op123",
      "createdAt": "2025-07-28T10:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 20,
  "totalPages": 2,
  "hasNext": true,
  "hasPrevious": false
}
```

**Example:**
```bash
curl -X GET "http://localhost:2999/api/user/team/account/history/balances?page=1&pageSize=20" \
  -H "Authorization: Bearer <token>"
```

### Get Operation Summary

Retrieve summary statistics for team operations.

**Endpoint:** `GET /account/history/summary`

**Query Parameters:**
- `startDate` (optional): Start date for summary period
- `endDate` (optional): End date for summary period

**Response:** `200 OK`
```json
{
  "totalOperations": 150,
  "totalGoldIn": 5000,
  "totalGoldOut": 3000,
  "totalCarbonIn": 2500,
  "totalCarbonOut": 1500,
  "operationsByType": {
    "TRANSFER_OUT": 45,
    "TRANSFER_IN": 32,
    "MANAGER_ADJUSTMENT": 8,
    "SYSTEM_GRANT": 20,
    "SYSTEM_DEDUCTION": 5,
    "ACTIVITY_REWARD": 15,
    "FACILITY_INCOME": 25,
    "FACILITY_EXPENSE": 0
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:2999/api/user/team/account/history/summary?startDate=2025-07-01&endDate=2025-07-31" \
  -H "Authorization: Bearer <token>"
```

## 🔍 Current Account Information

### Get Current Team Account

Retrieve current team's account information with balances.

**Endpoint:** `GET /account`

**Response:** `200 OK`
```json
{
  "id": "account123",
  "teamId": "team123",
  "gold": 1000,
  "carbon": 500,
  "createdAt": "2025-07-28T08:00:00.000Z",
  "updatedAt": "2025-07-28T10:00:00.000Z",
  "team": {
    "id": "team123",
    "name": "Beta Team",
    "description": "Innovation focused team",
    "leader": {
      "id": "user123",
      "username": "team_leader",
      "email": "leader@example.com",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "members": [
      {
        "id": "member1",
        "status": "ACTIVE",
        "user": {
          "id": "user456",
          "username": "john_doe",
          "email": "john@example.com",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

## 📊 Error Handling

### Common Error Codes

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

**Common causes:**
- Invalid `targetTeamId` (not a valid UUID)
- Negative or zero `amount`
- Missing required fields

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Not an active team member",
  "error": "Forbidden"
}
```

**Common causes:**
- User is not in a team
- User's team membership is inactive
- User is not enrolled in any activity

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Team account not found",
  "error": "Not Found"
}
```

**Common causes:**
- Team doesn't exist
- Team account hasn't been created
- Target team not found

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Insufficient balance",
  "error": "Conflict"
}
```

**Common causes:**
- Not enough gold/carbon for transfer
- Attempting to transfer to same team
- Teams in different activities

## 🎯 Best Practices

### 1. Error Handling
Always check response status codes and handle errors gracefully:

```javascript
try {
  const response = await fetch('/api/user/team/account/transfer-gold', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      targetTeamId: 'team456',
      amount: 100,
      description: 'Payment for services'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Transfer failed:', error.message);
    return;
  }
  
  const result = await response.json();
  console.log('Transfer successful:', result);
} catch (error) {
  console.error('Network error:', error);
}
```

### 2. Pagination
Handle pagination properly for history endpoints:

```javascript
const fetchAllOperations = async (teamId) => {
  let page = 1;
  let allOperations = [];
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`/api/user/team/account/history/operations?page=${page}&pageSize=50`);
    const data = await response.json();
    
    allOperations.push(...data.data);
    hasMore = data.hasNext;
    page++;
  }
  
  return allOperations;
};
```

### 3. Date Filtering
Use ISO 8601 format for date parameters:

```javascript
const startDate = new Date('2025-07-01').toISOString();
const endDate = new Date('2025-07-31').toISOString();

const url = `/api/user/team/account/history/operations?startDate=${startDate}&endDate=${endDate}`;
```

### 4. Input Validation
Validate inputs before sending requests:

```javascript
const validateTransfer = (targetTeamId, amount) => {
  if (!targetTeamId || typeof targetTeamId !== 'string') {
    throw new Error('Valid target team ID is required');
  }
  
  if (!amount || amount <= 0 || !Number.isInteger(amount)) {
    throw new Error('Amount must be a positive integer');
  }
};
```

## 🔗 Related Documentation

- [Team System Overview](team-system-overview.md)
- [Team Accounts System](team-accounts-system.md)
- [Team Security Guide](team-security-guide.md)
- [API Authentication](../auth-related/admin-auth-flow.md)

---

*This API reference provides complete documentation for team transfer operations and history tracking functionality.*