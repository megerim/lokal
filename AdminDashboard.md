# Admin Dashboard Design Analysis

## Overview

The admin dashboard at `http://localhost:3000/admin` serves as the central hub for managing the platform's content. It features a tabbed interface similar to the user dashboard but focused on management tasks.

## Tab Design

-   **Location**: Below the main header "Admin Paneli".
-   **Implementation**: Standard Shadcn UI tabs with a list of triggers:
    -   "Duyurular" (Announcements/Events)
    -   "Sosyal Gruplar" (Social Groups)
    -   "Ürünler" (Products)
    -   "Kuponlar" (Coupons)
-   **Functionality**: Switches between different management views.

## Content Design (Card/Section Layout)

-   **Duyurular (Announcements)**:
    -   Displays a grid of cards representing events/announcements.
    -   Each card contains:
        -   Image (if available)
        -   Title and Description
        -   Date/Time info
        -   Participant count
        -   Action buttons: "Katılımcılar", Edit (Pencil icon), Delete (Trash icon).
    -   The cards have a standard border and square-ish corners.

-   **Sosyal Gruplar (Social Groups)**:
    -   Likely displays a list or grid of social groups with management options.

-   **Ürünler (Products)**:
    -   Likely displays a grid of products.

## Design Issues (to be addressed)

-   **Tabs**: Standard, boxy design. Needs to be updated to the pill-shaped, floating design used in the new user dashboard.
-   **Cards**: Standard bordered cards. Needs to be updated to the softer, shadow-based design with hover effects.
-   **Animations**: Lack of smooth transitions between tabs and on page load.
