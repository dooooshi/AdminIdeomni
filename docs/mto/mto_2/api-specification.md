# MTO Type 2 API Specification

## Overview

This document provides comprehensive API specifications for MTO Type 2, the MALL-based competitive bidding system. All endpoints follow RESTful conventions and require appropriate authentication.

## Base URL

```
http://localhost:2999/api
```

## Authentication

All endpoints require JWT authentication with role-based access control:
- **Manager endpoints**: Require manager role authentication
- **MALL endpoints**: Require user authentication with MALL ownership
- **Public endpoints**: Require basic user authentication

## API Endpoints

### 1. Manager Management APIs

#### 1.1 Create MTO Type 2

**Endpoint**: `POST /api/user/manager/mto-type2`

**Description**: Create a new MTO Type 2 procurement opportunity.

**Authorization**: Manager role only

**Authentication Context**:
- The `activityId` is automatically determined from the manager's authentication context
- Managers can only create MTO Type 2 for activities they have permission to manage
- System validates manager has appropriate permissions for the activity

**Request Body**:
```typescript
{
  managerProductFormulaId: number;
  releaseTime: string; // ISO 8601 format
  settlementTime: string; // ISO 8601 format
  overallPurchaseBudget: number; // decimal
  metadata?: {
    name?: string;
    description?: string;
    notes?: string;
  };
}
```

**Validation Rules**:
- `releaseTime` must be in the future
- `settlementTime` must be after `releaseTime`
- `overallPurchaseBudget` must be positive
- `managerProductFormulaId` must reference an active formula

**Response** (201 Created):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "MTO Type 2 created successfully",
  data: {
    id: number;
    activityId: string;
    managerProductFormulaId: number;
    releaseTime: string;
    settlementTime: string;
    overallPurchaseBudget: string;
    status: "DRAFT";
    createdAt: string;
    metadata?: object;
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid parameters
- `404 Not Found`: Product formula not found
- `409 Conflict`: Overlapping MTO already exists

#### 1.2 Update MTO Type 2

**Endpoint**: `PUT /api/user/manager/mto-type2/:id`

**Description**: Update an existing MTO Type 2 (only in DRAFT status).

**Authorization**: Manager role only

**Request Body**:
```typescript
{
  releaseTime?: string;
  settlementTime?: string;
  overallPurchaseBudget?: number;
  metadata?: object;
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "MTO Type 2 updated successfully",
  data: {
    // Updated MTO Type 2 object
  }
}
```

#### 1.3 Release MTO Type 2

**Endpoint**: `POST /api/user/manager/mto-type2/:id/release`

**Description**: Release MTO Type 2 for team submissions.

**Authorization**: Manager role only

**Request Body**: Empty

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "MTO Type 2 released successfully",
  data: {
    id: number;
    status: "RELEASED";
    releaseTime: string;
  }
}
```

#### 1.4 Cancel MTO Type 2

**Endpoint**: `POST /api/user/manager/mto-type2/:id/cancel`

**Description**: Cancel an MTO Type 2 before settlement.

**Authorization**: Manager role only

**Request Body**:
```typescript
{
  reason: string;
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "MTO Type 2 cancelled",
  data: {
    id: number;
    status: "CANCELLED";
    cancellationReason: string;
    cancelledAt: string;
  }
}
```

#### 1.5 Trigger Settlement

**Endpoint**: `POST /api/user/manager/mto-type2/:id/settle`

**Description**: Manually trigger settlement (usually automatic).

**Authorization**: Manager role only

**Request Body**: Empty

**Response** (202 Accepted):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Settlement initiated",
  data: {
    settlementId: string;
    status: "SETTLING";
    estimatedDuration: number; // seconds
  }
}
```

#### 1.6 Get MTO Type 2 List

**Endpoint**: `GET /api/user/manager/mto-type2`

**Description**: List all MTO Type 2 with filters.

**Authorization**: Manager role only

**Authentication Context**:
- MTO Type 2 list is filtered to activities the manager has permission to view

**Query Parameters**:
```typescript
{
  status?: "DRAFT" | "RELEASED" | "IN_PROGRESS" | "SETTLING" | "SETTLED" | "CANCELLED";
  fromDate?: string; // ISO 8601
  toDate?: string; // ISO 8601
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
  sortBy?: "createdAt" | "releaseTime" | "settlementTime";
  sortOrder?: "asc" | "desc";
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "MTO Type 2 list retrieved",
  data: {
    items: MtoType2[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
}
```

#### 1.7 Get Settlement Report

**Endpoint**: `GET /api/user/manager/mto-type2/:id/settlement-report`

**Description**: Detailed settlement report for an MTO Type 2.

**Authorization**: Manager role only

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Settlement report retrieved",
  data: {
    summary: {
      totalBudget: string;
      spentBudget: string;
      utilizationRate: number; // percentage
      totalSubmissions: number;
      settledSubmissions: number;
      participatingMalls: number;
      totalQuantityPurchased: number;
    };
    priceAnalytics: {
      averagePrice: string;
      minPrice: string;
      maxPrice: string;
      priceStdDev: string;
      medianPrice: string;
    };
    tileBreakdown: Array<{
      tileId: number;
      tileName: string;
      population: number;
      allocatedBudget: string;
      spentBudget: string;
      mallCount: number;
      purchasedQuantity: number;
    }>;
    topSuppliers: Array<{
      teamId: string;
      teamName: string;
      mallLevel: number; // MALL facility level (1-5)
      quantitySold: number;
      revenue: string;
      averagePrice: string;
    }>;
  }
}
```

### 2. MALL Owner APIs

#### 2.1 Get Available MTO Type 2

**Endpoint**: `GET /api/mall/mto-type-2/available`

**Description**: List available MTO Type 2 for MALL owners.

**Authorization**: User with MALL facility

**Authentication Context**:
- The team's current `activityId` is automatically determined from authentication
- Only MTO Type 2 for the team's enrolled activity are shown
- System validates team has MALL facilities in the activity

**Query Parameters**:
```typescript
{
  mallInstanceId?: string; // specific MALL facility instance (cuid)
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Available MTO Type 2 retrieved",
  data: Array<{
    id: number;
    productFormula: {
      id: number;
      name: string;
      craftCategories: string[];
      rawMaterials: object[];
    };
    releaseTime: string;
    settlementTime: string;
    overallBudget: string;
    status: string;
    canSubmit: boolean;
    submissionDeadline: string;
    mySubmission?: {
      facilityInstanceId: string;
      productNumber: number;
      unitPrice: string;
      submittedAt: string;
    };
  }>
}
```

#### 2.2 Submit Products

**Endpoint**: `POST /api/mall/mto-type-2/:id/submit`

**Description**: Submit products with pricing to MTO Type 2.

**Authorization**: User with MALL facility

**Request Body**:
```typescript
{
  facilityInstanceId: string; // MALL facility instance ID (cuid)
  productNumber: number;
  unitPrice: number; // decimal with 2 decimal places
}
```

**Validation**:
- Facility must be MALL type
- Facility must be owned by requesting team
- Products must be available in facility
- Products must match formula exactly
- Submission window must be open

**Response** (201 Created):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Submission created successfully",
  data: {
    submissionId: number;
    mtoType2Id: number;
    facilityInstanceId: string;
    mallName: string;
    mallLevel: number; // MALL facility level (1-5)
    tileId: number;
    productNumber: number;
    unitPrice: string;
    totalValue: string;
    submittedAt: string;
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `403 Forbidden`: Not a MALL owner
- `404 Not Found`: MTO Type 2 not found
- `409 Conflict`: Team has already submitted to this tile
- `422 Unprocessable Entity`: Product formula mismatch

#### 2.3 Get My Submissions

**Endpoint**: `GET /api/mall/mto-type-2/submissions`

**Description**: List all submissions for the team's MALLs.

**Authorization**: User with MALL facility

**Authentication Context**:
- Submissions are filtered to the team's current activity

**Query Parameters**:
```typescript
{
  status?: "PENDING" | "PARTIAL" | "FULL" | "UNSETTLED" | "RETURNED";
  facilityId?: number;
  page?: number;
  limit?: number;
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Submissions retrieved",
  data: {
    items: Array<{
      submissionId: number;
      mtoType2: {
        id: number;
        formulaName: string;
        settlementTime: string;
        status: string;
      };
      facility: {
        id: number;
        name: string;
        tileName: string;
      };
      productNumber: number;
      unitPrice: string;
      totalValue: string;
      settlementStatus: string;
      settledNumber: number;
      settledValue: string;
      unsettledNumber: number;
      submittedAt: string;
    }>;
    pagination: object;
  }
}
```

#### 2.4 Get Settlement Details

**Endpoint**: `GET /api/mall/mto-type-2/:mtoId/settlement`

**Description**: Get settlement details for team's submissions.

**Authorization**: User with MALL facility

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Settlement details retrieved",
  data: {
    mtoType2Id: number;
    settlementStatus: string;
    mySubmissions: Array<{
      facilityInstanceId: string;
      facilityName: string;
      mallLevel: number; // MALL facility level (1-5)
      submitted: {
        quantity: number;
        unitPrice: string;
        totalValue: string;
      };
      settled: {
        quantity: number;
        revenue: string;
        settlementOrder: number;
      };
      unsettled: {
        quantity: number;
        canReturn: boolean;
        returnDeadline?: string;
      };
    }>;
    totalRevenue: string;
    totalSettledQuantity: number;
    totalUnsettledQuantity: number;
  }
}
```

#### 2.5 Request Product Return

**Endpoint**: `POST /api/mall/mto-type-2/submissions/:submissionId/return`

**Description**: Request return of unsettled products.

**Authorization**: User with MALL facility

**Request Body**:
```typescript
{
  targetFacilityInstanceId: string; // Destination facility instance (cuid)
  confirmTransportFee: boolean;
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Return initiated",
  data: {
    submissionId: number;
    unsettledQuantity: number;
    targetFacility: {
      id: number;
      name: string;
      tileName: string;
    };
    transportationFee: string;
    estimatedDeliveryTime: string;
    returnStatus: "IN_TRANSIT";
  }
}
```

### 3. Public Query APIs

#### 3.1 Get MTO Type 2 Details

**Endpoint**: `GET /api/public/mto-type-2/:id`

**Description**: Get public details of an MTO Type 2.

**Authorization**: Any authenticated user

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "MTO Type 2 details retrieved",
  data: {
    id: number;
    productFormula: {
      name: string;
      description: string;
      craftCategories: string[];
    };
    releaseTime: string;
    settlementTime: string;
    overallBudget: string;
    status: string;
    isActive: boolean;
    statistics?: { // Only for SETTLED status
      participatingMalls: number;
      totalQuantityPurchased: number;
      budgetUtilization: number; // percentage
      averagePrice?: string;
    };
  }
}
```

#### 3.2 Get Market Overview

**Endpoint**: `GET /api/public/mto-type-2/market`

**Description**: Market overview of active MTO Type 2.

**Authorization**: Any authenticated user

**Authentication Context**:
- Market data is filtered to the user's current activity context

**Query Parameters**:
```typescript
{
  includeUpcoming?: boolean; // default: false
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Market overview retrieved",
  data: {
    active: Array<{
      id: number;
      formulaName: string;
      releaseTime: string;
      settlementTime: string;
      totalBudget: string;
      participationRequirement: "MALL_ONLY";
    }>;
    upcoming?: Array<{
      // Similar structure
    }>;
    recentlySettled: Array<{
      id: number;
      formulaName: string;
      settledAt: string;
      budgetUtilization: number;
      averagePrice: string;
    }>;
  }
}
```

### 4. Batch Operations

#### 4.1 Bulk Settlement Status

**Endpoint**: `POST /api/user/manager/mto-type2/bulk-settle`

**Description**: Trigger settlement for multiple MTO Type 2.

**Authorization**: Manager role only

**Request Body**:
```typescript
{
  mtoType2Ids: number[];
  skipValidation?: boolean; // default: false
}
```

**Response** (202 Accepted):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Bulk settlement initiated",
  data: {
    jobId: string;
    totalItems: number;
    estimatedCompletionTime: string;
  }
}
```

### 5. Analytics APIs

#### 5.1 Price Trends

**Endpoint**: `GET /api/analytics/mto-type-2/price-trends`

**Description**: Historical price trends for product formulas.

**Authorization**: Any authenticated user

**Authentication Context**:
- Price trends are filtered to activities the user has access to

**Query Parameters**:
```typescript
{
  formulaId: number;
  period?: "7d" | "30d" | "90d"; // default: "30d"
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Price trends retrieved",
  data: {
    formulaId: number;
    formulaName: string;
    trends: Array<{
      date: string;
      averagePrice: string;
      minPrice: string;
      maxPrice: string;
      volume: number;
    }>;
    summary: {
      currentAverage: string;
      percentChange: number;
      volatility: number;
    };
  }
}
```

## Error Handling

### Standard Error Response

All errors follow this format:

```typescript
{
  success: false,
  businessCode: number,
  message: string,
  error: {
    code: string;
    details?: object;
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  },
  timestamp: string;
  path: string;
}
```

### Business Error Codes

| Code | Description |
|------|-------------|
| 40001 | Invalid request parameters |
| 40301 | Insufficient permissions |
| 40401 | Resource not found |
| 40901 | Resource conflict |
| 42201 | Business rule violation |
| 42301 | Resource locked |
| 50001 | Internal server error |

## Rate Limiting

- Manager endpoints: 100 requests per minute
- MALL endpoints: 60 requests per minute
- Public endpoints: 30 requests per minute

## API Versioning

Current version: v1

Future versions will be available at:
- `/api/v2/mall/mto-type-2/...`
- Header: `API-Version: 2`

## SDK Examples

### TypeScript/JavaScript

```typescript
// Submit to MTO Type 2
const submitToMto = async (mtoId: number, submission: MtoSubmission) => {
  const response = await fetch(`${API_BASE}/mall/mto-type-2/${mtoId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(submission)
  });

  if (!response.ok) {
    throw new Error(`Submission failed: ${response.statusText}`);
  }

  return response.json();
};
```

### Python

```python
import requests

def submit_to_mto(mto_id: int, submission: dict, token: str):
    """Submit products to MTO Type 2"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    response = requests.post(
        f"{API_BASE}/mall/mto-type-2/{mto_id}/submit",
        json=submission,
        headers=headers
    )

    response.raise_for_status()
    return response.json()
```