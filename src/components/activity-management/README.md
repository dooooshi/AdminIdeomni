# Activity Management Module

A comprehensive business simulation activity management system built for the Ideomni platform, providing full CRUD operations, statistics dashboard, and real-time activity monitoring for super administrators.

## Overview

This module implements a complete activity management solution based on the API specifications in `docs/activity/activity-api.md`. It provides a modern, intuitive interface for super administrators to manage business simulation activities and monitor their lifecycle.

## Structure

```
src/components/activity-management/
├── ActivityList.tsx           # Activity listing with search, filters, and actions
├── ActivityForm.tsx          # Create/edit activity form with validation
├── ActivityStatistics.tsx   # Statistics dashboard with visual charts
├── index.ts                  # Component exports
└── README.md                 # This documentation
```

## Features

### 1. Activity Management
- **Create Activities**: Full form with validation for creating new business simulation activities
- **Edit Activities**: Update existing activity information, schedules, and settings
- **Delete Activities**: Soft delete with confirmation dialog (can be restored)
- **List Activities**: Paginated table with search, filtering, and sorting
- **Restore Activities**: Super admin can restore soft-deleted activities

### 2. Advanced Search & Filtering
- **Text Search**: Search activities by name with debounced input
- **Type Filtering**: Filter by activity type (BizSimulation2_0, 2_2, 3_1)
- **Status Filtering**: Filter by active/inactive status
- **Date Range Filtering**: Filter activities by start/end date ranges
- **Include Deleted**: Toggle to show/hide soft-deleted activities
- **Real-time Updates**: Live data updates with automatic refresh

### 3. Statistics Dashboard
- **Overview Cards**: Total, active, upcoming, and ongoing activity counts
- **Type Distribution**: Visual chart showing activity distribution by type
- **Status Breakdown**: Progress bars showing activity status distribution
- **Real-time Metrics**: Live statistics with automatic updates

### 4. User Experience Features
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Internationalization**: Complete support for English and Chinese languages
- **Loading States**: Elegant loading indicators for all async operations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Accessibility**: Full WCAG compliance with proper ARIA attributes

## Components

### ActivityList

Main component for displaying and managing activities in a data table format.

```tsx
import { ActivityList } from '@/components/activity-management';

<ActivityList
  onCreateActivity={() => void}
  onEditActivity={(activity: Activity) => void}
  onViewActivity={(activity: Activity) => void}
/>
```

**Features:**
- Paginated data table with sorting capabilities
- Advanced search across activity names
- Multi-level filtering (type, status, date range)
- Bulk statistics display
- Action buttons for each activity (edit, delete, restore)
- Real-time status indicators
- Duration calculations and formatting
- Empty state with call-to-action

**Key Props:**
- `onCreateActivity`: Callback triggered when create button is clicked
- `onEditActivity`: Callback triggered when edit action is selected
- `onViewActivity`: Optional callback for view-only access

### ActivityForm

Modal form component for creating and editing activities with comprehensive validation.

```tsx
import { ActivityForm } from '@/components/activity-management';

<ActivityForm
  open={boolean}
  onClose={() => void}
  activity={Activity | null}          // null for create, Activity object for edit
  onSuccess={(activity: Activity) => void}
/>
```

**Features:**
- Create and edit modes with dynamic validation
- Date/time pickers with timezone support
- Activity type selection with descriptions
- Real-time duration calculation
- Form validation with Yup schemas
- Loading states during API calls
- Error handling with field-specific messages

**Validation Rules:**
- Activity name: 3-200 characters, required
- Activity type: Must be valid enum value, required
- Start date: Must be in the future, required
- End date: Must be after start date, required
- Description: Optional, max 1000 characters

### ActivityStatistics

Comprehensive statistics dashboard with visual metrics and charts.

```tsx
import { ActivityStatistics } from '@/components/activity-management';

<ActivityStatistics />
```

**Features:**
- Overview metric cards with color-coded indicators
- Activity type distribution with percentage bars
- Status breakdown with progress indicators
- Responsive grid layout
- Auto-refresh capabilities
- Error state with retry functionality
- Empty state handling

**Metrics Displayed:**
- Total activities count
- Active activities count
- Upcoming activities count
- Ongoing activities count
- Distribution by activity type
- Status breakdown visualization

## API Integration

All components use the `ActivityService` class which implements the complete API specification:

```typescript
import ActivityService from '@/lib/services/activityService';

// Activity management
const activities = await ActivityService.searchActivities(params);
const newActivity = await ActivityService.createActivity(activityData);
const updatedActivity = await ActivityService.updateActivity(id, updateData);
await ActivityService.deleteActivity(id);
await ActivityService.restoreActivity(id);

// Statistics and status
const statistics = await ActivityService.getActivityStatistics();
const upcoming = await ActivityService.getUpcomingActivities();
const ongoing = await ActivityService.getOngoingActivities();
```

## Data Models

### Activity
```typescript
interface Activity {
  id: string;
  name: string;
  activityType: ActivityType;
  startAt: string;                    // ISO date string
  endAt: string;                      // ISO date string
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
```

### ActivityType
```typescript
enum ActivityType {
  BizSimulation2_0 = 'BizSimulation2_0',
  BizSimulation2_2 = 'BizSimulation2_2',
  BizSimulation3_1 = 'BizSimulation3_1',
}
```

### ActivityStatistics
```typescript
interface ActivityStatistics {
  total: number;
  active: number;
  upcoming: number;
  ongoing: number;
  byType: {
    [ActivityType.BizSimulation2_0]: number;
    [ActivityType.BizSimulation2_2]: number;
    [ActivityType.BizSimulation3_1]: number;
  };
}
```

## Usage Example

Here's how to implement the activity management page:

```tsx
'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import {
  ActivityList,
  ActivityForm,
  ActivityStatistics,
  Activity
} from '@/components/activity-management';

const ActivityManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const handleCreateActivity = () => {
    setEditingActivity(null);
    setActivityFormOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityFormOpen(true);
  };

  const handleActivityFormSuccess = (activity: Activity) => {
    // Handle success - refresh data, show notification, etc.
    setActivityFormOpen(false);
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
        <Tab label="Activities" />
        <Tab label="Statistics" />
      </Tabs>

      {tabValue === 0 && (
        <ActivityList
          onCreateActivity={handleCreateActivity}
          onEditActivity={handleEditActivity}
        />
      )}

      {tabValue === 1 && (
        <ActivityStatistics />
      )}

      <ActivityForm
        open={activityFormOpen}
        onClose={() => setActivityFormOpen(false)}
        activity={editingActivity}
        onSuccess={handleActivityFormSuccess}
      />
    </Box>
  );
};

export default ActivityManagementPage;
```

## Dependencies

### Required Packages
- `@mui/material` - UI components and theming
- `@mui/icons-material` - Material Design icons
- `@mui/x-date-pickers` - Date and time selection components
- `formik` - Form handling and state management
- `yup` - Form validation schemas
- `react-i18next` - Internationalization support
- `date-fns` - Date manipulation and formatting

### Internal Dependencies
- `@/lib/services/activityService` - API service layer
- `@/lib/http/api-client` - HTTP client configuration
- `@ideomni/core/IdeomniPageSimple` - Page layout component

## Configuration

### Environment Variables
The module uses the configured API client from `@/lib/http/api-client`, which should be configured with:
- API base URL (`/api/activity`)
- Authentication headers (JWT tokens)
- Request/response interceptors
- Error handling middleware

### Permissions
Activity management features are available based on admin type:
- **Super Admin (Type 1)**: Full access to all activities and operations
- **Limited Admin (Type 2)**: Read-only access to own created activities

### Route Configuration
Add to your navigation configuration:
```typescript
{
  id: 'admin-management.activity-management',
  title: 'Activity Management',
  type: 'item',
  icon: 'heroicons-outline:calendar-days',
  url: '/activity-management',
  translate: 'ACTIVITY_MANAGEMENT',
  auth: ['admin']
}
```

## Internationalization

The module supports multiple languages through react-i18next:

### Available Languages
- **English (en-US)**: Complete translation set
- **Chinese (zh-CN)**: Complete translation set

### Adding New Languages
1. Create translation file: `src/@i18n/locales/[lang]/activityManagement.ts`
2. Add to locale index: `src/@i18n/locales/[lang]/index.ts`
3. Configure in i18n setup

### Translation Keys
All UI text uses translation keys from the `activityManagement` namespace:
- Form labels and placeholders
- Validation messages
- Success/error notifications
- Status indicators
- Action buttons
- Help text and tooltips

## Error Handling

The module implements comprehensive error handling:

1. **Network Errors**: Graceful handling of API failures with retry options
2. **Validation Errors**: Real-time form validation with field-specific messages
3. **Permission Errors**: Clear messaging for insufficient permissions
4. **Loading States**: Consistent loading indicators across all components
5. **Empty States**: Helpful empty states with call-to-action buttons

## Performance Considerations

1. **Pagination**: All lists use server-side pagination to handle large datasets
2. **Debounced Search**: Search inputs are debounced to reduce API calls
3. **Lazy Loading**: Components load data only when needed
4. **Memoization**: Expensive calculations are memoized using React hooks
5. **Optimistic Updates**: UI updates immediately with server confirmation

## Security Features

1. **Input Validation**: All form inputs are validated both client and server-side
2. **Permission Checks**: Features are hidden/disabled based on user permissions
3. **Audit Logging**: All activity actions are automatically logged via API
4. **XSS Protection**: All user input is properly sanitized
5. **CSRF Protection**: API requests include CSRF tokens

## Testing

To test the activity management components:

1. **Unit Tests**: Test individual component logic and API service methods
2. **Integration Tests**: Test component interactions and API integration
3. **E2E Tests**: Test complete user workflows from creation to deletion
4. **Permission Tests**: Verify access control works correctly for different admin types
5. **Responsive Tests**: Test across different screen sizes and devices

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Accessibility**: WCAG 2.1 AA compliant

## Troubleshooting

### Common Issues

1. **Date Picker Not Working**: Ensure `@mui/x-date-pickers` and `date-fns` are installed
2. **Translation Keys Missing**: Check if translation files are properly imported
3. **API Errors**: Verify API endpoint configuration and authentication
4. **Permission Denied**: Ensure user has appropriate admin privileges
5. **Loading Issues**: Check network connectivity and API response format

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('debug', 'activity-management:*');
```

This will log detailed information about API calls, state changes, and user interactions.

---

*This module follows the Ideomni platform conventions and integrates seamlessly with the existing admin management system. For questions or issues, refer to the project documentation or contact the development team.* 