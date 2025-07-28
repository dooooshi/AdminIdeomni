# Admin Facility Management Workflows

## Overview

This document provides comprehensive workflows for managing facility build configurations in the admin system. These workflows cover common scenarios from basic setup to advanced customization and maintenance operations.

## Prerequisites

- Admin account with `TILE_FACILITY_CONFIG_MANAGE` permissions
- Valid admin JWT token
- Map template(s) created and configured
- Understanding of land types (MARINE, COASTAL, PLAIN) and facility types

## Basic Workflows

### 1. New Template Setup Workflow

**Scenario**: Setting up a new map template with facility configurations for a business simulation.

**Steps:**

```bash
# 1. Create the map template
curl -X POST "http://localhost:2999/api/admin/map-templates" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manufacturing Simulation Template",
    "description": "Focused on industrial and manufacturing facilities",
    "version": "1.0",
    "isActive": true
  }'

# Response: Note the template ID (e.g., templateId: 5)

# 2. Generate tiles for the template (optional if not already done)
curl -X POST "http://localhost:2999/api/admin/map-templates/generate" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "Manufacturing Grid",
    "width": 15,
    "height": 7,
    "marinePercentage": 20,
    "coastalPercentage": 40,
    "plainPercentage": 40
  }'

# 3. Initialize default facility configurations
curl -X POST "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/initialize-defaults" \
  -H "Authorization: Bearer <admin_token>"

# 4. Review the generated configurations
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>"

# 5. Verify facility restrictions are correct
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/by-land-type/MARINE" \
  -H "Authorization: Bearer <admin_token>"
```

**Expected Outcome**: Template ready with 54 facility configurations (18 facility types × 3 land types), with appropriate restrictions (marine allows only fisheries, etc.).

---

### 2. Scenario Difficulty Customization Workflow

**Scenario**: Creating easy, normal, and hard versions of the same template.

**Easy Mode - Reduce costs by 25%:**
```bash
# Reduce costs across all land types
for landType in MARINE COASTAL PLAIN; do
  curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/land-type/$landType/bulk-update" \
    -H "Authorization: Bearer <admin_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "requiredGoldMultiplier": 0.75,
      "requiredCarbonMultiplier": 0.75,
      "upgradeGoldCostMultiplier": 0.75,
      "upgradeCarbonCostMultiplier": 0.75
    }'
done
```

**Hard Mode - Increase costs and reduce max levels:**
```bash
# Increase costs and make upgrades more challenging
for landType in MARINE COASTAL PLAIN; do
  curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/land-type/$landType/bulk-update" \
    -H "Authorization: Bearer <admin_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "requiredGoldMultiplier": 1.5,
      "requiredCarbonMultiplier": 1.75,
      "upgradeGoldCostMultiplier": 2.0,
      "fixedMaxLevel": 3
    }'
done
```

**Verification:**
```bash
# Check the impact of changes
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>"

# Test upgrade costs for key facilities
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/upgrade-calculator/PLAIN/FACTORY?targetLevel=3" \
  -H "Authorization: Bearer <admin_token>"
```

---

### 3. Facility-Specific Customization Workflow

**Scenario**: Creating a specialized simulation focused on specific industries.

**Maritime Economy Focus:**
```bash
# 1. Boost marine facilities
curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/land-type/MARINE/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requiredGoldMultiplier": 0.8,
    "fixedMaxLevel": 6,
    "upgradeGoldCostMultiplier": 0.9
  }'

# 2. Make coastal fishing more attractive
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/by-facility-type/FISHERY" \
  -H "Authorization: Bearer <admin_token>"

# Note the config IDs for coastal fishery, then update individually
curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/clx_coastal_fishery_id" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requiredGold": 50000,
    "requiredCarbon": 1200,
    "maxLevel": 8,
    "upgradeGoldCost": 20000,
    "upgradeMultiplier": 1.3
  }'

# 3. Restrict heavy industry on coastal areas
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs?landType=COASTAL&facilityType=FACTORY" \
  -H "Authorization: Bearer <admin_token>"

# Disable factory construction on coastal areas
curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/clx_coastal_factory_id" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"isAllowed": false}'
```

---

## Advanced Workflows

### 4. A/B Testing Configuration Workflow

**Scenario**: Creating multiple template variants to test different economic balances.

**Template Cloning and Variation:**
```bash
# 1. Clone existing template
curl -X POST "http://localhost:2999/api/admin/map-templates/5/clone" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manufacturing Simulation - Variant A",
    "description": "Higher upgrade costs, lower build costs"
  }'

# Note new template ID (e.g., 6)

# 2. Apply Variant A modifications - Lower build costs, higher upgrade costs
curl -X PUT "http://localhost:2999/api/admin/map-templates/6/tile-facility-configs/land-type/PLAIN/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requiredGoldMultiplier": 0.8,
    "requiredCarbonMultiplier": 0.8,
    "upgradeGoldCostMultiplier": 1.5,
    "upgradeCarbonCostMultiplier": 1.5
  }'

# 3. Clone for Variant B
curl -X POST "http://localhost:2999/api/admin/map-templates/5/clone" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manufacturing Simulation - Variant B",
    "description": "Lower upgrade costs, higher build costs"
  }'

# Note new template ID (e.g., 7)

# 4. Apply Variant B modifications - Higher build costs, lower upgrade costs
curl -X PUT "http://localhost:2999/api/admin/map-templates/7/tile-facility-configs/land-type/PLAIN/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requiredGoldMultiplier": 1.2,
    "requiredCarbonMultiplier": 1.2,
    "upgradeGoldCostMultiplier": 0.7,
    "upgradeCarbonCostMultiplier": 0.7
  }'

# 5. Compare configurations
echo "Variant A Statistics:"
curl -X GET "http://localhost:2999/api/admin/map-templates/6/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>"

echo "Variant B Statistics:"
curl -X GET "http://localhost:2999/api/admin/map-templates/7/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>"
```

---

### 5. Progressive Unlock System Workflow

**Scenario**: Creating a scenario where advanced facilities require lower-tier facilities as prerequisites.

**Implementation:**
```bash
# 1. Get all factory configurations to update prerequisites
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/by-facility-type/FACTORY" \
  -H "Authorization: Bearer <admin_token>"

# 2. Update factory configurations to require power and water plants
# (Note: This requires individual updates for each land type configuration)

# For each factory config ID found above:
curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/clx_config_id" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "buildData": {
      "constructionTime": 36,
      "prerequisites": ["POWER_PLANT", "WATER_PLANT"],
      "unlockLevel": 2,
      "description": "Advanced manufacturing requires power and water infrastructure"
    }
  }'

# 3. Create a tiered unlock system through custom upgrade data
curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/clx_hospital_config_id" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "buildData": {
      "prerequisites": ["POWER_PLANT", "WATER_PLANT", "SCHOOL"],
      "unlockLevel": 3,
      "tier": "ADVANCED"
    },
    "upgradeData": {
      "unlocksAtLevel": {
        "2": ["EMERGENCY_SERVICES"],
        "4": ["SPECIALIST_CARE"],
        "6": ["RESEARCH_FACILITY"]
      }
    }
  }'

# 4. Set up resource extraction as Tier 1 (no prerequisites)
for facility in FARM RANCH FOREST QUARRY; do
  curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/land-type/PLAIN/bulk-update" \
    -H "Authorization: Bearer <admin_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "buildData": {
        "tier": "BASIC",
        "unlockLevel": 1,
        "prerequisites": []
      }
    }'
done
```

---

### 6. Seasonal/Event Configuration Workflow

**Scenario**: Temporarily modifying facility configurations for special events or seasonal changes.

**Pre-Event Configuration Backup:**
```bash
# 1. Document current configuration state
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs?page=1&pageSize=100" \
  -H "Authorization: Bearer <admin_token>" > config_backup.json

# 2. Get detailed statistics for restoration reference
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>" > stats_backup.json
```

**Event Modifications - "Harvest Festival" (Boost Agricultural Facilities):**
```bash
# 1. Boost all farming-related facilities
for facility in FARM RANCH; do
  echo "Boosting $facility configurations..."
  # This would require getting facility configs by type and updating individually
  # Simplified here for demonstration
done

# 2. Apply farm-specific boosts
curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/land-type/PLAIN/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requiredGoldMultiplier": 0.6,
    "requiredCarbonMultiplier": 0.7,
    "upgradeGoldCostMultiplier": 0.8
  }'

# 3. Add temporary event data
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/by-facility-type/FARM" \
  -H "Authorization: Bearer <admin_token>"

# Update each farm config with event data
curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/clx_farm_config_id" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "upgradeData": {
      "eventBonus": {
        "name": "Harvest Festival",
        "productionBonus": 0.25,
        "experienceBonus": 0.15,
        "endDate": "2025-08-15T23:59:59Z"
      }
    }
  }'
```

**Post-Event Restoration:**
```bash
# 1. Restore standard multipliers
curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/land-type/PLAIN/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "requiredGoldMultiplier": 1.0,
    "requiredCarbonMultiplier": 1.0,
    "upgradeGoldCostMultiplier": 1.0
  }'

# 2. Remove event data from facilities
# (This would require individual updates to remove event-specific upgrade data)

# 3. Verify restoration
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>"
```

---

## Maintenance Workflows

### 7. Configuration Audit and Cleanup Workflow

**Scenario**: Regular maintenance to ensure configuration integrity and performance.

**Monthly Configuration Audit:**
```bash
#!/bin/bash
# Configuration audit script

ADMIN_TOKEN="your_admin_token"
TEMPLATE_ID=5

echo "=== Facility Configuration Audit Report ==="
echo "Date: $(date)"
echo "Template ID: $TEMPLATE_ID"
echo

# 1. Overall statistics
echo "1. Configuration Statistics:"
curl -s -X GET "http://localhost:2999/api/admin/map-templates/$TEMPLATE_ID/tile-facility-configs/statistics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.data'

# 2. Find configurations with potentially problematic values
echo -e "\n2. Configurations with High Costs (>200k gold):"
curl -s -X GET "http://localhost:2999/api/admin/map-templates/$TEMPLATE_ID/tile-facility-configs?page=1&pageSize=100" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | \
  jq '.data[] | select(.requiredGold > 200000) | {id, landType, facilityType, requiredGold}'

# 3. Check for disabled configurations
echo -e "\n3. Disabled Configurations:"
curl -s -X GET "http://localhost:2999/api/admin/map-templates/$TEMPLATE_ID/tile-facility-configs?isAllowed=false&page=1&pageSize=100" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | \
  jq '.data[] | {id, landType, facilityType, isAllowed}'

# 4. Upgrade cost validation
echo -e "\n4. Testing Upgrade Cost Calculations:"
for landType in COASTAL PLAIN; do
  for facility in FACTORY MINE HOSPITAL; do
    echo "Testing $landType $facility to level 5:"
    curl -s -X GET "http://localhost:2999/api/admin/map-templates/$TEMPLATE_ID/tile-facility-configs/upgrade-calculator/$landType/$facility?targetLevel=5" \
      -H "Authorization: Bearer $ADMIN_TOKEN" | \
      jq '.data.totalCost // "Not available"'
  done
done

echo -e "\n=== Audit Complete ==="
```

---

### 8. Configuration Migration Workflow

**Scenario**: Migrating facility configurations from one template to another, with modifications.

**Migration Process:**
```bash
# 1. Export source template configurations
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs?page=1&pageSize=100" \
  -H "Authorization: Bearer <admin_token>" > source_configs.json

# 2. Create new template
curl -X POST "http://localhost:2999/api/admin/map-templates" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Migrated Template - Updated Economics",
    "description": "Template based on Template 5 with updated economic balance",
    "version": "2.0"
  }'

# Note new template ID (e.g., 8)

# 3. Initialize defaults for the new template
curl -X POST "http://localhost:2999/api/admin/map-templates/8/tile-facility-configs/initialize-defaults" \
  -H "Authorization: Bearer <admin_token>"

# 4. Apply global modifications during migration
# Increase all costs by 10% and reduce upgrade multipliers
for landType in MARINE COASTAL PLAIN; do
  curl -X PUT "http://localhost:2999/api/admin/map-templates/8/tile-facility-configs/land-type/$landType/bulk-update" \
    -H "Authorization: Bearer <admin_token>" \
    -H "Content-Type: application/json" \
    -d '{
      "requiredGoldMultiplier": 1.1,
      "requiredCarbonMultiplier": 1.1,
      "upgradeMultiplier": 1.3
    }'
done

# 5. Selectively copy specific customizations from source
# (This would require parsing source_configs.json and applying specific updates)

# 6. Validate migration
echo "Source template statistics:"
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>" | jq '.data.averageCosts'

echo "Migrated template statistics:"
curl -X GET "http://localhost:2999/api/admin/map-templates/8/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>" | jq '.data.averageCosts'
```

---

## Performance Optimization Workflows

### 9. Configuration Performance Analysis Workflow

**Scenario**: Analyzing and optimizing configuration query performance.

**Performance Testing:**
```bash
#!/bin/bash
# Performance analysis script

ADMIN_TOKEN="your_admin_token"
TEMPLATE_ID=5

echo "=== Configuration Performance Analysis ==="

# 1. Test pagination performance
echo "1. Testing pagination performance:"
time curl -s -X GET "http://localhost:2999/api/admin/map-templates/$TEMPLATE_ID/tile-facility-configs?page=1&pageSize=50" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null

# 2. Test filtering performance
echo "2. Testing filtered queries:"
time curl -s -X GET "http://localhost:2999/api/admin/map-templates/$TEMPLATE_ID/tile-facility-configs?landType=COASTAL&isAllowed=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null

# 3. Test statistics generation
echo "3. Testing statistics generation:"
time curl -s -X GET "http://localhost:2999/api/admin/map-templates/$TEMPLATE_ID/tile-facility-configs/statistics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null

# 4. Test bulk operations
echo "4. Testing bulk operation performance:"
time curl -s -X PUT "http://localhost:2999/api/admin/map-templates/$TEMPLATE_ID/tile-facility-configs/land-type/PLAIN/bulk-update" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requiredGoldMultiplier": 1.0}' > /dev/null

echo "=== Performance Analysis Complete ==="
```

---

## Troubleshooting Workflows

### 10. Configuration Error Resolution Workflow

**Common Issues and Solutions:**

**Issue: Configurations not initializing properly**
```bash
# 1. Check template existence
curl -X GET "http://localhost:2999/api/admin/map-templates/5" \
  -H "Authorization: Bearer <admin_token>"

# 2. Check existing configurations
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs?page=1&pageSize=10" \
  -H "Authorization: Bearer <admin_token>"

# 3. Re-initialize if needed
curl -X POST "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/initialize-defaults" \
  -H "Authorization: Bearer <admin_token>"

# 4. Verify initialization
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/statistics" \
  -H "Authorization: Bearer <admin_token>"
```

**Issue: Bulk operations failing**
```bash
# 1. Test with smaller scope first
curl -X PUT "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/land-type/MARINE/bulk-update" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"requiredGoldMultiplier": 1.1}'

# 2. Check for validation errors in response
# 3. Try individual updates if bulk fails

# 4. Verify current state
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/by-land-type/MARINE" \
  -H "Authorization: Bearer <admin_token>"
```

**Issue: Upgrade calculations returning errors**
```bash
# 1. Verify configuration exists and has upgrade costs
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/by-facility-type/FACTORY" \
  -H "Authorization: Bearer <admin_token>"

# 2. Check if specific configuration is upgradable
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/clx_config_id" \
  -H "Authorization: Bearer <admin_token>"

# 3. Test with valid parameters
curl -X GET "http://localhost:2999/api/admin/map-templates/5/tile-facility-configs/upgrade-calculator/PLAIN/FACTORY?targetLevel=3" \
  -H "Authorization: Bearer <admin_token>"
```

---

## Best Practices Summary

### Development Workflow Best Practices

1. **Always Test on Non-Production Templates First**
   - Create test templates for configuration experiments
   - Use template cloning for A/B testing
   - Document changes thoroughly

2. **Use Statistics for Validation**
   - Check statistics before and after bulk changes
   - Monitor average costs and distributions
   - Verify upgrade cost calculations

3. **Implement Gradual Changes**
   - Make small incremental adjustments
   - Test upgrade paths thoroughly
   - Monitor player feedback and activity metrics

4. **Maintain Configuration Backups**
   - Document configuration states before major changes
   - Use version control for configuration scripts
   - Keep audit trails of all modifications

5. **Performance Considerations**
   - Use pagination for large result sets
   - Filter queries to reduce data transfer
   - Batch related operations together
   - Monitor response times for bulk operations

### Security and Compliance

1. **Permission Management**
   - Use least-privilege access for configuration management
   - Separate read and write permissions appropriately
   - Audit permission assignments regularly

2. **Change Management**
   - Document all configuration changes
   - Use structured change approval processes
   - Test changes in development environments first

3. **Data Integrity**
   - Validate all configuration changes
   - Monitor for configuration drift
   - Implement automated consistency checks

This comprehensive workflow documentation provides practical guidance for all aspects of facility configuration management, from basic setup to advanced customization and maintenance operations.