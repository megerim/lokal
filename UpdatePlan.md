# Update Plan - Lokal Project

This plan outlines the necessary changes to the codebase to meet the requirements specified in `updates.md`.

## 1. Admin Panel Updates
**Goal:** Remove dark mode color switching in the admin panel.

*   **Analysis:** The `AdminDashboard` component uses `dark:` classes, but the global `ThemeProvider` seems missing or not wrapping the root layout. However, the user reports color switching behavior.
*   **Action:**
    *   Locate the theme toggler (likely in `Header` or `AdminDashboard`) and remove it from the Admin interface.
    *   Force "Light Mode" for the Admin Panel by wrapping `AdminDashboard` or `app/admin/page.tsx` in a `ThemeProvider` with `forcedTheme="light"` (if `next-themes` is used) or by removing `dark:` classes from `components/admin/admin-dashboard.tsx` and related admin components to ensure consistent styling.

## 2. Social Groups Updates
**Goal:** Enforce admin approval for joining and improve navigation.

*   **Requirement 1:** User cannot join a group directly; admin approval is required.
    *   **Current State:** `MembershipRequestDialog` exists and inserts into `membership_requests`.
    *   **Action:** Verify that `SocialGroupPage` only renders `MembershipRequestDialog` and does not offer a direct "Join" button. Ensure the backend/database policies enforce this.
*   **Requirement 2:** Redirect to group page when user clicks "view details" after joining.
    *   **Action:** Update the "My Groups" section (likely in User Dashboard or similar) to link the "View Details" button to `/sosyal-gruplar/[id]`.

## 3. Experiences (Deneyimler) Page
**Goal:** Restrict access to "Experiences" to logged-in members only.

*   **Analysis:** "Deneyimler" is a category in the Menu (`app/menu/page.tsx`).
*   **Action:**
    *   Modify `app/menu/page.tsx`.
    *   Check if the user is logged in.
    *   If NOT logged in:
        *   Hide the "experiences" category from the sidebar/filter list.
        *   Filter out items with `category === 'experiences'` from the grid.
        *   Alternatively, show the category but prompt for login when clicked. (Plan: Hide/Filter based on "sadece üye girişi yapana görünecek").

## 4. Activities (Etkinlikler) Updates
**Goal:** Change "Join" to "Request Participation" with payment flow.

*   **Analysis:** Currently `ActivityBrowser` allows direct joining via `activity_attendance`.
*   **Action:**
    *   **Database:** Create a new table `activity_requests` (or update `activity_attendance` with status: `pending_payment`, `payment_verified`, `approved`).
    *   **UI (`ActivityCard` / `ActivityDetailModal`):**
        *   Replace "Katıl" (Join) button with "Katılma Talebi" (Request Participation).
        *   **Flow:**
            1.  User clicks "Request Participation".
            2.  Show Modal/Dialog with Bank Account Details (IBAN + Name).
            3.  User makes payment (offline).
            4.  User clicks "Ödeme Yaptım" (I made payment).
            5.  System records the request.
    *   **Resume Flow:**
        *   If user closes the site, they should be able to continue from where they left off via email link or User Dashboard.
        *   Implement a "Pending Payments" section in User Dashboard.
        *   Send email upon request with Bank Details and a link to "Complete Payment" (which logs them in and opens the modal).

## 5. Christmas Market (Yılbaşı Pazarı)
**Goal:** Create a new landing page and application flow for the Christmas Market.

*   **Index Hero Section:**
    *   Modify `components/landing-hero.tsx`.
    *   Update background/images to Christmas theme.
    *   Add decoration SVGs.
    *   Replace buttons with a single "YILBAŞI PAZARI" button linking to `/yilbasi-pazari`.
*   **New Page (`app/yilbasi-pazari/page.tsx`):**
    *   **SEO:** Add specified keywords and description.
    *   **Content:** Implement the provided texts and sections (Intro, Features, Categories).
    *   **Application Button:**
        *   Visible to all.
        *   If not logged in -> Redirect to Login (with return URL).
        *   If logged in -> Open Application Form.
*   **Application Form (`components/christmas-market-form.tsx`):**
    *   **Fields:**
        *   Instagram Link.
        *   Participation Days (28 Dec, 29 Dec - Checkbox).
        *   Logo Upload (Image upload).
    *   **Info:** Display "Promises to sellers" list.
    *   **Submission:**
        *   Save to database (new table `market_applications`).
        *   Status: `pending`.
    *   **Post-Submission:**
        *   Admin approves -> Status becomes `approved_waiting_payment`.
        *   User sees Bank Info for 1800₺ payment.
        *   User confirms payment -> Status `payment_submitted`.
        *   Admin verifies -> Status `completed`.

## 6. General Payment
*   **Action:** Ensure all payment related texts specify "Banka Havalesi/EFT" and "IBAN". Remove any references to Credit Card/POS if existing.

## Implementation Steps
1.  **Setup:** Create necessary database tables (`activity_requests`, `market_applications`).
2.  **Admin:** Fix dark mode.
3.  **Menu:** Implement access control for Experiences.
4.  **Activities:** Implement Request & Payment flow.
5.  **Christmas Market:** Build Hero, Page, and Form.
6.  **Groups:** Verify/Fix join flow.
