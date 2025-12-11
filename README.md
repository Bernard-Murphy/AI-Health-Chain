# AI Health Chains Assessment (Lead MERN Stack Developer Position)

## Scripts Reference

| Command                        | Description                                |
| ------------------------------ | ------------------------------------------ |
| `npm start`                    | Start development server                   |
| `npm run build`                | Create production build                    |
| `npm test`                     | Run tests in watch mode                    |
| `npm test -- --watchAll=false` | Run tests once                             |
| `npm test -- --coverage`       | Run tests with coverage report             |
| `npm run eject`                | Eject from Create React App (irreversible) |

## Summary

### PatientList

- Implements `fetchPatients` function to load patients as instructed
- Search functionality in place; Every keypress will trigger fetchPatients() and update state with filtered list
- Patients listed as cards as instructed, with icons and brief summaries
- When card is clicked, patient details are displayed as instructed

### PatientDetail

- Displays patient information (name, email, DOB, gender, phone, address, wallet) as instructed
- Fetches and displays patient's medical records as instructed inside card with formatted dates and icons, highlighting relevant information
- Different record types have different badges, blockchain hash displayed with functionality to copy-to-clipboard when clicked

### ConsentManagement

- Implements `fetchConsents` function to load consents
- User can toggle between "All", "Active", and "Pending" to filter consents, which are listed as cards, consistent with the styling in the rest of the app
- IF MetaMask is connected, user can click the "Create New Consent" button in the top right to expand a form with patient ID + purpose to sign and create a new consent
- User will be prompted with their MetaMask extension to sign the consent in the format `"I consent to: {purpose} for patient: {patientId}"`, as instructed
- Pending consents can be approved or revoked, and any time any changes are made, fetchConsents() will run and refresh the list

### TransactionHistory

- Implements `getTransactions` to load transactions
- By default, only transactions associated with user's MetaMask-connected wallet are listed IF user's MetaMask extension is connected. This can be toggled with a button in the top right (My Transactions/All Transactions)
- If user is not logged in, or All Transactions is selected, all transactions will be listed as cards, similar in style to the cards in the rest of the app

## StatsDashboard

- Implements `getStats` function to fetch statistics
- Displays Total Patients, Total Records, Total Consents, Active Consents, Pending Consents, Total Transactions, in grid layout, as instruction

## Misc Components and Frameworks

### AnimatedButton

- Contains spring effect to make the button look like it was physically pressed when clicked.
- Contains ripple effect to show where button was clicked, consistent with Mui and many other front-end frameworks

### CopyableAddress

- Displays a crypto address/hash, truncated where necessary
- Includes functionality for the user to click on the component, which will copy the address to the clipboard
- Contains a spring effect similar to the AnimatedButton component, though no ripple effect

## Running Tests

### Run All Tests

- Tests are written in jest

```bash
npm test
```

This launches the test runner in interactive watch mode.

### Run Tests Once (CI Mode)

```bash
npm test -- --watchAll=false
```

### Run Tests with Coverage

```bash
npm test -- --watchAll=false --coverage
```

### Run Specific Test File

```bash
npm test -- apiService.test.js
```

### Test Coverage

The test suite includes 31 tests covering:

- **Fetching patients** - Pagination, search, error handling
- **Fetching consents** - Filtering by status and patient ID
- **Updating consents** - Status changes, blockchain hash updates
- **Fetching transactions** - Wallet filtering, pagination
- **Fetching statistics** - Platform metrics
