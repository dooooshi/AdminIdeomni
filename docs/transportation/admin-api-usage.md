# Transportation Configuration Admin API Usage

## Current Configuration

The active transportation configuration has:
- **Configuration ID**: `cmf9g25qq00014fvz203qex14`
- **Template ID**: `1`
- **Status**: Active ✅

## API Endpoints

### 1. List All Configurations
```bash
GET /api/admin/transportation-configs
GET /api/admin/transportation-configs?isActive=true
```

### 2. Get Configuration by Template ID
```bash
GET /api/admin/transportation-configs/1
```
This retrieves the active configuration for template ID 1.

### 3. Update Configuration
```bash
PUT /api/admin/transportation-configs/cmf9g25qq00014fvz203qex14
```
**Important**: Use the configuration ID (CUID), not the template ID!

Example request body:
```json
{
  "tierAMinDistance": 0,
  "tierAMaxDistance": 3,
  "tierABaseCost": 10,
  "tierASpaceBasis": 100,
  "tierAEmissionRate": 0.5,
  "tierAEnabled": true
}
```

### 4. Create New Configuration
```bash
POST /api/admin/transportation-configs
```

### 5. Delete Configuration
```bash
DELETE /api/admin/transportation-configs/cmf9g25qq00014fvz203qex14
```

## Common Mistakes

### ❌ Wrong - Using template ID for updates:
```bash
PUT /api/admin/transportation-configs/1
```
This will fail with "No record was found" error.

### ✅ Correct - Using configuration ID:
```bash
PUT /api/admin/transportation-configs/cmf9g25qq00014fvz203qex14
```

## How to Find the Configuration ID

1. **List all configurations**:
   ```bash
   GET /api/admin/transportation-configs
   ```

2. **Get by template ID** (returns the config with its ID):
   ```bash
   GET /api/admin/transportation-configs/1
   ```

3. **Run the helper script**:
   ```bash
   npx tsx scripts/list-transport-configs.ts
   ```

## Update Example

To update the transportation configuration with the correct ID:

```bash
curl -X PUT http://localhost:2999/api/admin/transportation-configs/cmf9g25qq00014fvz203qex14 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tierAMinDistance": 0,
    "tierAMaxDistance": 3,
    "tierBMinDistance": 4,
    "tierBMaxDistance": 6,
    "tierCMinDistance": 7,
    "tierCMaxDistance": 9,
    "tierDMinDistance": 10
  }'
```