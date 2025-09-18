# Feature: Manager Product Formula for MTO Module

## Background

### Target Users Type
- **Primary Users**: Managers (User role type) - Activity organizers who design and manage Made-To-Order requirements
- **Secondary Users**: Students/Teams - Who will fulfill MTO requirements based on these formulas

### Expected Impact
- **Business Metrics**: Enable structured MTO product requirements with standardized formulas
- **User Benefits**: Managers can flexibly design product specifications for MTO requirements
- **Technical Benefits**: Centralized product formula management for MTO system

### Platform Overview
The Manager Product Formula module extends the existing business simulation platform with activity-specific product formula capabilities for Made-To-Order (MTO) requirements. This allows managers to define custom product specifications that teams must fulfill during MTO events.

**Technology Stack**:
- **Framework**: NestJS with Fastify adapter (port 2999)
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript
- **Package Manager**: pnpm (always use pnpm, never npm)
- **Authentication**: JWT with User authentication (Manager role required)
- **i18n**: English and Chinese language support

## Implementation Details

### Key Differences from Team Product Formula
1. **Ownership**: Activity-shared (all managers) vs Team-owned
2. **Scope**: Activity-wide vs Team-specific
3. **Purpose**: MTO requirement specifications vs Team production recipes
4. **Access**: All managers in activity (collaborative) vs Any team member
5. **Flexibility**: Full material selection from raw material list vs Constrained by team's capabilities
6. **Collaboration**: Multiple managers can create, edit, delete formulas within same activity

### Database Models
- Location: `prisma/models/manager-product-formula.prisma`
- Key models:
  - `ManagerProductFormula` - Main formula entity
  - `ManagerProductFormulaMaterial` - Material requirements
  - `ManagerProductFormulaCraftCategory` - Craft categories

### API Endpoints
- Controller: `src/mto/controllers/manager-product-formula.controller.ts`
- Services: `src/mto/services/manager-product-formula.service.ts`
- DTOs: `src/mto/dto/`
- Base Paths:
  - Product Formulas: `/api/user/manager/mto/product-formulas`
  - Raw Materials: `/api/user/manager/mto/raw-materials`
  - Craft Categories: `/api/user/manager/mto/craft-categories`

### Architecture Decisions

#### 1. Material Selection
- **Full Access**: Managers can select ANY raw material from the complete raw material list
- **No Restrictions**: Unlike team formulas, no facility origin constraints
- **Quantity Flexibility**: Support decimal quantities (0.001-9999.999)
- **Purpose**: Enable diverse MTO requirements that challenge teams

#### 2. Activity-Based Collaboration
- **Activity-Specific**: Each formula belongs to a specific activity
- **Shared Access**: ALL managers within an activity have full access to all formulas
- **Collaborative Management**: Any manager can create, edit, delete, or clone formulas in their activity
- **Audit Trail**: System tracks which manager created or modified each formula
- **Formula Numbering**: Auto-incremented within each activity scope

#### 3. Integration with MTO Types
- **MTO Type 1**: Links to `manager_requirement_product_type_1` via formula ID
- **MTO Type 2**: Links to `manager_requirement_product_type_2` via formula ID
- **Validation**: Teams must match formula specifications when delivering products

### Key Features

1. **Collaborative Formula Management**
   - Multiple managers in same activity share full access to all formulas
   - Any manager can create, edit, or delete formulas within their activity
   - Audit trail tracks which manager performed each action
   - Enables team-based MTO planning and coordination

2. **Formula Creation**
   - Managers can create product formulas with custom specifications
   - Select from all available raw materials
   - Define multiple craft categories for production flexibility
   - Auto-calculate costs and carbon emissions

3. **Formula Operations**
   - List all formulas in the activity (created by any manager)
   - Update any formula in the activity (before MTO release)
   - Archive/delete unused formulas
   - Clone any formula for reuse

4. **Formula Validation**
   - Validate craft category combinations
   - Ensure material uniqueness
   - Calculate total costs automatically
   - Carbon emission tracking

### Testing Strategy
- Integration tests for all API endpoints
- Validation tests for formula constraints
- Permission tests for Manager role access
- Cost calculation verification

## Quick Links

### Project Resources
- [CLAUDE.md](/CLAUDE.md) - Project guidelines and conventions
- [MTO Requirements](/docs/mto/requirements.md) - MTO module requirements
- [Team Product Formula](/docs/facility/factory/product-formula/) - Reference implementation
- [API Documentation](http://localhost:2999/docs) - Swagger UI
- [Prisma Studio](http://localhost:5555) - Database management

## Notes & Decisions Log

### Important Decisions
1. **Collaborative Access Model**: All managers within an activity have full access to all formulas, promoting teamwork and coordination
2. **Material Selection Freedom**: Managers have unrestricted access to all raw materials to create diverse challenges
3. **Activity Scope**: Formulas are activity-specific, not global, to maintain activity independence
4. **Shared Management**: Any manager can modify any formula in their activity (when not locked)
5. **Cost Calculation**: Use same calculation logic as team formulas for consistency
6. **Audit Trail**: Track createdBy and updatedBy to maintain accountability despite shared access
7. **No Version Control**: Initially, no versioning for formulas (can be added later if needed)

### Open Questions
1. Should managers be able to create formula templates for reuse across activities?
2. Should there be a review/approval process for formula creation?
3. How to handle formula updates after MTO has been released?

### Risks & Mitigations
- **Risk**: Complex formulas may be impossible for teams to fulfill
  - **Mitigation**: Add validation warnings for high-complexity formulas

- **Risk**: Formula changes after MTO release could cause conflicts
  - **Mitigation**: Lock formulas once associated with active MTO requirements

## Integration with MTO Module

### MTO Type 1 Integration
- Formula defines the product specifications
- Teams must match formula exactly to fulfill requirements
- System validates deliveries against formula

### MTO Type 2 Integration
- Formula defines acceptable products for MALL submissions
- Teams with MALL facilities submit products matching formula
- System validates submissions during settlement

## API Usage Examples

### Create Manager Product Formula
```bash
POST /api/user/manager/mto/product-formulas
Authorization: Bearer {manager_jwt_token}
Content-Type: application/json

{
  "productName": "Advanced Circuit Board",
  "productDescription": "High-performance electronic component for MTO requirement",
  "activityId": "clxx1234567890abcdef",
  "craftCategories": [
    {"craftCategoryId": 11},  // Electronic Equipment - Level 3
    {"craftCategoryId": 15}   // Precision Manufacturing - Level 2
  ],
  "materials": [
    {"rawMaterialId": 85, "quantity": 10.5},   // Copper
    {"rawMaterialId": 88, "quantity": 7.25},   // Silicon
    {"rawMaterialId": 95, "quantity": 3.0},    // Lithium
    {"rawMaterialId": 72, "quantity": 15.75}   // Rare Earth Elements
  ]
}
```

### List Activity Formulas
```bash
GET /api/user/manager/mto/product-formulas?activityId=clxx1234567890abcdef
Authorization: Bearer {manager_jwt_token}
```

### Update Formula (before MTO release)
```bash
PUT /api/user/manager/mto/product-formulas/{formulaId}
Authorization: Bearer {manager_jwt_token}
Content-Type: application/json

{
  "productDescription": "Updated description",
  "materials": [...]
}
```