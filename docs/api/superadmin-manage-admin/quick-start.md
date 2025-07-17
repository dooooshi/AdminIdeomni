# Superadmin Admin Management - Quick Start Guide

## Overview

This quick start guide provides essential information for using the Superadmin Admin Management APIs. It covers the most common operations and provides ready-to-use examples.

## Prerequisites

- Super Admin account with adminType 1
- Valid JWT access token
- API server running on port 2999

## Authentication

### 1. Login as Super Admin
```bash
curl -X POST http://localhost:2999/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "superadmin",
    "password": "SuperAdmin123!"
  }'
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "cm1234567890abcdef",
    "username": "superadmin",
    "adminType": 1
  }
}
```

### 2. Use Access Token
Include the access token in all subsequent requests:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Common Operations

### 1. Create a Limited Admin
```bash
curl -X POST http://localhost:2999/api/admin/create \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "content_admin",
    "email": "content@company.com",
    "password": "SecurePass123!",
    "firstName": "Content",
    "lastName": "Administrator",
    "adminType": 2
  }'
```

### 2. List All Admins
```bash
curl -X GET http://localhost:2999/api/admin/list \
  -H "Authorization: Bearer <your_access_token>"
```

### 3. Update Admin Information
```bash
curl -X PUT http://localhost:2999/api/admin/{admin_id} \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated First Name",
    "isActive": false
  }'
```

### 4. Delete Admin (Soft Delete)
```bash
curl -X DELETE http://localhost:2999/api/admin/{admin_id} \
  -H "Authorization: Bearer <your_access_token>"
```

### 5. View Admin Operation Logs
```bash
curl -X GET "http://localhost:2999/api/admin/{admin_id}/logs?limit=20" \
  -H "Authorization: Bearer <your_access_token>"
```

### 6. Get Own Operation Logs
```bash
curl -X GET http://localhost:2999/api/admin/logs/mine \
  -H "Authorization: Bearer <your_access_token>"
```

---

## Operation Log Examples

### Filter Logs by Action Type
```bash
# Get all admin creation logs
curl -X GET "http://localhost:2999/api/admin/{admin_id}/logs?action=CREATE_ADMIN&limit=10" \
  -H "Authorization: Bearer <your_access_token>"

# Get failed operations
curl -X GET "http://localhost:2999/api/admin/{admin_id}/logs?success=false" \
  -H "Authorization: Bearer <your_access_token>"
```

### Date Range Filtering
```bash
# Get logs from specific date range
curl -X GET "http://localhost:2999/api/admin/{admin_id}/logs?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z" \
  -H "Authorization: Bearer <your_access_token>"
```

---

## JavaScript Examples

### Admin Management Class
```javascript
class AdminManager {
  constructor(baseUrl, accessToken) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
  }

  async createAdmin(adminData) {
    const response = await fetch(`${this.baseUrl}/api/admin/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });
    return response.json();
  }

  async getAdminList() {
    const response = await fetch(`${this.baseUrl}/api/admin/list`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    return response.json();
  }

  async updateAdmin(adminId, updateData) {
    const response = await fetch(`${this.baseUrl}/api/admin/${adminId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    return response.json();
  }

  async deleteAdmin(adminId) {
    const response = await fetch(`${this.baseUrl}/api/admin/${adminId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    return response.json();
  }

  async getOperationLogs(adminId, filters = {}) {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${this.baseUrl}/api/admin/${adminId}/logs?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    return response.json();
  }
}

// Usage
const adminManager = new AdminManager('http://localhost:2999', 'your_access_token');

// Create a new admin
const newAdmin = await adminManager.createAdmin({
  username: 'marketing_admin',
  email: 'marketing@company.com',
  password: 'SecurePass123!',
  firstName: 'Marketing',
  lastName: 'Administrator',
  adminType: 2
});

// Get all admins
const admins = await adminManager.getAdminList();
console.log('All admins:', admins);

// Update admin
await adminManager.updateAdmin(newAdmin.id, {
  firstName: 'Senior Marketing',
  isActive: true
});

// Get operation logs
const logs = await adminManager.getOperationLogs(newAdmin.id, {
  limit: 10,
  action: 'CREATE_ADMIN'
});
```

---

## Python Examples

### Admin Management Client
```python
import requests
import json

class AdminManager:
    def __init__(self, base_url, access_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    def create_admin(self, admin_data):
        response = requests.post(
            f'{self.base_url}/api/admin/create',
            headers=self.headers,
            json=admin_data
        )
        return response.json()

    def get_admin_list(self):
        response = requests.get(
            f'{self.base_url}/api/admin/list',
            headers=self.headers
        )
        return response.json()

    def update_admin(self, admin_id, update_data):
        response = requests.put(
            f'{self.base_url}/api/admin/{admin_id}',
            headers=self.headers,
            json=update_data
        )
        return response.json()

    def delete_admin(self, admin_id):
        response = requests.delete(
            f'{self.base_url}/api/admin/{admin_id}',
            headers=self.headers
        )
        return response.json()

    def get_operation_logs(self, admin_id, **filters):
        response = requests.get(
            f'{self.base_url}/api/admin/{admin_id}/logs',
            headers=self.headers,
            params=filters
        )
        return response.json()

# Usage
admin_manager = AdminManager('http://localhost:2999', 'your_access_token')

# Create a new admin
new_admin = admin_manager.create_admin({
    'username': 'support_admin',
    'email': 'support@company.com',
    'password': 'SecurePass123!',
    'firstName': 'Support',
    'lastName': 'Administrator',
    'adminType': 2
})

print(f"Created admin: {new_admin['username']}")

# Get all admins
admins = admin_manager.get_admin_list()
print(f"Total admins: {len(admins)}")

# Get operation logs with filters
logs = admin_manager.get_operation_logs(
    new_admin['id'],
    limit=10,
    action='CREATE_ADMIN'
)
print(f"Found {len(logs)} log entries")
```

---

## Error Handling

### Common Error Responses

#### 403 - Insufficient Permissions
```json
{
  "success": false,
  "businessCode": 2016,
  "message": "Insufficient admin permissions to perform this action",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/admin/create"
}
```

#### 409 - Username/Email Conflict
```json
{
  "success": false,
  "businessCode": 2018,
  "message": "Admin username or email already exists",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/admin/create",
  "details": {
    "field": "username",
    "value": "existing_admin"
  }
}
```

### Error Handling Best Practices

#### JavaScript
```javascript
async function createAdminSafely(adminData) {
  try {
    const response = await fetch('/api/admin/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`${result.message} (Code: ${result.businessCode})`);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    throw error;
  }
}
```

#### Python
```python
def create_admin_safely(admin_manager, admin_data):
    try:
        result = admin_manager.create_admin(admin_data)
        
        if not result.get('success', True):
            raise Exception(f"{result['message']} (Code: {result['businessCode']})")
        
        return result
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
        raise
    except Exception as e:
        print(f"Failed to create admin: {e}")
        raise
```

---

## Testing Scenarios

### 1. Admin Lifecycle Test
```bash
#!/bin/bash

# Set variables
BASE_URL="http://localhost:2999"
ACCESS_TOKEN="your_access_token"

# Create admin
echo "Creating admin..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/admin/create \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_admin_'$(date +%s)'",
    "email": "test'$(date +%s)'@company.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "Admin",
    "adminType": 2
  }')

ADMIN_ID=$(echo $ADMIN_RESPONSE | jq -r '.id')
echo "Created admin with ID: $ADMIN_ID"

# Update admin
echo "Updating admin..."
curl -s -X PUT $BASE_URL/api/admin/$ADMIN_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Test",
    "isActive": false
  }'

# Get operation logs
echo "Getting operation logs..."
curl -s -X GET "$BASE_URL/api/admin/$ADMIN_ID/logs?limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Delete admin
echo "Deleting admin..."
curl -s -X DELETE $BASE_URL/api/admin/$ADMIN_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"

echo "Test completed!"
```

### 2. Log Monitoring Test
```javascript
// Monitor logs in real-time (if SSE endpoint exists)
const eventSource = new EventSource('/api/admin/logs/live?token=' + accessToken);

eventSource.onmessage = function(event) {
  const logEntry = JSON.parse(event.data);
  console.log('New operation:', {
    action: logEntry.action,
    admin: logEntry.adminId,
    success: logEntry.metadata.success,
    timestamp: logEntry.createdAt
  });
};

eventSource.onerror = function(error) {
  console.error('SSE error:', error);
};
```

---

## Performance Tips

### 1. Pagination for Large Lists
```bash
# Use pagination for admin lists
curl -X GET "http://localhost:2999/api/admin/list?page=1&pageSize=20" \
  -H "Authorization: Bearer <your_access_token>"
```

### 2. Efficient Log Queries
```bash
# Use specific filters to reduce response size
curl -X GET "http://localhost:2999/api/admin/{admin_id}/logs?action=CREATE_ADMIN&limit=10&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <your_access_token>"
```

### 3. Batch Operations
```javascript
// Create multiple admins efficiently
async function createMultipleAdmins(adminDataArray) {
  const promises = adminDataArray.map(adminData => 
    adminManager.createAdmin(adminData)
  );
  
  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  
  console.log(`Created ${successful.length} admins, ${failed.length} failed`);
  
  return { successful, failed };
}
```

---

## Security Best Practices

### 1. Token Management
```javascript
class TokenManager {
  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async refreshAccessToken() {
    const response = await fetch('/api/admin/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken })
    });

    const result = await response.json();
    this.accessToken = result.accessToken;
    localStorage.setItem('accessToken', this.accessToken);
    
    return this.accessToken;
  }

  async makeAuthenticatedRequest(url, options = {}) {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (response.status === 401) {
      await this.refreshAccessToken();
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
    }

    return response;
  }
}
```

### 2. Input Validation
```javascript
function validateAdminData(adminData) {
  const errors = [];

  if (!adminData.username || adminData.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (!adminData.email || !/\S+@\S+\.\S+/.test(adminData.email)) {
    errors.push('Valid email is required');
  }

  if (!adminData.password || adminData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (![1, 2].includes(adminData.adminType)) {
    errors.push('Admin type must be 1 or 2');
  }

  return errors;
}

// Usage
const adminData = {
  username: 'new_admin',
  email: 'admin@company.com',
  password: 'SecurePass123!',
  adminType: 2
};

const validationErrors = validateAdminData(adminData);
if (validationErrors.length > 0) {
  console.error('Validation errors:', validationErrors);
} else {
  // Proceed with admin creation
  await adminManager.createAdmin(adminData);
}
```

---

## Next Steps

1. **Explore Advanced Features**: Review the detailed endpoint documentation
2. **Implement Monitoring**: Set up log monitoring and alerting
3. **Security Review**: Implement proper authentication and authorization
4. **Testing**: Create comprehensive test suites for your integration
5. **Documentation**: Document your specific use cases and workflows

---

*Last Updated: January 2024*  
*Quick Start Guide Version: 1.0* 