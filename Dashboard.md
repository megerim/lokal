# Dashboard Design Analysis

## Overview

The dashboard at `http://localhost:3000/dashboard` is structured using a tab-based navigation system at the top of the main content area, below the user greeting. The content within at least the default "Genel Bakış" (Overview) tab is organized into distinct rectangular sections or cards, which is likely what the user refers to as the "square design".

## Tab Design

-   **Location**: Below the main header and user greeting message.
-   **Implementation**: A row of buttons acts as tabs:
    -   "Genel Bakış" (Overview)
    -   "Sosyal Gruplar" (Social Groups)
    -   "Aktiviteler" (Activities)
    -   "Mektuplarım" (My Letters)
    -   "Yönetim" (Management)
    -   "Ayarlar" (Settings)
-   **Functionality**: Clicking these buttons likely switches the content displayed below them, loading the relevant section for each tab. The currently active tab is highlighted.

## Square Design (Card/Section Layout within "Genel Bakış" Tab)

-   **Location**: Within the content area controlled by the tabs, specifically observed under the "Genel Bakış" tab.
-   **Structure**: The content is divided into several horizontal sections/cards stacked vertically:
    1.  **Yaklaşan Aktiviteler (Upcoming Activities)**: A card containing information about upcoming events the user is registered for. It includes a link/button to "Aktiviteleri Keşfet" (Discover Activities).
    2.  **Grup Aktiviteleri (Group Activities)**: A card showing recent activities from the user's groups, with a link/button to "Gruplara Katıl" (Join Groups).
    3.  **Son Mektuplarım (My Recent Letters)**: Displays recent letters written by the user, with a button "İlk Mektubunuzu Yazın" (Write Your First Letter).
    4.  **Kahve & Sadakat (Coffee & Loyalty)**: Shows active coupons and loyalty progress, including a progress bar and stats for "Toplam Katılım" (Total Participation) and "Kazanılan Kupon" (Coupons Earned).

-   **Styling**: Each of these sections appears as a distinct block or card, likely styled with borders, padding, and possibly a background color different from the main page background, giving them a defined rectangular ("square") shape. They are separated vertically from each other.

The combination of the top tab navigation and the card-based layout within the "Genel Bakış" tab defines the current dashboard design.
