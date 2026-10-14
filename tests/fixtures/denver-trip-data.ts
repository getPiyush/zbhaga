/**
 * Denver Trip Test Data
 * Contains all constants and data structures for the Denver trip scenario
 */

export const DENVER_TRIP_USERS = [
  {
    displayName: 'Alice',
    email: 'alice.denver@test.com',
    password: 'TestPass123!',
    role: 'organizer',
  },
  {
    displayName: 'Bob',
    email: 'bob.denver@test.com',
    password: 'TestPass123!',
    role: 'member',
  },
  {
    displayName: 'Charlie',
    email: 'charlie.denver@test.com',
    password: 'TestPass123!',
    role: 'member',
  },
  {
    displayName: 'Diana',
    email: 'diana.denver@test.com',
    password: 'TestPass123!',
    role: 'member',
  },
  {
    displayName: 'Eve',
    email: 'eve.denver@test.com',
    password: 'TestPass123!',
    role: 'member',
  },
];

export const SOLO_TRIP_USER = {
  displayName: 'Frank',
  email: 'frank.denver@test.com',
  password: 'TestPass456!',
};

export const DENVER_TRIP_GROUP = {
  name: 'Denver Trip 2026',
  description: 'Expense splitting for Denver trip',
};

export const SOLO_TRIP_GROUP = {
  name: 'Solo Trip',
  description: 'Solo trip expense tracking',
};

/**
 * Expenses for the Denver trip
 * Organized by user and day
 */
export const DENVER_TRIP_EXPENSES = [
  // Alice's expenses - Days 1-2
  {
    user: 'Alice',
    description: 'Day 1 - Hotel',
    amount: 300,
    date: '2026-10-15',
    category: 'accommodation',
  },
  {
    user: 'Alice',
    description: 'Day 1 - Breakfast',
    amount: 45,
    date: '2026-10-15',
    category: 'food',
  },

  // Bob's expenses - Day 2
  {
    user: 'Bob',
    description: 'Day 2 - Car Rental',
    amount: 450,
    date: '2026-10-16',
    category: 'transport',
  },
  {
    user: 'Bob',
    description: 'Day 2 - Lunch',
    amount: 60,
    date: '2026-10-16',
    category: 'food',
  },

  // Charlie's expenses - Days 3-5
  {
    user: 'Charlie',
    description: 'Day 3 - Dinner',
    amount: 150,
    date: '2026-10-17',
    category: 'food',
  },
  {
    user: 'Charlie',
    description: 'Day 3 - Parking',
    amount: 25,
    date: '2026-10-17',
    category: 'transport',
  },
  {
    user: 'Charlie',
    description: 'Day 4 - Attractions',
    amount: 200,
    date: '2026-10-18',
    category: 'entertainment',
  },
  {
    user: 'Charlie',
    description: 'Day 4 - Dinner',
    amount: 120,
    date: '2026-10-18',
    category: 'food',
  },
  {
    user: 'Charlie',
    description: 'Day 5 - Checkout',
    amount: 100,
    date: '2026-10-19',
    category: 'misc',
  },
];

/**
 * Total expense summary
 */
export const DENVER_TRIP_EXPENSE_SUMMARY = {
  totalExpenses: 9,
  totalAmount: 1450, // $14.50 in cents would be 1450
  byUser: {
    Alice: { count: 2, total: 345 },
    Bob: { count: 2, total: 510 },
    Charlie: { count: 5, total: 595 },
  },
  byCategory: {
    accommodation: 300,
    food: 375,
    transport: 475,
    entertainment: 200,
    misc: 100,
  },
};

/**
 * Payments for settling debts
 */
export const DENVER_TRIP_PAYMENTS = [
  {
    paidBy: 'Bob',
    paidTo: 'Alice',
    amount: 200,
    date: '2026-10-19',
  },
  {
    paidBy: 'Charlie',
    paidTo: 'Bob',
    amount: 150,
    date: '2026-10-19',
  },
  {
    paidBy: 'Diana',
    paidTo: 'Charlie',
    amount: 100,
    date: '2026-10-19',
  },
  {
    paidBy: 'Eve',
    paidTo: 'Diana',
    amount: 50,
    date: '2026-10-19',
  },
  {
    paidBy: 'Alice',
    paidTo: 'Eve',
    amount: 75,
    date: '2026-10-19',
  },
];

export const DENVER_TRIP_PAYMENT_SUMMARY = {
  totalPayments: 5,
  totalAmount: 575,
  settlement: {
    // Map of who owes whom
    'Bob->Alice': 200,
    'Charlie->Bob': 150,
    'Diana->Charlie': 100,
    'Eve->Diana': 50,
    'Alice->Eve': 75,
  },
};

/**
 * Solo trip expenses
 */
export const SOLO_TRIP_EXPENSES = [
  {
    user: 'Frank',
    description: 'Hotel',
    amount: 250,
    date: '2026-10-15',
  },
  {
    user: 'Frank',
    description: 'Meals',
    amount: 100,
    date: '2026-10-15',
  },
];

export const SOLO_TRIP_SUMMARY = {
  totalExpenses: 2,
  totalAmount: 350,
};

/**
 * Test configuration
 */
export const TEST_CONFIG = {
  // Timeouts in milliseconds
  timeouts: {
    short: 5000, // 5 seconds
    medium: 10000, // 10 seconds
    long: 30000, // 30 seconds
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
  },

  // Screenshot configuration
  screenshots: {
    enabled: true,
    directory: './test-screenshots/denver-trip',
    fullPage: true,
  },

  // Report configuration
  reports: {
    html: './cucumber-report.html',
    json: './cucumber-report.json',
    xml: './cucumber-report.xml',
  },

  // API configuration
  api: {
    baseUrl: 'http://localhost:4000',
    version: 'v1',
  },

  // App configuration
  app: {
    baseUrl: 'http://localhost:8081',
    loginUrl: 'http://localhost:8081/auth/signin',
    homeUrl: 'http://localhost:8081/(home)',
  },
};

/**
 * DOM selectors used in tests
 */
export const DOM_SELECTORS = {
  // Auth
  emailInput: '[data-testid="email-input"]',
  passwordInput: '[data-testid="password-input"]',
  signinButton: '[data-testid="signin-button"]',
  signupButton: '[data-testid="signup-button"]',
  displayNameInput: '[data-testid="display-name-input"]',

  // Navigation
  createGroupButton: '[data-testid="create-group-button"]',
  joinGroupButton: '[data-testid="join-group-button"]',
  groupNameDisplay: '[data-testid="group-name"]',

  // Group creation
  groupNameInput: '[data-testid="group-name-input"]',
  createGroupSubmit: '[data-testid="create-group-submit"]',
  groupInviteButton: '[data-testid="group-invite-button"]',
  inviteCode: '[data-testid="invite-code"]',
  inviteCodeInput: '[data-testid="invite-code-input"]',
  joinGroupSubmit: '[data-testid="join-group-submit"]',

  // Expenses
  addExpenseButton: '[data-testid="add-expense-button"]',
  expenseDescription: '[data-testid="expense-description"]',
  expenseAmount: '[data-testid="expense-amount"]',
  expenseDate: '[data-testid="expense-date"]',
  expenseSubmit: '[data-testid="expense-submit"]',
  expensesTab: '[data-testid="expenses-tab"]',
  expenseItem: '[data-testid="expense-item"]',
  expensesList: '[data-testid="expenses-list"]',

  // Payments
  paymentsTab: '[data-testid="payments-tab"]',
  recordPaymentButton: '[data-testid="record-payment-button"]',
  paidBySelect: '[data-testid="paid-by-select"]',
  paidToSelect: '[data-testid="paid-to-select"]',
  paymentAmount: '[data-testid="payment-amount"]',
  paymentSubmit: '[data-testid="payment-submit"]',
  paymentItem: '[data-testid="payment-item"]',
  paymentsList: '[data-testid="payments-list"]',

  // Balances
  balancesTab: '[data-testid="balances-tab"]',
  balancesList: '[data-testid="balances-list"]',
  balanceItem: '[data-testid="balance-item"]',

  // Group navigation
  groupsList: '[data-testid="groups-list"]',
  groupItem: '[data-testid="group-item"]',
  userProfile: '[data-testid="user-profile"]',
  signoutButton: '[data-testid="signout-button"]',
};

/**
 * Helper to get group selector by name
 */
export function getGroupSelector(groupName: string): string {
  const normalized = groupName.toLowerCase().replace(/\s/g, '-');
  return `[data-testid="group-${normalized}"]`;
}

/**
 * Helper to get user option selector
 */
export function getUserOptionSelector(userName: string): string {
  const normalized = userName.toLowerCase();
  return `[data-testid="user-option-${normalized}"]`;
}

/**
 * Expected error messages
 */
export const ERROR_MESSAGES = {
  userNotFound: 'User not found',
  groupNotFound: 'Group not found',
  invalidCredentials: 'Invalid email or password',
  duplicateEmail: 'Email already in use',
  invalidInviteCode: 'Invalid invite code',
  expenseNotAdded: 'Failed to add expense',
  paymentNotRecorded: 'Failed to record payment',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  signupSuccess: 'Account created successfully',
  signinSuccess: 'Signed in successfully',
  groupCreated: 'Group created successfully',
  groupJoined: 'Joined group successfully',
  expenseAdded: 'Expense added',
  paymentRecorded: 'Payment recorded',
};

/**
 * Generate test user credentials
 */
export function generateUserCredentials(
  displayName: string,
  baseEmail: string,
  basePassword: string
) {
  return {
    displayName,
    email: baseEmail,
    password: basePassword,
  };
}

/**
 * Get expense by description
 */
export function getExpenseByDescription(description: string) {
  return DENVER_TRIP_EXPENSES.find((e) => e.description === description);
}

/**
 * Get payment by participants
 */
export function getPaymentByParticipants(
  paidBy: string,
  paidTo: string
) {
  return DENVER_TRIP_PAYMENTS.find(
    (p) => p.paidBy === paidBy && p.paidTo === paidTo
  );
}

/**
 * Calculate total spent by user
 */
export function getTotalSpentByUser(userName: string): number {
  return DENVER_TRIP_EXPENSES
    .filter((e) => e.user === userName)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Calculate balance for user (what they're owed minus what they owe)
 */
export function calculateUserBalance(userName: string): number {
  const spent = getTotalSpentByUser(userName);
  const paid = DENVER_TRIP_PAYMENTS
    .filter((p) => p.paidTo === userName)
    .reduce((sum, p) => sum + p.amount, 0);
  const received = DENVER_TRIP_PAYMENTS
    .filter((p) => p.paidBy === userName)
    .reduce((sum, p) => sum + p.amount, 0);

  // Balance = (spent + received) - paid
  return spent + received - paid;
}
