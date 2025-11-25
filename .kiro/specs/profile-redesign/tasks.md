# Implementation Plan

- [x] 1. Create profile component structure
  - Create `frontend/src/features/profile/components/` directory
  - Create component files: `profile-header.tsx`, `profile-avatar.tsx`, `profile-info.tsx`, `profile-actions.tsx`
  - Set up TypeScript interfaces for component props
  - _Requirements: 1.1, 4.3, 5.2_

- [x] 2. Implement ProfileHeader component
  - Create ProfileHeader component that displays only the title
  - Remove all back button logic and conditional rendering
  - Apply centered styling with proper padding
  - Export component for use in ProfileView
  - _Requirements: 4.1, 4.3, 4.4_

- [x] 3. Implement ProfileAvatar component
  - Create ProfileAvatar component with circular styling
  - Add edit icon overlay positioned in bottom-right corner
  - Implement fallback for missing profile pictures
  - Apply ring styling and proper sizing (h-32 w-32)
  - Use lucide-react Pencil icon for edit overlay
  - _Requirements: 1.1, 1.3, 5.2_

- [x] 4. Implement ProfileInfo component
  - Create ProfileInfo component for name and email display
  - Implement name formatting logic (givenName + familyName)
  - Add fallback to "Użytkownik" for missing names
  - Display email with secondary text styling
  - Add conditional admin badge rendering
  - _Requirements: 1.1, 1.4, 1.5, 2.1_

- [ ]\* 4.1 Write property test for name display formatting
  - **Property 2: Name display formatting**
  - **Validates: Requirements 1.4**

- [-] 5. Implement ProfileActions component
  - Create ProfileActions component with admin button and logout button
  - Add conditional rendering for admin "Zobacz opinie" button
  - Implement logout button with red text styling
  - Wire up navigation for admin feedback page
  - Wire up logout handler
  - _Requirements: 2.2, 2.3, 2.4, 3.1, 3.3_

- [ ]\* 5.1 Write property test for role-based conditional rendering
  - **Property 1: Role-based conditional rendering**
  - **Validates: Requirements 2.1, 2.2, 2.4**

- [x] 6. Refactor ProfileView to use new components
  - Import all new profile components
  - Replace existing JSX with new component structure
  - Remove back button logic and ArrowLeft import
  - Maintain existing auth context usage
  - Ensure proper component composition and data flow
  - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [ ]\* 7. Write unit tests for ProfileHeader component
  - Test that title renders correctly
  - Test that no back button is present
  - Test styling classes are applied
  - _Requirements: 4.1, 4.3_

- [ ]\* 8. Write unit tests for ProfileAvatar component
  - Test image rendering with valid src
  - Test fallback rendering with null src
  - Test edit icon overlay presence
  - Test circular styling and sizing
  - _Requirements: 1.3, 5.2_

- [ ]\* 9. Write unit tests for ProfileInfo component
  - Test full name display with both names
  - Test fallback to "Użytkownik" with missing names
  - Test email display
  - Test admin badge conditional rendering
  - _Requirements: 1.4, 1.5, 2.1_

- [ ]\* 10. Write unit tests for ProfileActions component
  - Test admin button renders for admin users
  - Test admin button does not render for regular users
  - Test logout button always renders
  - Test button click handlers
  - _Requirements: 2.2, 2.3, 2.4, 3.1_

- [ ]\* 11. Write integration tests for ProfileView
  - Test complete profile page rendering for regular user
  - Test complete profile page rendering for admin user
  - Test logout flow
  - Test admin navigation flow
  - _Requirements: 1.1, 2.2, 2.4, 3.2, 3.4_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [-] 13. Update styling to match design reference
  - Review design reference image for exact spacing and colors
  - Apply proper padding and margins throughout profile page
  - Ensure avatar edit icon styling matches design
  - Verify typography matches design system
  - Ensure color scheme matches (orange primary, red logout, purple admin badge)
  - _Requirements: 1.2, 5.1, 5.3_

- [ ] 14. Final verification and cleanup
  - Remove unused imports and code
  - Verify no console errors or warnings
  - Test on different screen sizes
  - Verify accessibility (keyboard navigation, focus states, alt text)
  - Ensure smooth navigation from bottom nav bar
  - _Requirements: All_
