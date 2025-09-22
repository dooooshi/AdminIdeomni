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
- **Student/Team endpoints**: Require student role authentication
- **Public endpoints**: Require basic user authentication

## API Endpoints

The API endpoints are organized into the following sections:

1. **Manager Management APIs** - For managers to create, configure, and monitor MTO Type 2
2. **MALL Owner APIs** - For teams with MALL facilities to submit products and manage returns
3. **Student/Team APIs** - For students to view requirement details and budget allocations
4. **Public Query APIs** - For general market information accessible to all users
5. **Batch Operations** - For bulk processing and administrative tasks
6. **Analytics APIs** - For market analysis and price trend data

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

#### 1.8 Get Calculation History

**Endpoint**: `GET /api/user/manager/mto-type2/:id/calculation-history`

**Description**: Retrieve calculation history and audit trail for an MTO Type 2, including budget distribution calculations and settlement process details. This provides complete transparency into all calculations performed during the MTO lifecycle.

**Authorization**: Manager role only

**Query Parameters**:
```typescript
{
  calculationType?: "BUDGET_DISTRIBUTION" | "SETTLEMENT_PROCESS" | "ADJUSTMENT" | "CANCELLATION";
  limit?: number; // default: 50, max: 100
  offset?: number; // for pagination
  sortOrder?: "asc" | "desc"; // default: "desc" (newest first)
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Calculation history retrieved",
  data: {
    mtoType2Id: number;
    histories: Array<{
      id: number;
      calculationType: "BUDGET_DISTRIBUTION" | "SETTLEMENT_PROCESS" | "ADJUSTMENT" | "CANCELLATION";
      createdAt: string;
      createdBy: string | null;

      // Fields populated for BUDGET_DISTRIBUTION type
      totalPopulation: number | null;
      participatingTiles: number | null;
      totalMalls: number | null;
      overallBudget: string | null; // Decimal as string

      // Fields populated for SETTLEMENT_PROCESS type
      totalSubmissions: number | null;
      processedSubmissions: number | null;
      totalSettled: number | null;
      totalSpent: string | null; // Decimal as string
      settlementDuration: number | null; // milliseconds

      // Detailed calculation data (JSON field contents)
      calculationDetails: {
        // For BUDGET_DISTRIBUTION: tile-by-tile breakdown
        tiles?: Array<{
          mapTileId: number;
          tileName: string;
          population: number;
          mallCount: number;
          populationRatio: number;
          allocatedBudget: string;
        }>;

        // For SETTLEMENT_PROCESS: per-tile settlement results
        settlementResults?: Array<{
          tileId: number;
          submissions: number;
          settled: number;
          spent: string;
          failed: number;
        }>;

        // For ADJUSTMENT: adjustment details
        adjustmentReason?: string;
        originalValues?: object;
        newValues?: object;

        // For CANCELLATION: cancellation impact
        cancellationReason?: string;
        affectedSubmissions?: number;
        refundedAmount?: string;

        // Additional flexible data based on calculation type
        [key: string]: any;
      };
    }>;
    total: number;
  }
}
```

**Data Model Alignment**:
This endpoint directly maps to the `MtoType2CalculationHistory` Prisma model:
- Core fields (`id`, `calculationType`, `createdAt`, `createdBy`) are directly mapped
- Type-specific nullable fields are populated based on the calculation type
- `calculationDetails` JSON field provides flexible storage for detailed breakdowns
- Decimal fields are converted to strings for JSON compatibility

**Example Request**:
```bash
GET /api/user/manager/mto-type2/123/calculation-history?calculationType=BUDGET_DISTRIBUTION&limit=10
```

**Example Response**:
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Calculation history retrieved",
  "data": {
    "mtoType2Id": 123,
    "histories": [
      {
        "id": 456,
        "calculationType": "BUDGET_DISTRIBUTION",
        "createdAt": "2024-01-15T10:30:00Z",
        "createdBy": "SYSTEM",
        "totalPopulation": 50000,
        "participatingTiles": 10,
        "totalMalls": 15,
        "overallBudget": "100000.00",
        "totalSubmissions": null,
        "processedSubmissions": null,
        "totalSettled": null,
        "totalSpent": null,
        "settlementDuration": null,
        "calculationDetails": {
          "tiles": [
            {
              "mapTileId": 1,
              "tileName": "Downtown",
              "population": 10000,
              "mallCount": 3,
              "populationRatio": 0.20,
              "allocatedBudget": "20000.00"
            }
          ],
          "method": "POPULATION_BASED_ALLOCATION",
          "timestamp": "2024-01-15T10:30:00Z"
        }
      }
    ],
    "total": 1
  }
}
```

**Error Responses**:
- `404 Not Found`: MTO Type 2 not found
- `403 Forbidden`: Manager does not have access to this MTO Type 2

#### 1.9 Get All Calculation Histories

**Endpoint**: `GET /api/user/manager/mto-type2/calculation-histories`

**Description**: Retrieve calculation histories across all MTO Type 2 requirements for the manager's activities. This provides a summary view for cross-MTO analysis and reporting.

**Authorization**: Manager role only

**Query Parameters**:
```typescript
{
  activityId?: string; // Filter by specific activity
  calculationType?: "BUDGET_DISTRIBUTION" | "SETTLEMENT_PROCESS" | "ADJUSTMENT" | "CANCELLATION";
  fromDate?: string; // ISO 8601
  toDate?: string; // ISO 8601
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Calculation histories retrieved",
  data: {
    items: Array<{
      id: number;
      mtoType2Id: number;
      calculationType: "BUDGET_DISTRIBUTION" | "SETTLEMENT_PROCESS" | "ADJUSTMENT" | "CANCELLATION";
      createdAt: string;
      createdBy: string | null;

      // Summary fields based on calculation type
      // For BUDGET_DISTRIBUTION
      totalPopulation?: number;
      participatingTiles?: number;
      overallBudget?: string;

      // For SETTLEMENT_PROCESS
      totalSubmissions?: number;
      totalSettled?: number;
      totalSpent?: string;
      settlementDuration?: number;

      // Quick summary extracted from calculationDetails
      summary: string; // Brief text summary of the calculation
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
}
```

**Summary Generation**:
The `summary` field provides a human-readable description based on calculation type:
- BUDGET_DISTRIBUTION: "Allocated budget to {n} tiles with {m} MALLs"
- SETTLEMENT_PROCESS: "Settled {x}/{y} submissions, spent {amount}"
- ADJUSTMENT: Shows the adjustment reason from calculationDetails
- CANCELLATION: Shows the cancellation reason from calculationDetails

**Example Request**:
```bash
GET /api/user/manager/mto-type2/calculation-histories?calculationType=SETTLEMENT_PROCESS&page=1&limit=20
```

**Example Response**:
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Calculation histories retrieved",
  "data": {
    "items": [
      {
        "id": 789,
        "mtoType2Id": 123,
        "calculationType": "SETTLEMENT_PROCESS",
        "createdAt": "2024-01-15T14:00:00Z",
        "createdBy": "SYSTEM",
        "totalSubmissions": 45,
        "totalSettled": 38,
        "totalSpent": "87500.00",
        "settlementDuration": 3500,
        "summary": "Settled 38/45 submissions, spent 87500.00"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
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

**Request Body**: Empty (no parameters needed - returns to original MALL automatically)

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Return initiated",
  data: {
    submissionId: number;
    unsettledQuantity: number;
    originalMall: {
      id: string;
      name: string;
      tileName: string;
    };
    returnStatus: "COMPLETED";
  }
}
```

### 3. Student/Team APIs

#### 3.1 Get MTO Type 2 Requirement Details

**Endpoint**: `GET /api/team/mto-type-2/:id/requirement`

**Description**: Get detailed MTO Type 2 requirement information for students/teams, including product formula specifications and per-tile budget allocations.

**Authorization**: User with student role

**Authentication Context**:
- The team's current `activityId` is automatically determined from authentication
- Only MTO Type 2 for the team's enrolled activity are accessible
- Available only when status is RELEASED, IN_PROGRESS, SETTLING, or SETTLED

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "MTO Type 2 requirement details retrieved",
  data: {
    id: number;
    status: "RELEASED" | "IN_PROGRESS" | "SETTLING" | "SETTLED";
    releaseTime: string;
    settlementTime: string;
    overallPurchaseBudget: string;

  productFormula: {
      id: number;
      name: string;
      description?: string;
      craftCategories: Array<{
        id: number;
        name: string;
        description?: string;
      }>;
      rawMaterials: Array<{
        id: number;
        name: string;
        quantity: number;
        unit: string;
      }>;
      productionProcess?: {
        steps?: string[];
        duration?: number; // minutes
        complexity?: "LOW" | "MEDIUM" | "HIGH";
      };
    };

    // Per-Tile Budget Allocations
    tileBudgetAllocations: Array<{
      tileId: number;
      tileName: string;
      axialQ: number;
      axialR: number;

      // Population and allocation details
      tilePopulation: number;
      populationRatio: number; // percentage of total population
      allocatedBudget: string; // calculated budget for this tile

      // MALL information for this tile
      mallsInTile: Array<{
        mallId: string;
        mallName: string;
        mallLevel: number; // 1-5
        teamId: string;
        teamName: string;
      }>;

      // Settlement progress (only visible during/after settlement)
      settlementProgress?: {
        spentBudget: string;
        remainingBudget: string;
        purchasedQuantity: number;
        participatingTeams: number;
      };
    }>;

  }
}
```

**Error Responses**:
- `404 Not Found`: MTO Type 2 not found
- `403 Forbidden`: MTO Type 2 not yet released or not accessible

**Notes**:
- Budget allocations are calculated in real-time based on current population data
- During RELEASED status, shows potential budget allocations
- During SETTLING/SETTLED status, shows actual budget allocations used
- Teams can only see detailed MALL information for public visibility
- Formula details include all specifications needed to produce matching products

**Example Response**:
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "MTO Type 2 requirement details retrieved",
  "data": {
    "id": 1,
    "status": "IN_PROGRESS",
    "releaseTime": "2025-01-15T10:00:00Z",
    "settlementTime": "2025-01-16T10:00:00Z",
    "overallPurchaseBudget": "100000.00",
    "productFormula": {
      "id": 15,
      "name": "Wooden Chair",
      "description": "Standard wooden office chair",
      "craftCategories": [
        {
          "id": 1,
          "name": "Woodworking",
          "description": "Wood crafting and carpentry"
        }
      ],
      "rawMaterials": [
        {
          "id": 10,
          "name": "Wood Planks",
          "quantity": 5,
          "unit": "pieces"
        },
        {
          "id": 11,
          "name": "Metal Screws",
          "quantity": 20,
          "unit": "pieces"
        }
      ],
      "productionProcess": {
        "steps": ["Cut wood", "Sand surfaces", "Assemble", "Finish"],
        "duration": 120,
        "complexity": "MEDIUM"
      }
    },
    "tileBudgetAllocations": [
      {
        "tileId": 101,
        "tileName": "Downtown District",
        "axialQ": 0,
        "axialR": 0,
        "tilePopulation": 15000,
        "populationRatio": 0.30,
        "allocatedBudget": "30000.00",
        "mallsInTile": [
          {
            "mallId": "cm1234abc",
            "mallName": "Central Mall",
            "mallLevel": 3,
            "teamId": "tm5678def",
            "teamName": "Alpha Trading Co"
          },
          {
            "mallId": "cm4567ghi",
            "mallName": "Plaza Mall",
            "mallLevel": 2,
            "teamId": "tm8901jkl",
            "teamName": "Beta Commerce"
          }
        ]
      },
      {
        "tileId": 102,
        "tileName": "Industrial Zone",
        "axialQ": 1,
        "axialR": -1,
        "tilePopulation": 10000,
        "populationRatio": 0.20,
        "allocatedBudget": "20000.00",
        "mallsInTile": [
          {
            "mallId": "cm7890mno",
            "mallName": "Factory Outlet",
            "mallLevel": 1,
            "teamId": "tm2345pqr",
            "teamName": "Gamma Industries"
          }
        ]
      }
    ]
  }
}
```

#### 3.2 List Available MTO Type 2 Requirements

**Endpoint**: `GET /api/team/mto-type-2/requirements`

**Description**: List all available MTO Type 2 requirements for students/teams in their activity.

**Authorization**: User with student role

**Authentication Context**:
- The team's current `activityId` is automatically determined from authentication
- Only MTO Type 2 for the team's enrolled activity are shown
- Shows requirements in RELEASED, IN_PROGRESS, SETTLING, or SETTLED status

**Query Parameters**:
```typescript
{
  status?: "RELEASED" | "IN_PROGRESS" | "SETTLING" | "SETTLED";
  includeSettled?: boolean; // default: false
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
  sortBy?: "releaseTime" | "settlementTime" | "budget";
  sortOrder?: "asc" | "desc";
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "MTO Type 2 requirements retrieved",
  data: {
    items: Array<{
      id: number;
      status: string;
      releaseTime: string;
      settlementTime: string;
      overallPurchaseBudget: string;

      // Basic formula info
      productFormula: {
        id: number;
        name: string;
        craftCategories: string[];
      };

      // Market summary
      marketSummary: {
        totalMalls: number;
        totalTilesWithMalls: number;
        averageBudgetPerTile: string;
        currentSubmissions?: number; // Only for IN_PROGRESS/SETTLING
      };

      // Team participation status
      teamStatus: {
        canParticipate: boolean;
        hasMALL: boolean;
        mallCount?: number;
        submissionCount?: number; // Number of submissions team has made
      };

      // Time indicators
      timeInfo: {
        isOpen: boolean; // Can submit now
        hoursUntilRelease?: number; // If not yet released
        hoursUntilSettlement?: number; // If open
        timeSinceSettlement?: number; // If settled
      };
    }>;

    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
}
```

**Example Request**:
```bash
GET /api/team/mto-type-2/requirements?status=IN_PROGRESS&page=1&limit=10
```

**Example Response**:
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "MTO Type 2 requirements retrieved",
  "data": {
    "items": [
      {
        "id": 1,
        "status": "IN_PROGRESS",
        "releaseTime": "2025-01-15T10:00:00Z",
        "settlementTime": "2025-01-16T10:00:00Z",
        "overallPurchaseBudget": "100000.00",
        "productFormula": {
          "id": 15,
          "name": "Wooden Chair",
          "craftCategories": ["Woodworking", "Assembly"]
        },
        "marketSummary": {
          "totalMalls": 8,
          "totalTilesWithMalls": 5,
          "averageBudgetPerTile": "20000.00",
          "currentSubmissions": 12
        },
        "teamStatus": {
          "canParticipate": true,
          "hasMALL": true,
          "mallCount": 1,
          "submissionCount": 0
        },
        "timeInfo": {
          "isOpen": true,
          "hoursUntilSettlement": 18.5
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

#### 3.3 Get Submission Eligibility and Inventory

**Endpoint**: `GET /api/team/mto-type-2/:id/submission-eligibility`

**Description**: Retrieve eligible MALL facilities and their available inventory for MTO Type 2 submission. Only returns MALLs that meet all requirements (infrastructure, budget allocation, no prior submission).

**Authorization**: User with student role

**Authentication Context**:
- The team's current `activityId` is automatically determined from authentication
- Only shows data for the authenticated user's team
- MTO Type 2 must be in RELEASED or IN_PROGRESS status

**Path Parameters**:
- `id` (number) - The MTO Type 2 requirement ID

**Response** (200 OK):
```typescript
{
  success: true,
  businessCode: 20000,
  message: "Submission eligibility retrieved",
  data: {
    mtoType2: {
      id: number;
      status: "RELEASED" | "IN_PROGRESS";
      releaseTime: string;
      settlementTime: string;
      isOpenForSubmission: boolean; // Can submit now
    };

    // Team information
    teamInfo: {
      teamId: string;
      teamName: string;
      totalMALLs: number;
      eligibleMALLs: number;
    };

    // Only eligible MALL facilities (all requirements met)
    eligibleFacilities: Array<{
      facilityId: string;
      facilityName: string;
      mallLevel: number; // 1-5

      // Tile information
      tile: {
        tileId: number;
        tileName: string;
        axialQ: number;
        axialR: number;
        population: number;

        // Budget allocation for this tile
        budgetAllocation: {
          allocatedBudget: string;
          remainingBudget?: string; // If in SETTLING/SETTLED status
          populationRatio: number;
        };
      };

      // Existing submission status
      submissionStatus: {
        hasSubmitted: boolean;
        submittedAt?: string;
        submittedQuantity?: number;
        submittedPrice?: string;
      };

      // Available inventory in this MALL
      inventory: {
        totalSpaceCapacity: number;
        usedSpace: number;
        availableSpace: number;

        // All products in inventory
        products: Array<{
          inventoryItemId: string;
          productFormulaId: number;
          productName: string;
          quantity: number;
          unitSpaceRequired: number;
          totalSpaceUsed: number;

          // Product details
          productDetails: {
            materials: Array<{
              id: number;
              name: string;
              quantity: number;
            }>;
            craftCategories: string[];
            productionDate?: string;
            qualityLevel?: string;
          };
        }>;

        // Raw materials available
        rawMaterials?: Array<{
          inventoryItemId: string;
          materialId: number;
          name: string;
          quantity: number;
          unit: string;
        }>;
      };
    }>;
  }
}
```

**Error Responses**:
- `404 Not Found`: MTO Type 2 not found
- `403 Forbidden`: MTO Type 2 not yet released or team not enrolled in activity
- `400 Bad Request`: Invalid parameters

**Business Logic**:
1. **Eligibility Criteria**:
   - MALL must be in a tile with allocated budget for this MTO Type 2
   - Tile must meet all infrastructure requirements (power, water, transport)
   - MALL must not have already submitted to this MTO Type 2
   - Submission window must be open (after release, before settlement)

2. **Product Matching**:
   - Products must have the exact same materials and quantities
   - Products must have the required craft categories
   - Quality level may affect settlement priority but not eligibility

3. **Infrastructure Check**:
   - Power infrastructure required for MALL operations
   - Water infrastructure required for certain production
   - Transport infrastructure required for product delivery

**Example Request**:
```bash
GET /api/team/mto-type-2/123/submission-eligibility?onlyWithMatchingProducts=true
```

**Example Response**:
```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Submission eligibility retrieved",
  "data": {
    "mtoType2": {
      "id": 123,
      "status": "IN_PROGRESS",
      "releaseTime": "2025-01-15T10:00:00Z",
      "settlementTime": "2025-01-16T10:00:00Z",
      "isOpenForSubmission": true,
      "productFormula": {
        "id": 15,
        "name": "Wooden Chair",
        "description": "Standard office chair",
        "requiredMaterials": [
          {
            "id": 10,
            "name": "Wood Planks",
            "quantity": 5,
            "unit": "pieces"
          },
          {
            "id": 11,
            "name": "Metal Screws",
            "quantity": 20,
            "unit": "pieces"
          }
        ],
        "requiredCraftCategories": [
          {
            "id": 1,
            "name": "Woodworking"
          }
        ]
      }
    },
    "teamInfo": {
      "teamId": "tm5678def",
      "teamName": "Alpha Trading Co",
      "totalMALLs": 3,
      "eligibleMALLs": 2
    },
    "eligibleFacilities": [
      {
        "facilityId": "cm1234abc",
        "facilityName": "Central Mall",
        "mallLevel": 3,
        "tile": {
          "tileId": 101,
          "tileName": "Downtown District",
          "axialQ": 0,
          "axialR": 0,
          "population": 15000,
          "budgetAllocation": {
            "allocatedBudget": "30000.00",
            "populationRatio": 0.30
          },
          "infrastructure": {
            "hasPower": true,
            "hasWater": true,
            "hasTransport": true,
            "allRequirementsMet": true
          }
        },
        "submissionStatus": {
          "hasSubmitted": false
        },
        "inventory": {
          "totalSpaceCapacity": 1000,
          "usedSpace": 450,
          "availableSpace": 550,
          "matchingProducts": [
            {
              "inventoryItemId": "inv789xyz",
              "productFormulaId": 25,
              "productName": "Premium Wooden Chair",
              "quantity": 150,
              "unitSpaceRequired": 2,
              "totalSpaceUsed": 300,
              "formulaMatch": {
                "materialsMatch": true,
                "categoriesMatch": true,
                "isFullyCompatible": true
              },
              "productDetails": {
                "materials": [
                  {
                    "id": 10,
                    "name": "Wood Planks",
                    "quantity": 5
                  },
                  {
                    "id": 11,
                    "name": "Metal Screws",
                    "quantity": 20
                  }
                ],
                "craftCategories": ["Woodworking"],
                "productionDate": "2025-01-14T08:00:00Z",
                "qualityLevel": "HIGH"
              }
            }
          ],
          "otherProducts": [
            {
              "inventoryItemId": "inv456def",
              "itemType": "PRODUCT",
              "name": "Wooden Table",
              "quantity": 50,
              "spaceUsed": 150
            }
          ]
        },
        "eligibility": {
          "canSubmit": true,
          "reasons": ["All requirements met", "Has matching products in inventory"],
          "checklist": {
            "hasBudgetAllocation": true,
            "infrastructureRequirementsMet": true,
            "hasMatchingProducts": true,
            "hasNotSubmittedYet": true,
            "withinSubmissionWindow": true
          }
        }
      },
      {
        "facilityId": "cm4567ghi",
        "facilityName": "North Mall",
        "mallLevel": 2,
        "tile": {
          "tileId": 105,
          "tileName": "Northern District",
          "axialQ": 0,
          "axialR": -1,
          "population": 8000,
          "budgetAllocation": {
            "allocatedBudget": "16000.00",
            "populationRatio": 0.16
          },
          "infrastructure": {
            "hasPower": true,
            "hasWater": true,
            "hasTransport": false,
            "allRequirementsMet": false
          }
        },
        "submissionStatus": {
          "hasSubmitted": false
        },
        "inventory": {
          "totalSpaceCapacity": 800,
          "usedSpace": 200,
          "availableSpace": 600,
          "matchingProducts": []
        },
        "eligibility": {
          "canSubmit": false,
          "reasons": [
            "Transport infrastructure not available",
            "No matching products in inventory"
          ],
          "checklist": {
            "hasBudgetAllocation": true,
            "infrastructureRequirementsMet": false,
            "hasMatchingProducts": false,
            "hasNotSubmittedYet": true,
            "withinSubmissionWindow": true
          }
        }
      }
    ],
    "summary": {
      "totalEligibleFacilities": 1,
      "totalMatchingProducts": 150,
      "totalAvailableQuantity": 150,
      "estimatedMaxValue": "22500.00",
      "recommendations": [
        {
          "priority": "HIGH",
          "action": "Submit from Central Mall",
          "facilityId": "cm1234abc",
          "reason": "Has 150 matching products ready for submission"
        },
        {
          "priority": "MEDIUM",
          "action": "Fix transport infrastructure for North Mall",
          "facilityId": "cm4567ghi",
          "reason": "Would enable participation but lacks matching products"
        }
      ]
    }
  }
}
```

**Usage Notes**:
1. This endpoint should be called before attempting submission to verify eligibility
2. The `matchingProducts` array only includes products that exactly match the formula
3. Infrastructure requirements are checked in real-time based on current tile state
4. Budget allocations are calculated dynamically based on population distribution
5. The endpoint considers all business rules including submission windows and prior submissions

**Implementation Considerations**:
- Cache budget allocations for performance (invalidate on population changes)
- Index facility inventories by product formula for faster matching
- Consider pagination for facilities with large inventories
- Infrastructure status should reflect real-time tile state

### 4. Public Query APIs

#### 4.1 Get MTO Type 2 Details

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

#### 4.2 Get Market Overview

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

### 5. Batch Operations

#### 5.1 Bulk Settlement Status

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

### 6. Analytics APIs

#### 6.1 Price Trends

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