# Design Document: Profile Redesign

## Overview

This design document outlines the technical approach for redesigning the profile page of the AI Present Finder application. The redesign focuses on creating a cleaner, more visually consistent interface that follows the provided design reference while removing unnecessary navigation elements and maintaining existing functionality.

The profile page currently displays user information (avatar, name, email), admin-specific features, and a logout button. However, it includes an unnecessary back button and doesn't follow the application's design system consistently. This redesign will address these issues while preserving all existing functionality.

## Architecture

The profile redesign follows the existing feature-based architecture pattern used throughout the application:

```
frontend/src/features/profile/
├── views/
│   └── profile-view.tsx          # Main profile page component (to be redesigned)
└── components/                    # New directory for profile-specific components
    ├── profile-header.tsx         # Header with title (no back button)
    ├── profile-avatar.tsx         # Avatar with edit icon overlay
    ├── profile-info.tsx           # User name and email display
    └── profile-actions.tsx        # Admin button and logout button
```

### Component Hierarchy

```
ProfileView
├── ProfileHeader (title only, no back button)
├── ProfileAvatar (circular avatar with edit icon overlay)
├── ProfileInfo (name, email, admin badge)
├── ProfileActions (admin button if applicable)
└── LogoutButton
```

## Components and Interfaces

### ProfileView Component

The main container component that orchestrates the profile page layout.

**Props:** None (uses auth context)

**Responsibilities:**

- Fetch user data from auth context
- Determine if user is admin
- Handle logout action
- Coordinate layout of child components

**State:**

- No local state (relies on auth context)

### ProfileHeader Component

A simplified header component that displays only the page title.

**Props:**

```typescript
interface ProfileHeaderProps {
  title: string;
}
```

**Responsibilities:**

- Display centered page title
- Remove back button logic
- Apply consistent header styling

### ProfileAvatar Component

Displays the user's profile picture with an edit icon overlay.

**Props:**

```typescript
interface ProfileAvatarProps {
  src: string | null;
  alt: string;
  onEditClick?: () => void; // Optional for future edit functionality
}
```

**Responsibilities:**

- Display circular avatar image
- Show edit icon overlay in bottom-right corner
- Handle fallback for missing images
- Apply ring styling for visual emphasis

**Styling:**

- 128px × 128px circular avatar (h-32 w-32)
- Ring styling with appropriate color
- Edit icon positioned absolutely in bottom-right
- Orange/primary colored edit icon background

### ProfileInfo Component

Displays user name, email, and admin badge.

**Props:**

```typescript
interface ProfileInfoProps {
  givenName: string | null;
  familyName: string | null;
  email: string;
  isAdmin: boolean;
}
```

**Responsibilities:**

- Display full name with fallback to "Użytkownik"
- Display email in secondary text style
- Show admin badge if applicable
- Center all text content

**Styling:**

- Name: text-2xl font-semibold
- Email: text-sm text-primary
- Admin badge: font-semibold text-purple-600

### ProfileActions Component

Contains admin-specific actions and logout button.

**Props:**

```typescript
interface ProfileActionsProps {
  isAdmin: boolean;
  onViewFeedback: () => void;
  onLogout: () => Promise<void>;
}
```

**Responsibilities:**

- Conditionally render admin button
- Display logout button
- Handle action callbacks

**Styling:**

- Admin button: outline variant, full width, with icon
- Logout button: ghost variant, red text (text-red-600)

## Data Models

### User Model (Existing)

```typescript
interface User {
  id: string;
  email: string;
  givenName: string | null;
  familyName: string | null;
  picture: string | null;
  role: "user" | "admin";
}
```

### Auth Context (Existing)

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties and eliminated redundancy:

**Redundant/Combined:**

- Requirements 2.1, 2.2, and 2.4 all test role-based conditional rendering and can be combined into a single comprehensive property
- Requirements 4.1 and 4.4 both test the absence of the back button (redundant)

**Non-testable (visual/subjective):**

- Requirements 1.2, 5.1, 5.3 (visual consistency and design adherence)
- Requirements 4.2 (navigation pattern philosophy)
- Requirements 5.4, 5.5 (reference outdated UI patterns not in simplified design)

**Remaining unique properties:**

1. Role-based conditional rendering (admin vs regular user)
2. Name display formatting (combining given and family names)

### Correctness Properties

Property 1: Role-based conditional rendering
_For any_ user with role "admin", the profile page should display the admin badge and "Zobacz opinie" button, and _for any_ user with role "user", these elements should not be displayed
**Validates: Requirements 2.1, 2.2, 2.4**

Property 2: Name display formatting
_For any_ user with both givenName and familyName defined, the displayed name should be the concatenation of givenName, a space, and familyName, and _for any_ user with null givenName or familyName, the displayed name should be "Użytkownik"
**Validates: Requirements 1.4**

## Error Handling

### Missing User Data

**Scenario:** User object is null or undefined
**Handling:**

- Display loading state while auth context initializes
- Show fallback "Użytkownik" for missing name fields
- Use placeholder avatar for missing picture
- Gracefully handle null values in all display components

### Logout Failures

**Scenario:** Logout API call fails
**Handling:**

- Log error to console
- Still clear local user state
- Navigate to landing page regardless
- User can attempt login again if needed

### Navigation Failures

**Scenario:** Navigation to admin feedback page fails
**Handling:**

- Log error to console
- Show error toast notification
- Keep user on profile page
- Allow retry of navigation

### Image Loading Failures

**Scenario:** User's profile picture fails to load
**Handling:**

- Avatar component shows fallback with user's initial
- Use gradient background for visual appeal
- No error message needed (graceful degradation)

## Testing Strategy

### Unit Testing

The profile redesign will use **Vitest** and **React Testing Library** for unit tests, following the existing testing patterns in the application.

**Test Coverage:**

1. **ProfileView Component**
   - Renders user information correctly
   - Shows admin button only for admin users
   - Handles logout action
   - Displays loading state appropriately

2. **ProfileHeader Component**
   - Renders title correctly
   - Does not render back button
   - Applies correct styling

3. **ProfileAvatar Component**
   - Displays image when src is provided
   - Shows fallback when src is null
   - Renders edit icon overlay
   - Handles edit click (when implemented)

4. **ProfileInfo Component**
   - Displays full name when both names provided
   - Shows "Użytkownik" fallback for missing names
   - Displays email correctly
   - Shows admin badge for admin users only

5. **ProfileActions Component**
   - Renders admin button for admin users
   - Does not render admin button for regular users
   - Renders logout button for all users
   - Handles action callbacks correctly

### Property-Based Testing

The profile redesign will use **fast-check** for property-based testing to verify universal properties across many input variations.

**Configuration:**

- Each property test will run a minimum of 100 iterations
- Tests will generate random user data with various combinations of fields
- Tests will be tagged with comments referencing the design document properties

**Property Tests:**

1. **Role-based Conditional Rendering Property**
   - Generate random users with role "admin" or "user"
   - Verify admin elements appear only when role is "admin"
   - Verify admin elements never appear when role is "user"
   - **Feature: profile-redesign, Property 1: Role-based conditional rendering**

2. **Name Display Formatting Property**
   - Generate random users with various name combinations (both names, one name, no names)
   - Verify name display follows the formatting rules
   - Verify fallback to "Użytkownik" when names are null
   - **Feature: profile-redesign, Property 2: Name display formatting**

### Integration Testing

**User Flow Tests:**

1. Navigate to profile page → verify all elements render
2. Click logout → verify navigation to landing page
3. Admin user → verify admin button appears and navigates correctly

### Visual Regression Testing

While not automated, manual visual review should confirm:

- Avatar styling matches design reference
- Edit icon overlay positioned correctly
- Spacing and padding consistent with design
- Typography matches design system
- Colors match design reference

## Implementation Notes

### Styling Approach

The redesign will use **Tailwind CSS** classes following the existing pattern in the application:

**Key Styling Decisions:**

- Avatar: `h-32 w-32 rounded-full` with ring styling
- Edit icon: Absolute positioning with `bottom-0 right-0` offset
- Name: `text-2xl font-semibold text-foreground`
- Email: `text-sm text-primary`
- Admin badge: `font-semibold text-purple-600`
- Logout button: `text-red-600 hover:text-red-700`

### Accessibility Considerations

- Avatar alt text should include user's name
- Buttons should have clear, descriptive labels
- Focus states should be visible
- Color contrast should meet WCAG AA standards
- Keyboard navigation should work for all interactive elements

### Performance Considerations

- No additional API calls (uses existing auth context)
- Minimal re-renders (proper React memoization if needed)
- Lazy load admin components only when needed
- Optimize image loading with proper sizing

### Migration Strategy

1. Create new component files in `features/profile/components/`
2. Refactor `ProfileView` to use new components
3. Remove back button logic
4. Add edit icon overlay to avatar
5. Test thoroughly before deployment
6. Deploy with feature flag if needed for gradual rollout

## Dependencies

### External Libraries

- `@tanstack/react-router` - Navigation (existing)
- `lucide-react` - Icons (existing)
- `tailwindcss` - Styling (existing)
- `vitest` - Unit testing (existing)
- `@testing-library/react` - Component testing (existing)
- `fast-check` - Property-based testing (existing)

### Internal Dependencies

- `@/features/auth/use-auth` - Auth context hook
- `@/components/ui/button` - Button component
- `@/components/ui/avatar` - Avatar component (may need enhancement)
- `@/lib/utils` - Utility functions (cn for classnames)

## Future Enhancements

While not part of this redesign, potential future improvements include:

1. **Avatar Editing**
   - Implement actual edit functionality when edit icon is clicked
   - Allow users to upload new profile pictures
   - Integrate with backend API for avatar updates

2. **Profile Sections**
   - Add ACCOUNT, SETTINGS, SUPPORT sections as shown in design reference
   - Implement settings pages (notifications, privacy, linked accounts)
   - Add help center and contact support pages

3. **Profile Customization**
   - Allow users to edit their display name
   - Add bio or description field
   - Theme preferences

4. **Enhanced Admin Features**
   - More admin-specific actions
   - Quick stats or dashboard preview
   - Admin settings section
