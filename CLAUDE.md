# Claude Development Notes

## Development Guidelines

### When removing Next.js pages during development:

1. **Clear build cache after removing pages:**
   ```bash
   rm -rf .next
   rm -f tsconfig.tsbuildinfo  
   npm run build
   ```

2. **Add redirects in `next.config.ts` for removed routes:**
   ```typescript
   async redirects() {
     return [
       {
         source: '/old-route',
         destination: '/new-route', 
         permanent: true
       }
     ];
   }
   ```

3. **Always restart dev server after removing pages:**
   ```bash
   # Stop current dev server (Ctrl+C)
   npm run dev
   ```

This prevents 404 errors and ensures proper route resolution during development.

## Project Structure Notes

- Create Team functionality has been moved from `/team-management/create` page to a modal in the Team Dashboard
- The modal component is located at: `src/app/(control-panel)/team-management/dashboard/CreateTeamModal.tsx`
- Navigation has been updated to remove the "Create Team" menu item - users access the modal via buttons in the dashboard

## Commands

- **Build:** `npm run build`  
- **Dev:** `npm run dev`
- **Type Check:** `npm run type-check`