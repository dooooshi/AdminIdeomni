# Team System Documentation

Welcome to the comprehensive documentation for the Team System - a collaborative feature that enables users to form and manage teams within business simulation activities.

## 📚 Documentation Index

### Core Documentation
- **[System Overview](team-system-overview.md)** - Architecture, components, and key features
- **[API Documentation](team-api-documentation.md)** - Complete endpoint reference with examples
- **[Database Schema](team-database-schema.md)** - Models, relationships, and constraints
- **[Business Rules](team-business-rules.md)** - Logic, constraints, and validation rules

### Integration & Development
- **[Integration Guide](team-integration-guide.md)** - System integrations and dependencies
- **[Development Guide](team-development-guide.md)** - Code examples and best practices
- **[Security Guide](team-security-guide.md)** - Authentication, authorization, and data protection

### Support & Maintenance
- **[Troubleshooting](team-troubleshooting.md)** - Common issues and solutions
- **[Changelog](team-changelog.md)** - Version history and updates

## 🚀 Quick Start

### For Developers
1. Read the [System Overview](team-system-overview.md) to understand the architecture
2. Review the [Database Schema](team-database-schema.md) for data model understanding
3. Check the [API Documentation](team-api-documentation.md) for endpoint details
4. Follow the [Development Guide](team-development-guide.md) for implementation examples

### For API Users
1. Start with the [API Documentation](team-api-documentation.md) for endpoint reference
2. Review [Business Rules](team-business-rules.md) to understand constraints
3. Check [Security Guide](team-security-guide.md) for authentication requirements
4. Use [Troubleshooting](team-troubleshooting.md) if you encounter issues

## 🏗️ System Overview

The Team System provides:

- **Team Creation & Management** - Users can create and manage teams within their activities
- **Membership Management** - Invite, join, leave, and remove team members
- **Leadership System** - Team leaders with elevated permissions and transfer capabilities
- **Manager Operations** - Activity managers can oversee and manage all teams
- **Activity Context** - Teams are isolated within specific business simulation activities

## 🔑 Key Features

### User Operations
- Create teams with customizable settings
- Join available teams in current activity
- Manage team membership and invitations
- Transfer team leadership
- Leave teams voluntarily

### Manager Operations
- View all teams within managed activities
- Force disband problematic teams
- Remove members from any team
- Override leadership assignments
- Access team statistics and analytics

### Security & Access Control
- JWT-based authentication
- Role-based permissions (User/Manager)
- Activity-specific team isolation
- Leader privilege validation

## 🏛️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Controllers   │────│    Services      │────│  Repositories   │
│                 │    │                  │    │                 │
│ TeamController  │    │   TeamService    │    │ TeamRepository  │
│ ManagerTeam     │    │                  │    │ TeamMember      │
│ Controller      │    │                  │    │ Repository      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌────────┴────────┐
                       │   Database      │
                       │                 │
                       │   Team Model    │
                       │   TeamMember    │
                       │   Model         │
                       └─────────────────┘
```

## 📋 API Endpoints Summary

### User Endpoints (`/api/user/team`)
- `POST /` - Create team
- `GET /` - Get user's team
- `PUT /` - Update team
- `DELETE /` - Leave team
- `GET /available` - List available teams
- `POST /join` - Join team
- `POST /invite` - Invite members
- `DELETE /members/{userId}` - Remove member
- `PUT /transfer-leadership` - Transfer leadership

### Manager Endpoints (`/api/user/manage/teams`)
- `GET /` - List all teams in activity
- `GET /{teamId}` - Get team details
- `DELETE /{teamId}` - Force disband team
- `DELETE /{teamId}/members/{userId}` - Remove team member
- `PUT /{teamId}/leader` - Change team leader
- `GET /statistics` - Get team statistics

## 🔗 Related Systems

- **[User System](../user/README.md)** - Authentication and user management
- **[Activity System](../activity/README.md)** - Business simulation activities
- **[Admin System](../admin/README.md)** - Administrative operations
- **[Prisma Module](../prisma/README.md)** - Database layer and ORM

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting Guide](team-troubleshooting.md)
2. Review relevant documentation sections
3. Consult the [Changelog](team-changelog.md) for recent updates
4. Contact the development team for unresolved issues

## 📄 License & Contributing

This documentation is part of the ServerIdeomni project. Please follow the project's contributing guidelines when making updates to the team system or its documentation.

---

*Last updated: July 2025*