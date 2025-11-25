# Requirements Document

## Introduction

This specification defines the requirements for polishing the search history interface and related UI elements in the AI Present Finder application. The improvements focus on proper spacing, consistent styling, and better visual presentation of search history items.

## Glossary

- **Search History System**: The interface displaying past gift searches and their results
- **History Card**: A container showing details of a single past search (recipient, date, preferences, results)
- **Padding**: The internal spacing between content and container edges
- **Tab Header**: The title text displayed at the top of each main section/tab
- **Shop Name**: The retailer or merchant name displayed on gift items
- **Text Capitalization**: The formatting of text case (e.g., title case, sentence case)

## Requirements

### Requirement 1

**User Story:** As a user, I want the search history to have proper spacing, so that the content is easy to read and doesn't feel cramped.

#### Acceptance Criteria

1. WHEN a user views the search history page THEN the Search History System SHALL apply horizontal padding to the history card container
2. WHEN displaying history cards THEN the Search History System SHALL ensure consistent left and right padding that matches the application's design system
3. WHEN the history list is rendered THEN the Search History System SHALL prevent content from touching the screen edges
4. WHEN viewing on different screen sizes THEN the Search History System SHALL maintain appropriate padding proportional to the viewport

### Requirement 2

**User Story:** As a user, I want consistent header styling across all tabs, so that the interface feels cohesive and professional.

#### Acceptance Criteria

1. WHEN a user navigates between tabs (Search, Saved, History, Profile) THEN the Search History System SHALL display headers with consistent typography
2. WHEN displaying tab headers THEN the Search History System SHALL use the same font family, weight, and size across all sections
3. WHEN rendering headers THEN the Search History System SHALL apply consistent spacing above and below header text
4. WHEN a header is shown THEN the Search History System SHALL use the same text color and alignment across all tabs

### Requirement 3

**User Story:** As a user, I want shop names to be properly capitalized, so that they look professional and are easy to read.

#### Acceptance Criteria

1. WHEN displaying a gift item with a shop name THEN the Search History System SHALL capitalize the first letter of the shop name
2. WHEN a shop name contains multiple words THEN the Search History System SHALL apply title case capitalization (e.g., "Amazon Store" not "amazon store")
3. WHEN rendering shop names THEN the Search History System SHALL handle special cases like acronyms appropriately (e.g., "IKEA" remains "IKEA")
4. WHEN shop name data is received from the backend THEN the Search History System SHALL normalize the capitalization before display

### Requirement 4

**User Story:** As a user, I want the search history cards to display information clearly, so that I can quickly review past searches.

#### Acceptance Criteria

1. WHEN a history card is displayed THEN the Search History System SHALL show the recipient name, date, description, and gift previews
2. WHEN rendering gift previews THEN the Search History System SHALL display thumbnail images with consistent sizing
3. WHEN showing the budget THEN the Search History System SHALL display it with the appropriate currency symbol and formatting
4. WHEN displaying the occasion icon THEN the Search History System SHALL use consistent icon sizing and positioning
