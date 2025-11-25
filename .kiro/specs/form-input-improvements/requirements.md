# Requirements Document

## Introduction

This specification defines the requirements for improving form inputs throughout the AI Present Finder application, specifically focusing on social media URL inputs, budget selection, and occasion selection. These improvements will enhance user experience by providing clearer input guidance and more intuitive selection interfaces.

## Glossary

- **Form Input System**: The collection of input components used for gathering user information
- **URL Placeholder**: Example text displayed in an input field showing the expected format
- **Budget Component**: The interface for selecting or specifying a gift budget range
- **Occasion Selector**: The interface for choosing the gift-giving occasion
- **Predefined Button**: A clickable option representing a common choice (e.g., budget range, occasion type)
- **Custom Input**: A user-provided value that doesn't match predefined options
- **Social Media Profile**: User accounts on platforms like Instagram, X (Twitter), and TikTok

## Requirements

### Requirement 1

**User Story:** As a user, I want to see clear examples of the expected URL format for social media inputs, so that I know exactly what to enter.

#### Acceptance Criteria

1. WHEN a user views the Instagram URL input field THEN the Form Input System SHALL display a placeholder showing "instagram.com/username" format
2. WHEN a user views the X (Twitter) URL input field THEN the Form Input System SHALL display a placeholder showing "x.com/username" format
3. WHEN a user views the TikTok URL input field THEN the Form Input System SHALL display a placeholder showing "tiktok.com/@username" format
4. WHEN displaying URL placeholders THEN the Form Input System SHALL use example usernames that clearly demonstrate the format

### Requirement 2

**User Story:** As a user, I want to quickly select a budget range from common options, so that I can specify my spending limit without typing.

#### Acceptance Criteria

1. WHEN a user views the budget selection interface THEN the Form Input System SHALL display predefined budget range buttons
2. WHEN displaying budget options THEN the Form Input System SHALL include ranges: "Under 50zł", "50-100zł", and "100-200zł"
3. WHEN a user clicks a predefined budget button THEN the Form Input System SHALL select that budget range and visually highlight the selection
4. WHEN a budget button is selected THEN the Form Input System SHALL apply an orange border or background to indicate the active selection

### Requirement 3

**User Story:** As a user, I want to specify a custom budget amount if the predefined ranges don't match my needs, so that I have flexibility in my gift search.

#### Acceptance Criteria

1. WHEN a user views the budget selection interface THEN the Form Input System SHALL display an "Other" button alongside predefined options
2. WHEN a user clicks the "Other" button THEN the Form Input System SHALL reveal a custom budget input field
3. WHEN the "Other" option is selected THEN the Form Input System SHALL apply the same visual highlighting as predefined buttons
4. WHEN a user enters a custom budget value THEN the Form Input System SHALL validate and accept numeric input

### Requirement 4

**User Story:** As a user, I want to select the occasion for my gift from common options, so that the recommendations are contextually appropriate.

#### Acceptance Criteria

1. WHEN a user views the occasion selection interface THEN the Form Input System SHALL display predefined occasion buttons with icons
2. WHEN displaying occasion options THEN the Form Input System SHALL include: "Birthday", "Anniversary", "Holiday", and "Just Because"
3. WHEN a user clicks an occasion button THEN the Form Input System SHALL select that occasion and apply visual highlighting
4. WHEN an occasion is selected THEN the Form Input System SHALL apply an orange border to indicate the active selection
5. WHEN displaying occasions THEN the Form Input System SHALL show relevant icons for each option (cake for Birthday, heart for Anniversary, party popper for Holiday, smiley for Just Because)

### Requirement 5

**User Story:** As a user, I want the "Find Gift Ideas" button to be easily accessible and visually prominent, so that I can proceed with my search without confusion.

#### Acceptance Criteria

1. WHEN a user views the gift search form THEN the Form Input System SHALL display the "Find Gift Ideas" button with reduced border radius
2. WHEN the form is displayed THEN the Form Input System SHALL position the "Find Gift Ideas" button at the bottom of the screen with absolute positioning
3. WHEN a user scrolls the form THEN the Form Input System SHALL keep the "Find Gift Ideas" button visible and fixed at the bottom
4. WHEN displaying the button THEN the Form Input System SHALL use the application's primary orange color and full width styling
5. WHEN the button is rendered THEN the Form Input System SHALL ensure it has less rounded corners compared to the previous design

### Requirement 6

**User Story:** As a user, I want the main form to focus on essential information, so that I'm not overwhelmed with too many fields.

#### Acceptance Criteria

1. WHEN a user views the main gift search form THEN the Form Input System SHALL display only "Occasion" and "Budget" as the primary visible fields
2. WHEN the form loads THEN the Form Input System SHALL minimize or collapse less critical fields to reduce visual clutter
3. WHEN displaying the form THEN the Form Input System SHALL use clear, concise labels: "What's the occasion?" and "What's your budget?"
