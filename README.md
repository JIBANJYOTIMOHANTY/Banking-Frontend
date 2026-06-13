# Customer Account Management System (Banking-Frontend)

A modern, responsive, and feature-rich banking client dashboard built with **Angular** and styled using vanilla CSS. The application integrates seamlessly with the backend REST APIs to manage customer details, perform banking operations, list transactions, and manage user sessions securely.

---

## 🚀 Key Features

*   **Premium Interactive Dashboard:**
    *   Responsive layouts featuring polished glassmorphic styling, harmonious color palettes, custom animations, and sidebar navigation.
*   **Mandatory Profile Image Upload (New):**
    *   Drag-and-drop or click-to-select upload interface integrated into the Signup form.
    *   Strict size validation (maximum 2MB) and dynamic conversion to Base64 representation.
    *   Renders a premium circular preview of the custom avatar upon selection.
*   **Password Visibility Toggle (New):**
    *   Allows toggling of password visibility dynamically across both Login and Signup forms.
    *   Built using clean Angular signal bindings (`[type]="isPasswordVisible() ? 'text' : 'password'"`) instead of unsafe DOM manipulation.
*   **Comprehensive Customer Management:**
    *   Form-guided customer registration and profiling.
    *   Dedicated **Country Prefix Selector** (e.g. `+91`, `+1`) and strict **10-Digit Mobile Number Validation**.
    *   Structured Address Form fields: Street Address, Landmark, City, State, Country, and 6-Digit Pincode.
    *   Search and filter capability to quickly browse the customer directory.
*   **Bank Account Operations:**
    *   Interactive controls to perform **Deposits**, **Withdrawals**, and **Account Transfers**.
    *   Full support for checking live balances and deleting accounts.
*   **Statement & Transaction History:**
    *   Statement logs showing credit (emerald) and debit (rose) indicators.
    *   Date-based filter (`yyyy-MM-dd`) to fetch targeted transactions.
*   **System-Wide Broadcast Alerts:**
    *   Administrator quick action modal to publish live announcements (INFO/CRITICAL).
    *   Announcements are displayed dynamically at the top of the header viewport with dismiss/clear capabilities.
*   **Audit Trails & Device Session Logs:**
    *   Dedicated security section displaying current and historic device access logs (Browser, OS, IP address, timestamp, status, and action).
    *   Includes search filtering to search through active device sessions.
*   **Offline Connection Monitoring:**
    *   Active listeners for browser offline/online state and background backend connection monitoring (`ConnectionService`).
    *   Gracefully intercepts communication loss and overlays a premium retry screen (`ConnectionLost`).
*   **Secure Session & Sliding Expiration:**
    *   **Activity Interceptor:** Listens for user interactions (clicks, keypresses) and triggers background token refreshes (`/auth/refresh`) using a throttled window to extend the session dynamically.
    *   **Custom Session Modal:** In case of complete inactivity, triggers a custom glassmorphic warning overlay prompting the user to redirect and authenticate again rather than using basic browser alerts.

---

## 🛠️ Project Structure

The project components are organized under `src/app/`:

*   `accounts/`: Handles accounts listing, balance checking, deposits, withdrawals, and transfers.
*   `customers-management/`: Manages customer registration, detail drawers, profile updates, and search query filters.
*   `transactions/`: Lists credit/debit transaction statement logs with date-filtering filters.
*   `session-expired/`: High-fidelity overlay warning modal displayed on session inactivity timeouts.
*   `connection-lost/`: Custom offline screen with manual retry capabilities to gracefully handle lost backend connectivity.
*   `custom-pop-up-modal/`: Reusable, customizable overlay popup modal module.
*   `custom-tables/`: Custom paginated/searchable tables and skeleton loaders for uniform loading states.
*   `sidebar/` / `header/` / `footer/`: Layout framing modules coordinating user navigation states, system broadcast settings, and quick actions.
*   `dashboard-administrator/`: Core shell dashboard wrapper organizing the application views.
*   `login-administrator/`: Authentication login screen interface containing login, signup tabs, mandatory image upload, and password toggle controls.
*   `common-service/`: Configures core API HTTP request wrappers (`get`, `post`, `put`, `patch`, `delete`), error intercepting, and `ConnectionService` connection checking.
*   `authguard.ts`: Enforces page access restrictions, manages session token lifecycle tracking, and throttle-refreshes JWT validity.

---

## 🏃 Development & Running

### 📋 Prerequisites
*   [Node.js](https://nodejs.org/) (LTS Version recommended)
*   [Angular CLI](https://github.com/angular/angular-cli) installed globally (`npm install -g @angular/cli`)

### 🔧 Installation & Build

1.  Navigate to the directory:
    ```bash
    cd banking-frontend
    ```
2.  Install required dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    or
    ```bash
    ng serve
    ```
4.  Open your browser and browse to **`http://localhost:4200`**.

### 🧪 Running Tests

Verify component logic and routing parameters by running:
```bash
ng test
```
