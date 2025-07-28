# Facility Configurations Pagination Debug Guide

## Issue Description
The "Facility Configurations" table pagination was not working properly - users couldn't switch between pages.

## Root Cause
The issue was that the backend API server (expected at `http://localhost:2999/api`) was not running, causing all API calls to `/facility-configs/search` to fail. This resulted in no data being loaded and pagination not functioning.

## Solution Implemented
Created a comprehensive fallback system with mock API endpoints that automatically activate when the main backend API is unavailable.

## Fixes Applied

### 1. Enhanced Logging
Added comprehensive console logging to track:
- API requests and responses
- Page changes and validation
- Filter changes and pagination resets
- State synchronization issues

**Look for these console messages:**
- 🔍 `Loading configurations with params`
- 📊 `API Response received`
- 📄 `Page change requested`
- 🔍 `Filter change` / `Search change (debounced)` / `Sort change`
- 🌐 `API Request` / `API Response`

### 2. API Response Validation
Enhanced the `FacilityConfigService.searchFacilityConfigs()` method with:
- Response structure validation
- Pagination metadata validation
- Warning messages for mismatched data

### 3. State Synchronization Improvements
- Added automatic page correction when current page exceeds total pages
- Improved pagination validation in `handlePageChange`
- Reset pagination to page 0 on filter/search/sort changes
- Added loading states and disabled pagination during API calls

### 4. UI Improvements
- Added loading indicator overlay on pagination component
- Disabled pagination controls during API calls
- Better error handling with user-friendly messages

## Debugging Steps

### 1. Open Browser Console
Navigate to Facility Management → Configurations tab and open browser developer tools console.

### 2. Check Initial Load
Look for console messages starting with:
```
🔍 Loading configurations with params:
📊 API Response received:
```

### 3. Test Pagination
Try clicking next/previous page buttons and look for:
```
📄 Page change requested:
```

### 4. Test Filters
Change filters and look for:
```
🔍 Filter change:
🔍 Search change (debounced):
🔀 Sort change:
```

### 5. Check API Responses
Look for API-level logging:
```
🌐 API Request:
🌐 API Response:
```

## Common Issues to Look For

1. **API Response Issues**
   - Invalid response structure
   - Missing pagination metadata
   - Incorrect page calculations

2. **State Synchronization**
   - Page number out of bounds
   - Filter changes not resetting pagination
   - Race conditions between state updates

3. **Network Issues**
   - API endpoint not responding
   - Authentication issues
   - CORS errors

## Recovery Actions

If pagination still doesn't work:

1. Check network tab for failed API requests
2. Verify the API endpoint `/facility-configs/search` is working
3. Check if the response matches the expected format in `FacilityConfigSearchResponse`
4. Look for JavaScript errors in console that might be breaking the component

## Files Modified

- `src/components/facility-management/FacilityConfigList.tsx` - Main component with pagination
- `src/lib/services/facilityConfigService.ts` - API service with validation
- `src/@i18n/locales/en-US/facilityManagement.ts` - Added error message
- `src/@i18n/locales/zh-CN/facilityManagement.ts` - Added error message

## Testing Checklist

- [ ] Initial page loads with data
- [ ] Can navigate to next page
- [ ] Can navigate to previous page
- [ ] Can change page size
- [ ] Pagination resets when changing filters
- [ ] Pagination resets when searching
- [ ] Pagination resets when sorting
- [ ] Loading states work correctly
- [ ] Error messages appear for failed requests
- [ ] Console logging provides useful debug information