# Announcement System API Specification

## Overview

The Announcement API provides RESTful endpoints for managing activity-scoped announcements. The API supports role-based access control with distinct permissions for Managers and Students, following the platform's standard authentication and response formatting patterns.

## Base URL

```
http://localhost:2999/api
```

## Authentication

All endpoints require JWT authentication using the `UserAuthGuard`. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow the standard platform format:

```typescript
{
  success: boolean,
  businessCode: number,
  message: string,
  data: T,
  timestamp: string,
  path?: string,
  extra?: object
}
```

## Manager Endpoints

### 1. Create Announcement

**Endpoint**: `POST /api/announcement`

**Description**: Creates a new announcement for the manager's current activity

**Authorization**: Manager role (userType: 1) required

**Request Body**:

```json
{
  "title": "string (required, max 200 chars)",
  "content": "string (required)"
}
```

**Response**:

```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Announcement created successfully",
  "data": {
    "id": "cm1234567890abcdef",
    "activityId": "cm0987654321fedcba",
    "authorId": "cm1111111111111111",
    "title": "Important Update: Team Meeting Tomorrow",
    "content": "Please attend the mandatory team meeting at 10 AM in the main hall.",
    "isActive": true,
    "likeCount": 0,
    "dislikeCount": 0,
    "createdAt": "2024-01-20T08:30:00.000Z",
    "updatedAt": "2024-01-20T08:30:00.000Z"
  },
  "timestamp": "2024-01-20T08:30:00.000Z"
}
```

**Error Responses**:

| Code | Message | Description |
|------|---------|-------------|
| 40001 | Unauthorized | User not authenticated |
| 40003 | Forbidden | User is not a Manager |
| 40004 | Activity not found | User not enrolled in any activity |
| 40022 | Validation error | Invalid title or content |

### 2. Update Announcement

**Endpoint**: `PUT /api/announcement/:id`

**Description**: Updates an existing announcement created by the manager

**Authorization**: Manager role (userType: 1) required, must be announcement author

**URL Parameters**:
- `id`: Announcement ID (string)

**Request Body**:

```json
{
  "title": "string (optional, max 200 chars)",
  "content": "string (optional)"
}
```

**Response**:

```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Announcement updated successfully",
  "data": {
    "id": "cm1234567890abcdef",
    "activityId": "cm0987654321fedcba",
    "authorId": "cm1111111111111111",
    "title": "Updated: Team Meeting Rescheduled",
    "content": "Meeting moved to 2 PM due to schedule conflicts.",
    "isActive": true,
    "likeCount": 5,
    "dislikeCount": 1,
    "createdAt": "2024-01-20T08:30:00.000Z",
    "updatedAt": "2024-01-20T10:15:00.000Z"
  },
  "timestamp": "2024-01-20T10:15:00.000Z"
}
```

**Error Responses**:

| Code | Message | Description |
|------|---------|-------------|
| 40001 | Unauthorized | User not authenticated |
| 40003 | Forbidden | User is not the author |
| 40004 | Not found | Announcement not found |
| 40022 | Validation error | Invalid update data |

### 3. Delete Announcement (Soft Delete)

**Endpoint**: `DELETE /api/announcement/:id`

**Description**: Soft deletes an announcement (sets isActive to false)

**Authorization**: Manager role (userType: 1) required, must be announcement author

**URL Parameters**:
- `id`: Announcement ID (string)

**Response**:

```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Announcement deleted successfully",
  "data": {
    "id": "cm1234567890abcdef",
    "deletedAt": "2024-01-20T11:00:00.000Z"
  },
  "timestamp": "2024-01-20T11:00:00.000Z"
}
```

**Error Responses**:

| Code | Message | Description |
|------|---------|-------------|
| 40001 | Unauthorized | User not authenticated |
| 40003 | Forbidden | User is not the author |
| 40004 | Not found | Announcement not found |

### 4. Get Manager's Announcements

**Endpoint**: `GET /api/announcement/my`

**Description**: Retrieves all announcements created by the authenticated manager

**Authorization**: Manager role (userType: 1) required

**Query Parameters**:
- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 20, max: 100)
- `includeDeleted`: Include soft-deleted announcements (optional, default: false)

**Response**:

```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Announcements retrieved successfully",
  "data": {
    "items": [
      {
        "id": "cm1234567890abcdef",
        "activityId": "cm0987654321fedcba",
        "title": "Team Meeting Tomorrow",
        "content": "Please attend the mandatory team meeting...",
        "isActive": true,
        "likeCount": 10,
        "dislikeCount": 2,
        "createdAt": "2024-01-20T08:30:00.000Z",
        "updatedAt": "2024-01-20T08:30:00.000Z",
        "activity": {
          "id": "cm0987654321fedcba",
          "name": "Business Simulation Q1 2024"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  },
  "timestamp": "2024-01-20T12:00:00.000Z"
}
```

## Student Endpoints

### 5. Get Activity Announcements

**Endpoint**: `GET /api/announcement`

**Description**: Retrieves all active announcements for the student's enrolled activity

**Authorization**: Student role (userType: 3) required

**Query Parameters**:
- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 20, max: 100)

**Response**:

```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Announcements retrieved successfully",
  "data": {
    "items": [
      {
        "id": "cm1234567890abcdef",
        "title": "Team Meeting Tomorrow",
        "content": "Please attend the mandatory team meeting...",
        "likeCount": 10,
        "dislikeCount": 2,
        "createdAt": "2024-01-20T08:30:00.000Z",
        "author": {
          "id": "cm1111111111111111",
          "username": "manager01",
          "name": "John Smith"
        },
        "myReaction": "LIKE"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "timestamp": "2024-01-20T13:00:00.000Z"
}
```

**Error Responses**:

| Code | Message | Description |
|------|---------|-------------|
| 40001 | Unauthorized | User not authenticated |
| 40003 | Forbidden | User is not a Student |
| 40004 | Activity not found | User not enrolled in any activity |

### 6. Get Single Announcement

**Endpoint**: `GET /api/announcement/:id`

**Description**: Retrieves detailed information about a specific announcement

**Authorization**: Student or Manager role required

**URL Parameters**:
- `id`: Announcement ID (string)

**Response**:

```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Announcement retrieved successfully",
  "data": {
    "id": "cm1234567890abcdef",
    "title": "Team Meeting Tomorrow",
    "content": "Please attend the mandatory team meeting at 10 AM in the main hall. We will discuss the upcoming project milestones and team assignments.",
    "likeCount": 10,
    "dislikeCount": 2,
    "createdAt": "2024-01-20T08:30:00.000Z",
    "updatedAt": "2024-01-20T08:30:00.000Z",
    "author": {
      "id": "cm1111111111111111",
      "username": "manager01",
      "name": "John Smith",
      "userType": 1
    },
    "myReaction": "LIKE",
    "reactions": {
      "likes": 10,
      "dislikes": 2,
      "total": 12
    }
  },
  "timestamp": "2024-01-20T14:00:00.000Z"
}
```

**Error Responses**:

| Code | Message | Description |
|------|---------|-------------|
| 40001 | Unauthorized | User not authenticated |
| 40003 | Forbidden | Announcement not in user's activity |
| 40004 | Not found | Announcement not found |

### 7. React to Announcement

**Endpoint**: `POST /api/announcement/:id/reaction`

**Description**: Adds or updates a reaction (like/dislike) to an announcement

**Authorization**: Student role (userType: 3) required

**URL Parameters**:
- `id`: Announcement ID (string)

**Request Body**:

```json
{
  "reactionType": "LIKE | DISLIKE"
}
```

**Response**:

```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Reaction added successfully",
  "data": {
    "id": "cm2222222222222222",
    "announcementId": "cm1234567890abcdef",
    "userId": "cm3333333333333333",
    "reactionType": "LIKE",
    "createdAt": "2024-01-20T15:00:00.000Z",
    "updatedAt": "2024-01-20T15:00:00.000Z",
    "announcement": {
      "likeCount": 11,
      "dislikeCount": 2
    }
  },
  "timestamp": "2024-01-20T15:00:00.000Z"
}
```

**Error Responses**:

| Code | Message | Description |
|------|---------|-------------|
| 40001 | Unauthorized | User not authenticated |
| 40003 | Forbidden | User is not a Student |
| 40004 | Not found | Announcement not found |
| 40022 | Validation error | Invalid reaction type |

### 8. Remove Reaction

**Endpoint**: `DELETE /api/announcement/:id/reaction`

**Description**: Removes the user's reaction from an announcement

**Authorization**: Student role (userType: 3) required

**URL Parameters**:
- `id`: Announcement ID (string)

**Response**:

```json
{
  "success": true,
  "businessCode": 20000,
  "message": "Reaction removed successfully",
  "data": {
    "removed": true,
    "announcement": {
      "likeCount": 10,
      "dislikeCount": 2
    }
  },
  "timestamp": "2024-01-20T16:00:00.000Z"
}
```

**Error Responses**:

| Code | Message | Description |
|------|---------|-------------|
| 40001 | Unauthorized | User not authenticated |
| 40003 | Forbidden | User is not a Student |
| 40004 | Not found | Reaction not found |

## DTO Definitions

### CreateAnnouncementDto

```typescript
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
```

### UpdateAnnouncementDto

```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateAnnouncementDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
```

### CreateReactionDto

```typescript
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum AnnouncementReactionType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE'
}

export class CreateReactionDto {
  @IsEnum(AnnouncementReactionType)
  @IsNotEmpty()
  reactionType: AnnouncementReactionType;
}
```

### PaginationDto

```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 20000 | SUCCESS | Operation completed successfully |
| 40001 | UNAUTHORIZED | Authentication required |
| 40003 | FORBIDDEN | Insufficient permissions |
| 40004 | NOT_FOUND | Resource not found |
| 40022 | VALIDATION_ERROR | Input validation failed |
| 50000 | INTERNAL_ERROR | Server error occurred |

## Rate Limiting

- Manager endpoints: 30 requests per minute
- Student read endpoints: 60 requests per minute
- Reaction endpoints: 30 requests per minute

## Example Implementation

### Controller Structure

```typescript
@Controller('announcement')
@UseGuards(UserAuthGuard)
@UseInterceptors(ResponseFormatterInterceptor)
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Post()
  @RequireRole(UserType.MANAGER)
  create(@Body() dto: CreateAnnouncementDto, @User() user: UserEntity) {
    return this.announcementService.create(dto, user);
  }

  @Get()
  @RequireRole(UserType.STUDENT)
  findAll(@Query() pagination: PaginationDto, @User() user: UserEntity) {
    return this.announcementService.findAllForStudent(pagination, user);
  }

  @Get('my')
  @RequireRole(UserType.MANAGER)
  findMyAnnouncements(@Query() pagination: PaginationDto, @User() user: UserEntity) {
    return this.announcementService.findByAuthor(pagination, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: UserEntity) {
    return this.announcementService.findOne(id, user);
  }

  @Put(':id')
  @RequireRole(UserType.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto, @User() user: UserEntity) {
    return this.announcementService.update(id, dto, user);
  }

  @Delete(':id')
  @RequireRole(UserType.MANAGER)
  remove(@Param('id') id: string, @User() user: UserEntity) {
    return this.announcementService.remove(id, user);
  }

  @Post(':id/reaction')
  @RequireRole(UserType.STUDENT)
  addReaction(@Param('id') id: string, @Body() dto: CreateReactionDto, @User() user: UserEntity) {
    return this.announcementService.addReaction(id, dto, user);
  }

  @Delete(':id/reaction')
  @RequireRole(UserType.STUDENT)
  removeReaction(@Param('id') id: string, @User() user: UserEntity) {
    return this.announcementService.removeReaction(id, user);
  }
}
```

## Testing Endpoints

### cURL Examples

```bash
# Create announcement (Manager)
curl -X POST http://localhost:2999/api/announcement \
  -H "Authorization: Bearer <manager_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting Tomorrow",
    "content": "Please attend the mandatory team meeting at 10 AM."
  }'

# Get announcements (Student)
curl -X GET http://localhost:2999/api/announcement?page=1&limit=10 \
  -H "Authorization: Bearer <student_token>"

# React to announcement (Student)
curl -X POST http://localhost:2999/api/announcement/cm1234567890abcdef/reaction \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "reactionType": "LIKE"
  }'

# Update announcement (Manager)
curl -X PUT http://localhost:2999/api/announcement/cm1234567890abcdef \
  -H "Authorization: Bearer <manager_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meeting Rescheduled",
    "content": "Meeting moved to 2 PM."
  }'
```

## Future API Enhancements

1. **Bulk Operations**
   - `POST /api/announcement/bulk` - Create multiple announcements
   - `DELETE /api/announcement/bulk` - Delete multiple announcements

2. **Analytics Endpoints**
   - `GET /api/announcement/analytics` - Engagement statistics
   - `GET /api/announcement/:id/analytics` - Per-announcement metrics

3. **Notification Integration**
   - `GET /api/announcement/unread` - Get unread announcements
   - `POST /api/announcement/:id/mark-read` - Mark as read

4. **Advanced Filtering**
   - Date range filtering
   - Search by keywords
   - Filter by reaction status