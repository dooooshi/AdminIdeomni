# Team API Documentation

This document provides comprehensive API documentation for the Team System endpoints, including request/response formats, authentication requirements, and example usage.

## Table of Contents

- [Authentication](#authentication)
- [Base URLs](#base-urls)
- [User Team Operations](#user-team-operations)
- [Manager Team Operations](#manager-team-operations)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

## Authentication

All Team API endpoints require JWT authentication. Include the bearer token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### User Types
- **User** (userType: 2, 3): Regular users and students
- **Manager** (userType: 1): Activity managers with elevated permissions

## Base URLs

- **Development**: `http://localhost:2999/api`
- **Production**: `https://your-domain.com/api`

## User Team Operations

### Create Team

Create a new team in the user's current activity. The creator automatically becomes the team leader.

```http
POST /api/user/team
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "name": "Alpha Squad",
  "description": "Strategic business simulation team",
  "maxMembers": 6,
  "isOpen": true
}
```

**Request Body:**
- `name` (string, required): Team name (1-50 characters)
- `description` (string, optional): Team description (max 200 characters)
- `maxMembers` (number, optional): Maximum team size (2-20, default: 4)
- `isOpen` (boolean, optional): Whether team accepts new members (default: true)

**Response (201):**
```json
{
  "id": "cm06aqttg0000zm43xshbpmgr",
  "name": "Alpha Squad",
  "description": "Strategic business simulation team",
  "maxMembers": 6,
  "isOpen": true,
  "createdAt": "2025-07-25T10:00:00.000Z",
  "leader": {
    "id": "cm06aqttg0000zm43xshbpmgr",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "members": [...]
}
```

**Errors:**
- `400`: User already has a team, invalid input, or business rule violation
- `401`: Authentication required
- `404`: User has no current activity enrollment

---

### Get Current Team

Retrieve details of the team the user is currently in.

```http
GET /api/user/team
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": "team123",
  "name": "Alpha Squad",
  "description": "Strategic business simulation team",
  "maxMembers": 6,
  "isOpen": true,
  "createdAt": "2025-07-25T10:00:00.000Z",
  "leader": {
    "id": "user123",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "members": [
    {
      "id": "member123",
      "userId": "user123",
      "status": "ACTIVE",
      "joinedAt": "2025-07-25T10:00:00.000Z",
      "user": {
        "id": "user123",
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "userType": 2
      }
    }
  ]
}
```

**Errors:**
- `404`: User is not in any team

---

### Update Team

Update team settings. Only the team leader can perform this action.

```http
PUT /api/user/team
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "name": "Beta Squad",
  "description": "Updated team description",
  "maxMembers": 8,
  "isOpen": false
}
```

**Request Body:** (all fields optional)
- `name` (string): New team name
- `description` (string): New team description
- `maxMembers` (number): New maximum team size
- `isOpen` (boolean): Whether team accepts new members

**Response (200):** Updated team object

**Errors:**
- `403`: Only team leader can update team settings
- `404`: User is not in any team

---

### Leave Team

Leave the current team. Team leaders must transfer leadership first.

```http
DELETE /api/user/team/leave
Authorization: Bearer <jwt_token>
```

**Response (204):** No content

**Errors:**
- `403`: Team leader must transfer leadership before leaving
- `404`: User is not in any team

---

### Disband Team

Disband the current team. Only the team leader can perform this action.

```http
DELETE /api/user/team
Authorization: Bearer <jwt_token>
```

**Response (204):** No content

**Errors:**
- `403`: Only team leader can disband the team
- `404`: User is not in any team

---

### Get Available Teams

Get a paginated list of teams available to join in the user's current activity.

```http
GET /api/user/teams/available?page=1&pageSize=20&search=alpha
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `pageSize` (number, optional): Items per page (1-100, default: 20)
- `search` (string, optional): Search term for team name or description

**Response (200):**
```json
{
  "data": [
    {
      "id": "team123",
      "name": "Alpha Squad",
      "description": "Strategic business simulation team",
      "maxMembers": 6,
      "currentMembers": 4,
      "isOpen": true,
      "createdAt": "2025-07-25T10:00:00.000Z",
      "leader": {
        "id": "user123",
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

---

### Join Team

Join an available team. User must not be in another team.

```http
POST /api/user/teams/{teamId}/join
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `teamId` (string): ID of the team to join

**Response (201):** No content

**Errors:**
- `400`: Team is full, closed, or user already in a team
- `404`: Team not found

---

### Get Team Details

Get detailed information about a specific team.

```http
GET /api/user/teams/{teamId}
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `teamId` (string): Team ID

**Response (200):** Full team object with members

**Errors:**
- `404`: Team not found

---

### Get Team Members

Get list of all members in the user's current team.

```http
GET /api/user/team/members
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
[
  {
    "id": "member123",
    "status": "ACTIVE",
    "joinedAt": "2025-07-25T10:00:00.000Z",
    "user": {
      "id": "user123",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": 2
    }
  }
]
```

**Errors:**
- `404`: User is not in any team

---

### Invite Members

Invite users to join the team. Only team leader can perform this action.

```http
POST /api/user/team/invite
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "userIds": ["user1", "user2", "user3"]
}
```

**Request Body:**
- `userIds` (string[]): Array of user IDs to invite

**Response (201):**
```json
{
  "successCount": 2,
  "failedCount": 1,
  "totalCount": 3,
  "details": [
    {
      "userId": "user1",
      "success": true
    },
    {
      "userId": "user2",
      "success": true
    },
    {
      "userId": "user3",
      "success": false,
      "error": "User already in a team"
    }
  ]
}
```

**Errors:**
- `403`: Only team leader can invite members

---

### Remove Member

Remove a member from the team. Only team leader can perform this action.

```http
DELETE /api/user/team/members/{userId}
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `userId` (string): ID of the user to remove

**Response (204):** No content

**Errors:**
- `403`: Only team leader can remove members
- `404`: User not found in team

---

### Transfer Leadership

Transfer team leadership to another team member. Only current leader can perform this action.

```http
PUT /api/user/team/transfer-leadership
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "newLeaderId": "user123"
}
```

**Request Body:**
- `newLeaderId` (string): User ID of the new team leader

**Response (200):** No content

**Errors:**
- `403`: Only team leader can transfer leadership
- `400`: New leader must be a team member

## Manager Team Operations

Manager operations require Manager user type (userType: 1) and provide elevated permissions for activity management.

### Get All Teams

Get a paginated list of all teams in the manager's current activity.

```http
GET /api/user/manage/teams?page=1&pageSize=20&search=alpha
Authorization: Bearer <manager_jwt_token>
```

**Query Parameters:** Same as user available teams endpoint

**Response (200):** Paginated list of all teams in activity

**Errors:**
- `403`: Only managers can access this feature

---

### Get Team Details (Manager)

Get detailed information about any team in the activity.

```http
GET /api/user/manage/teams/{teamId}
Authorization: Bearer <manager_jwt_token>
```

**Response (200):** Full team object

**Errors:**
- `403`: Only managers can access this feature

---

### Force Disband Team

Force disband any team in the activity.

```http
DELETE /api/user/manage/teams/{teamId}
Authorization: Bearer <manager_jwt_token>
```

**Response (204):** No content

**Errors:**
- `403`: Only managers can access this feature

---

### Force Remove Member

Force remove a member from any team in the activity.

```http
DELETE /api/user/manage/teams/{teamId}/members/{userId}
Authorization: Bearer <manager_jwt_token>
```

**Path Parameters:**
- `teamId` (string): Team ID
- `userId` (string): User ID to remove

**Response (204):** No content

**Errors:**
- `403`: Only managers can access this feature

---

### Force Transfer Leadership

Force transfer leadership of any team in the activity.

```http
PUT /api/user/manage/teams/{teamId}/leader
Content-Type: application/json
Authorization: Bearer <manager_jwt_token>

{
  "newLeaderId": "user123"
}
```

**Path Parameters:**
- `teamId` (string): Team ID

**Request Body:**
- `newLeaderId` (string): User ID of the new team leader

**Response (200):** No content

**Errors:**
- `403`: Only managers can access this feature

---

### Get Team Statistics

Get team statistics for the manager's current activity.

```http
GET /api/user/manage/teams/statistics
Authorization: Bearer <manager_jwt_token>
```

**Response (200):**
```json
{
  "totalTeams": 15,
  "totalMembers": 78,
  "averageTeamSize": 5.2,
  "teamsWithOpenSlots": 8
}
```

**Errors:**
- `403`: Only managers can access this feature

## Data Models

### Team Object
```typescript
{
  id: string;
  name: string;
  description: string | null;
  maxMembers: number;
  isOpen: boolean;
  createdAt: Date;
  leader: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  members: TeamMember[];
}
```

### TeamMember Object
```typescript
{
  id: string;
  status: 'ACTIVE' | 'LEFT' | 'REMOVED';
  joinedAt: Date;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    userType: number;
  };
}
```

### TeamListItem Object (for paginated results)
```typescript
{
  id: string;
  name: string;
  description: string | null;
  maxMembers: number;
  currentMembers: number;
  isOpen: boolean;
  createdAt: Date;
  leader: {
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "businessCode": 4001,
  "message": "Resource not found",
  "data": null,
  "timestamp": "2025-07-25T15:57:53.302Z",
  "path": "/api/user/team",
  "details": {
    "message": "Team not found",
    "error": "Not Found",
    "statusCode": 404
  }
}
```

### Common Error Codes
- `1000`: System error
- `2000-2999`: Authentication/Authorization errors
- `3000-3999`: Validation errors
- `4000-4999`: Business logic errors

### Team-Specific Error Messages
- `TEAM_NO_ACTIVITY`: User has no current activity enrolled
- `TEAM_ALREADY_EXISTS`: User already has a team in this activity
- `TEAM_NOT_FOUND`: Referenced team does not exist
- `TEAM_FULL`: Team has reached maximum member capacity
- `TEAM_ALREADY_MEMBER`: User is already a member of this team
- `TEAM_NOT_LEADER`: Operation requires team leader privileges
- `TEAM_INVALID_MEMBER`: Invalid member for the operation

## Usage Examples

### Complete Team Creation Flow

```javascript
// 1. Create a team
const createResponse = await fetch('/api/user/team', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Innovation Squad',
    description: 'Focused on product innovation',
    maxMembers: 5,
    isOpen: true
  })
});

const team = await createResponse.json();
console.log('Team created:', team);

// 2. Invite members
const inviteResponse = await fetch('/api/user/team/invite', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userIds: ['user1', 'user2', 'user3']
  })
});

const inviteResults = await inviteResponse.json();
console.log('Invite results:', inviteResults);

// 3. Get team members
const membersResponse = await fetch('/api/user/team/members', {
  headers: {
    'Authorization': `Bearer ${jwt}`
  }
});

const members = await membersResponse.json();
console.log('Team members:', members);
```

### Team Discovery and Joining

```javascript
// 1. Search for available teams
const searchResponse = await fetch('/api/user/teams/available?search=innovation&page=1&pageSize=10', {
  headers: {
    'Authorization': `Bearer ${jwt}`
  }
});

const availableTeams = await searchResponse.json();
console.log('Available teams:', availableTeams);

// 2. Get details of a specific team
const teamResponse = await fetch(`/api/user/teams/${teamId}`, {
  headers: {
    'Authorization': `Bearer ${jwt}`
  }
});

const teamDetails = await teamResponse.json();
console.log('Team details:', teamDetails);

// 3. Join the team
const joinResponse = await fetch(`/api/user/teams/${teamId}/join`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwt}`
  }
});

if (joinResponse.ok) {
  console.log('Successfully joined team');
}
```

### Manager Operations

```javascript
// 1. Get all teams in activity
const allTeamsResponse = await fetch('/api/user/manage/teams?page=1&pageSize=20', {
  headers: {
    'Authorization': `Bearer ${managerJwt}`
  }
});

const allTeams = await allTeamsResponse.json();
console.log('All teams:', allTeams);

// 2. Get team statistics
const statsResponse = await fetch('/api/user/manage/teams/statistics', {
  headers: {
    'Authorization': `Bearer ${managerJwt}`
  }
});

const stats = await statsResponse.json();
console.log('Team statistics:', stats);

// 3. Force remove a problematic member
const removeResponse = await fetch(`/api/user/manage/teams/${teamId}/members/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${managerJwt}`
  }
});

if (removeResponse.ok) {
  console.log('Member removed successfully');
}
```

### Error Handling Example

```javascript
async function createTeam(teamData) {
  try {
    const response = await fetch('/api/user/team', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(teamData)
    });

    if (!response.ok) {
      const error = await response.json();
      
      switch (error.businessCode) {
        case 4001:
          throw new Error('Team not found or user has no activity');
        case 3001:
          throw new Error('Invalid input data');
        default:
          throw new Error(`API Error: ${error.message}`);
      }
    }

    const team = await response.json();
    return team;
  } catch (error) {
    console.error('Failed to create team:', error.message);
    throw error;
  }
}
```

---

*This API documentation covers all available Team System endpoints. For implementation details and business logic, refer to the [System Overview](team-system-overview.md) and [Business Rules](team-business-rules.md) documentation.*