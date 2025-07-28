# Team Accounts User Guide

This guide explains how to use the Team Accounts system to manage your team's gold and carbon resources in the business simulation platform.

## Getting Started

### What are Team Accounts?

Team Accounts are digital wallets that store two types of resources for your team:
- **Gold**: Primary currency for purchases and transactions
- **Carbon**: Environmental resource used for sustainability actions

Every team automatically gets an account when it's created, starting with 0 gold and 0 carbon.

### Who Can Do What?

| Role | Permissions |
|------|-------------|
| **Team Members** | View their team's account balance |
| **Team Leaders** | View their team's account balance |
| **Managers** | View and modify all team accounts in their activity |

## For Team Members & Leaders

### Viewing Your Team Account

As a team member or leader, you can view your team's account balance using the secure endpoint that automatically shows your own team's account.

**API Request:**
```bash
curl -X GET http://localhost:2999/api/user/team/account \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Example:**
```json
{
  "id": "teamaccount_123",
  "teamId": "team_456",
  "gold": 1500,
  "carbon": 750,
  "createdAt": "2025-07-28T10:00:00.000Z",
  "updatedAt": "2025-07-28T11:30:00.000Z",
  "team": {
    "id": "team_456",
    "name": "Alpha Squad",
    "description": "Strategic business simulation team",
    "leader": {
      "id": "user_789",
      "username": "alice_manager",
      "email": "alice@example.com",
      "firstName": "Alice",
      "lastName": "Johnson"
    },
    "members": [
      {
        "id": "teammember_101",
        "status": "ACTIVE",
        "user": {
          "id": "user_789",
          "username": "alice_manager",
          "email": "alice@example.com",
          "firstName": "Alice",
          "lastName": "Johnson"
        }
      }
    ]
  }
}
```

### Understanding the Response

- **Current Balances**: The `gold` and `carbon` fields show your team's current resource amounts
- **Team Information**: Includes team name, leader, and active members
- **Timestamps**: Shows when the account was created and last updated

### What You Can't Do

As a team member or leader, you **cannot**:
- Modify your team's account balances (only managers can do this)
- View other teams' account balances  
- Access accounts from other activities

### Common Scenarios

#### Scenario 1: Checking Balance Before Making a Purchase
```bash
# Check current balance
curl -X GET http://localhost:2999/api/user/team/account \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response shows: gold: 1000, carbon: 500
# You can afford items costing up to 1000 gold or 500 carbon
```

#### Scenario 2: Tracking Resource Changes
```bash
# Check balance in the morning
# Response: gold: 1000, carbon: 500

# Check again after manager adjustments
# Response: gold: 1200, carbon: 400
# Manager added 200 gold and removed 100 carbon
```

#### Scenario 3: No Team Account Yet
```bash
# If your team doesn't have an account yet
# Response: null (status 404)
# Contact your manager to create the account
```

## For Managers

### Overview Dashboard

Managers can view all team accounts within their activity and get summary statistics.

#### Get All Team Accounts
```bash
curl -X GET "http://localhost:2999/api/user/manage/team-accounts?page=1&pageSize=10" \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

#### Get Summary Statistics
```bash
curl -X GET http://localhost:2999/api/user/manage/team-accounts/summary \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

**Example Summary Response:**
```json
{
  "totalTeamsWithAccounts": 15,
  "totalGold": 15000,
  "totalCarbon": 7500,
  "averageGold": 1000,
  "averageCarbon": 500
}
```

### Managing Team Balances

#### Adding Resources (Delta Update)
Use this when you want to add or subtract amounts from current balances:

```bash
curl -X PUT http://localhost:2999/api/user/manage/team-accounts/team_456/balances \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goldDelta": 500,     // Add 500 gold
    "carbonDelta": -100   // Subtract 100 carbon
  }'
```

#### Setting Exact Amounts (Absolute Update)
Use this when you want to set balances to specific values:

```bash
curl -X PUT http://localhost:2999/api/user/manage/team-accounts/team_456/set-balances \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gold": 2000,    // Set gold to exactly 2000
    "carbon": 1000   // Set carbon to exactly 1000
  }'
```

### Manager Best Practices

#### 1. Regular Balance Monitoring
```bash
# Check summary statistics daily
curl -X GET http://localhost:2999/api/user/manage/team-accounts/summary \
  -H "Authorization: Bearer MANAGER_TOKEN"
```

#### 2. Fair Resource Distribution
```bash
# Get current distribution
curl -X GET http://localhost:2999/api/user/manage/team-accounts \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Identify teams with low balances and adjust accordingly
```

#### 3. Performance-Based Adjustments
```bash
# Reward high-performing teams
curl -X PUT http://localhost:2999/api/user/manage/team-accounts/top_team/balances \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"goldDelta": 200, "carbonDelta": 100}'
```

#### 4. Bulk Operations Planning
```bash
# For bulk operations, use a script to update multiple teams:
#!/bin/bash
teams=("team_1" "team_2" "team_3")
for team in "${teams[@]}"; do
  curl -X PUT "http://localhost:2999/api/user/manage/team-accounts/$team/balances" \
    -H "Authorization: Bearer MANAGER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"goldDelta": 100}'
done
```

## Common Use Cases

### Educational Scenarios

#### 1. Resource Allocation Exercise
**Scenario**: Teams start with equal resources and must manage them strategically.

**Manager Setup**:
```bash
# Give all teams equal starting amounts
for team in team_1 team_2 team_3; do
  curl -X PUT "http://localhost:2999/api/user/manage/team-accounts/$team/set-balances" \
    -H "Authorization: Bearer MANAGER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"gold": 1000, "carbon": 500}'
done
```

#### 2. Sustainability Challenge
**Scenario**: Teams earn carbon credits for eco-friendly decisions.

**Manager Actions**:
```bash
# Reward team for sustainable choice
curl -X PUT http://localhost:2999/api/user/manage/team-accounts/eco_team/balances \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"carbonDelta": 200}'
```

#### 3. Economic Simulation
**Scenario**: Teams experience market fluctuations affecting their gold reserves.

**Manager Actions**:
```bash
# Simulate market crash (reduce all teams' gold by 20%)
# First get current balances, then apply reduction
curl -X GET http://localhost:2999/api/user/manage/team-accounts \
  -H "Authorization: Bearer MANAGER_TOKEN"

# Then update each team (example for team with 1000 gold)
curl -X PUT http://localhost:2999/api/user/manage/team-accounts/team_1/balances \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"goldDelta": -200}'  # 20% reduction
```

## Error Handling

### Common Errors and Solutions

#### Error: "User is not in any team"
```json
{
  "statusCode": 404,
  "message": "User is not in any team or team account not found"
}
```
**Solution**: Join a team first or contact your manager.

#### Error: "Access denied"
```json
{
  "statusCode": 403,
  "message": "Only managers can access this feature"
}
```
**Solution**: This endpoint is for managers only. Use the team member endpoint instead.

#### Error: "Would result in negative balance"
```json
{
  "statusCode": 400,
  "message": "Invalid balance changes"
}
```
**Solution**: Reduce the delta amount or check current balances first.

#### Error: "User not enrolled in any activity"
```json
{
  "statusCode": 403,
  "message": "User not enrolled in any activity"
}
```
**Solution**: Enroll in an activity first.

## Security & Privacy

### Data Protection

- **Personal Security**: You can only see your own team's account balance
- **Activity Isolation**: Managers can only see teams in their assigned activity
- **Secure Authentication**: All requests require valid JWT tokens

### Best Practices

1. **Protect Your Token**: Never share your authentication token
2. **Regular Password Updates**: Change your password regularly
3. **Secure API Calls**: Always use HTTPS in production environments
4. **Log Out**: Log out when finished to invalidate your session

## Troubleshooting

### Issue: Can't See Team Account
**Possible Causes**:
1. Not a member of any team
2. Team doesn't have an account yet
3. Not enrolled in an activity

**Solutions**:
1. Join a team through the team management system
2. Contact your manager to create an account
3. Enroll in an activity

### Issue: Outdated Balance Information
**Possible Causes**:
1. Recent changes not reflected
2. Caching delays

**Solutions**:
1. Wait a few seconds and try again
2. Check with your manager about recent changes

### Issue: Manager Can't Update Balances
**Possible Causes**:
1. Team not in manager's activity
2. Invalid team ID
3. Insufficient permissions

**Solutions**:
1. Verify the team is in your assigned activity
2. Double-check the team ID
3. Confirm your manager role is active

## Getting Help

### Support Channels

1. **API Documentation**: Visit `http://localhost:2999/docs` for interactive API testing
2. **System Administrator**: Contact your system admin for technical issues
3. **Activity Manager**: Contact your activity manager for balance-related questions
4. **User Manual**: Check the main user documentation for general platform help

### Reporting Issues

When reporting issues, include:
1. Your user role (team member, leader, or manager)
2. The specific endpoint or action that failed
3. Error messages received
4. Steps to reproduce the issue
5. Expected vs. actual behavior

### Common Questions

**Q: How often are balances updated?**
A: Balances are updated in real-time when managers make changes.

**Q: Can I transfer resources to another team?**
A: Not directly. Only managers can modify balances between teams.

**Q: What happens if my team is disbanded?**
A: The team account is automatically deleted when the team is disbanded.

**Q: Can I see historical balance changes?**
A: Currently, only current balances are shown. Historical data may be available in future updates.

**Q: Is there a mobile app?**
A: The system is web-based and works on mobile browsers. A dedicated mobile app may be developed in the future.