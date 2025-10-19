
[2025-01-19 20:54:49] - **Team Member Data Structure Change**
- **Decision**: Changed team member structure from `string[]` to `{id: string, fullName: string}[]`
- **Rationale**: Original request specified members should have `id` (student ID like "2051052051") and `fullName` properties
- **Implementation**: Used JSON.stringify/parse for database storage while maintaining backward compatibility
- **Impact**: Improved data structure allows for better member identification and display

[2025-01-19 20:54:49] - **UI Architecture: Table vs Form-based Interface**
- **Decision**: Replaced form-based team creation UI with table view + dialog pattern
- **Rationale**: User requested table list view instead of inline form UI for better data presentation
- **Implementation**: Created reusable TeamDialog component for create/update operations
- **Impact**: Cleaner UI, better UX for managing multiple teams, easier to scan team information

[2025-01-19 20:54:49] - **Performance Optimization: Debounced API Calls**
- **Decision**: Implemented 1-second debounce for team order updates instead of immediate API calls
- **Rationale**: Prevents API spam when users rapidly click up/down buttons for reordering
- **Implementation**: Used useCallback + useRef pattern with setTimeout for debouncing
- **Impact**: Reduced server load, better user experience with immediate UI feedback

[2025-01-19 20:54:49] - **Database Efficiency: Batch Updates vs Individual Updates**
- **Decision**: Created `updateTeamOrders` action for batch updates instead of individual team updates
- **Rationale**: More efficient than multiple API calls, ensures atomicity of order changes
- **Implementation**: Used Prisma transactions to update multiple team orders simultaneously
- **Impact**: Better performance, data consistency, reduced database load
[2025-10-19 23:18:19] - **Criteria Component Restructuring and UI Fix**
- **Decision**: Restructured criteria components following team component pattern with separate directory structure
- **Rationale**: User requested consistent structure after seeing improved team organization, and original criteria had blank UI issue
- **Implementation**: 
  - Created `app/(private)/dashboard/events/[id]/criteria/` directory with actions.ts, CriteriaDialog.client.tsx, CriteriaTab.client.tsx
  - Moved all criteria-related server actions to dedicated actions.ts file
  - Fixed blank UI issue by replacing problematic useEffect synchronization with optimistic UI updates
  - Implemented handleSuccessAction pattern for immediate state updates
- **Impact**: Consistent modular structure, eliminated UI delays, improved maintainability
