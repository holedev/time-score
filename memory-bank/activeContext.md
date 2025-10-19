# Active Context

## Recent Changes

### Tailwind CSS v4 Upgrade (2025-04-23)
- Upgraded from Tailwind CSS v3.4.17 to v4.0.0
- Changes made:
  1. Package Updates:
     ```json
     {
       "postcss": "^8.4.38",
       "tailwindcss": "^4"
     }
     ```
  2. Configuration Updates:
     - Added new v4 features in tailwind.config.ts:
       - Added `prefix: ""`
       - Added `future: { hoverOnlyWhenSupported: true }`
       - Using `satisfies Config` type assertion
     - Maintained existing theme configuration for shadcn UI compatibility
  3. Verified globals.css compatibility with v4

### Current Status
- All shadcn UI components working with Tailwind v4
- Dark mode functionality preserved
- Custom theme configurations maintained
- CSS utilities functioning as expected

## Active Decisions

### Styling & Theme
- Continue using shadcn UI components with Tailwind v4
- Maintain current color scheme and design tokens
- Preserve dark mode implementation

### Development Workflow
- Using Biome for code formatting
- Following conventional commits
- Maintaining TypeScript strict mode

## Next Steps

### Immediate Tasks
- Monitor for any styling inconsistencies with Tailwind v4
- Test responsive layouts thoroughly
- Verify component animations
- Check dark mode transitions

### Future Considerations
- Explore new Tailwind v4 features
- Consider updating shadcn UI when new versions released
- Monitor PostCSS updates
- Consider adding more utility classes as needed

## Current Focus
- Ensuring stability with Tailwind v4 upgrade
- Maintaining consistent styling across components
- Preserving performance optimizations

[2025-01-19 20:54:08] - **TeamTab Component Enhancement Completed**
- Successfully implemented complete team management functionality in `app/(private)/dashboard/events/[id]/_components/TeamTab.client.tsx`
- Changed member data structure from `string[]` to `{id: string, fullName: string}[]` format
- Replaced form-based UI with table view showing teams with proper member display
- Added create/update dialog for team management with member ID and full name validation
- Implemented auto-generated team ordering system
- Added up/down buttons for team reordering with 1-second debounced API calls
- Created `updateTeamOrders` server action for efficient batch updates using Prisma transactions
- Added delete confirmation alert dialog for safety
- All features working with proper TypeScript types and error handling
[2025-10-19 23:18:19] - **Criteria Component Restructuring Completed**
- Successfully restructured criteria management following team component pattern
- Fixed critical blank UI issue that occurred after create/delete operations
- New structure: `app/(private)/dashboard/events/[id]/criteria/` with actions.ts, CriteriaDialog.client.tsx, CriteriaTab.client.tsx
- Implemented optimistic UI updates for immediate user feedback
- All features working: create template, manage records, delete operations with proper error handling
- EventManagementTabs updated to use new import paths
