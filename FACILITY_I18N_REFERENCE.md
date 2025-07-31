# Facility Management i18n Reference

## Available Facility Type Translations

### Usage Example
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['facilityManagement', 'common']);
  
  // Get facility type name
  const facilityName = t('facilityManagement:FACILITY_TYPE_MINE');
  // Result: "Mining Facility" (EN) | "矿场" (ZH)
  
  // Get facility type description  
  const facilityDesc = t('facilityManagement:FACILITY_TYPE_MINE_DESCRIPTION');
  // Result: "Mining operations for extracting precious metals and minerals from underground deposits" (EN)
  // Result: "从地下矿床开采贵金属和矿物的采矿作业" (ZH)
  
  return (
    <div>
      <h3>{facilityName}</h3>
      <p>{facilityDesc}</p>
    </div>
  );
};
```

## Complete Facility Type Translations

### Raw Material Production Facilities

| Type | English Name | Chinese Name | Description Key |
|------|-------------|-------------|-----------------|
| MINE | Mining Facility | 矿场 | `facilityManagement:FACILITY_TYPE_MINE_DESCRIPTION` |
| QUARRY | Quarry | 采石场 | `facilityManagement:FACILITY_TYPE_QUARRY_DESCRIPTION` |
| FOREST | Forest | 林场 | `facilityManagement:FACILITY_TYPE_FOREST_DESCRIPTION` |
| FARM | Farm | 农场 | `facilityManagement:FACILITY_TYPE_FARM_DESCRIPTION` |
| RANCH | Ranch | 养殖场 | `facilityManagement:FACILITY_TYPE_RANCH_DESCRIPTION` |
| FISHERY | Fishery | 渔场 | `facilityManagement:FACILITY_TYPE_FISHERY_DESCRIPTION` |

### Functional Facilities

| Type | English Name | Chinese Name | Description Key |
|------|-------------|-------------|-----------------|
| FACTORY | Factory | 工厂 | `facilityManagement:FACILITY_TYPE_FACTORY_DESCRIPTION` |
| MALL | Shopping Mall | 商场 | `facilityManagement:FACILITY_TYPE_MALL_DESCRIPTION` |
| WAREHOUSE | Warehouse | 仓库 | `facilityManagement:FACILITY_TYPE_WAREHOUSE_DESCRIPTION` |
| MEDIA_BUILDING | Media Building | 媒体大楼 | `facilityManagement:FACILITY_TYPE_MEDIA_BUILDING_DESCRIPTION` |

### Infrastructure Facilities

| Type | English Name | Chinese Name | Description Key |
|------|-------------|-------------|-----------------|
| WATER_PLANT | Water Treatment Plant | 水厂 | `facilityManagement:FACILITY_TYPE_WATER_PLANT_DESCRIPTION` |
| POWER_PLANT | Power Plant | 电厂 | `facilityManagement:FACILITY_TYPE_POWER_PLANT_DESCRIPTION` |
| BASE_STATION | Base Station | 基站 | `facilityManagement:FACILITY_TYPE_BASE_STATION_DESCRIPTION` |

### Other Facilities

| Type | English Name | Chinese Name | Description Key |
|------|-------------|-------------|-----------------|
| FIRE_STATION | Fire Station | 消防站 | `facilityManagement:FACILITY_TYPE_FIRE_STATION_DESCRIPTION` |
| SCHOOL | School | 学校 | `facilityManagement:FACILITY_TYPE_SCHOOL_DESCRIPTION` |
| HOSPITAL | Hospital | 医院 | `facilityManagement:FACILITY_TYPE_HOSPITAL_DESCRIPTION` |
| PARK | Park | 公园 | `facilityManagement:FACILITY_TYPE_PARK_DESCRIPTION` |
| CINEMA | Cinema | 影院 | `facilityManagement:FACILITY_TYPE_CINEMA_DESCRIPTION` |

## Other Common Facility Translations

### Action Buttons
```typescript
t('facilityManagement:BUILD_FACILITY')          // "Build Facility" | "建造设施"
t('facilityManagement:UPGRADE_FACILITY')        // "Upgrade Facility" | "升级设施"  
t('facilityManagement:VIEW_DETAILS')           // "View Details" | "查看详情"
```

### Status Labels
```typescript
t('facilityManagement:ACTIVE')                 // "Active" | "活跃"
t('facilityManagement:UNDER_CONSTRUCTION')     // "Under Construction" | "建造中"
t('facilityManagement:MAINTENANCE')           // "Maintenance" | "维护中"
t('facilityManagement:DAMAGED')               // "Damaged" | "已损坏"
```

### UI Elements
```typescript
t('facilityManagement:MY_FACILITIES')          // "My Facilities" | "我的设施"
t('facilityManagement:DASHBOARD')             // "Dashboard" | "仪表板"
t('facilityManagement:ANALYTICS')             // "Analytics" | "分析"
t('facilityManagement:FILTER_AND_SEARCH')     // "Filter & Search" | "筛选与搜索"
```

## Best Practices

1. **Always use array format for useTranslation:**
   ```typescript
   const { t } = useTranslation(['facilityManagement', 'common']);
   ```

2. **Use colon notation for keys:**
   ```typescript
   t('facilityManagement:BUILD_FACILITY')  // ✅ Correct
   t('facilityManagement.BUILD_FACILITY')  // ❌ Wrong
   ```

3. **Dynamic key building:**
   ```typescript
   const facilityType = 'MINE';
   const description = t(`facilityManagement:FACILITY_TYPE_${facilityType}_DESCRIPTION`);
   ```

4. **Fallback handling:**
   ```typescript
   const description = t(`facilityManagement:FACILITY_TYPE_${type}_DESCRIPTION`, {
     defaultValue: 'No description available'
   });
   ```