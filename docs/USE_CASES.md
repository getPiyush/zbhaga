# zBhaga Application - Complete Use Cases

## Overview

zBhaga is a universal expense splitting application that enables groups to manage shared expenses fairly across iOS, Android, web, and desktop platforms. This document details all use cases and user scenarios.

---

## 1. Authentication Use Cases

### UC-AUTH-1: New User Registration
**Actor**: Prospective User  
**Goal**: Create a new account in the system  
**Precondition**: User is not registered  
**Main Flow**:
1. User navigates to app
2. Sees welcome screen with sign-up option
3. Clicks "Sign Up" button
4. Enters display name, email, password
5. Confirms password
6. Clicks "Create Account"
7. System validates input and creates account
8. User is automatically signed in
9. Redirected to groups list

**Alternative Flows**:
- Email already exists → Show error, suggest sign in
- Weak password → Show requirements and reject
- Network error → Show retry option

**Postcondition**: New account created, user authenticated

---

### UC-AUTH-2: User Sign In
**Actor**: Registered User  
**Goal**: Access the application with existing account  
**Precondition**: User has valid account  
**Main Flow**:
1. User navigates to app
2. Sees welcome screen
3. Clicks "Sign In"
4. Enters email and password
5. Clicks "Sign In" button
6. System validates credentials
7. JWT token generated
8. User session established
9. Redirected to groups list

**Alternative Flows**:
- Invalid credentials → Show error, allow retry
- Account locked → Show message, suggest password reset
- Network error → Allow offline mode or retry

**Postcondition**: User authenticated, session active

---

### UC-AUTH-3: OAuth Integration (Google/Microsoft/Okta)
**Actor**: User with OAuth Account  
**Goal**: Sign in using federated identity provider  
**Precondition**: OAuth provider configured  
**Main Flow**:
1. User clicks OAuth provider button (Google/Microsoft/Okta)
2. Redirected to provider's authentication page
3. User authenticates with provider
4. Provider redirects back to app with auth code
5. App exchanges code for tokens
6. User account created or linked
7. User authenticated and session established
8. Redirected to groups list

**Alternative Flows**:
- User cancels OAuth flow → Return to auth screen
- Account already linked → Use existing account
- First time with provider → Create new account

**Postcondition**: User authenticated via OAuth

---

### UC-AUTH-4: Session Persistence
**Actor**: Authenticated User  
**Goal**: Remain logged in across sessions  
**Precondition**: User has valid session  
**Main Flow**:
1. User closes and reopens app
2. App checks for valid refresh token
3. Refresh token present and valid
4. Requests new access token using refresh token
5. New session established
6. User remains logged in

**Alternative Flows**:
- Token expired → User redirected to sign in
- No refresh token → User redirected to sign in
- Invalid token → User redirected to sign in

**Postcondition**: User session maintained

---

### UC-AUTH-5: Sign Out
**Actor**: Authenticated User  
**Goal**: Securely end current session  
**Precondition**: User is logged in  
**Main Flow**:
1. User taps "Sign Out" button
2. System clears session tokens
3. System invalidates refresh token
4. Session terminated on server
5. User redirected to authentication screen
6. Local storage cleared

**Alternative Flows**:
- Network error during sign out → Clear local tokens and redirect
- Server error → Allow forced local sign out

**Postcondition**: User signed out, session terminated

---

## 2. Group Management Use Cases

### UC-GROUP-1: Create New Group
**Actor**: Authenticated User  
**Goal**: Create new expense-sharing group  
**Precondition**: User is authenticated  
**Main Flow**:
1. User navigates to groups page
2. Clicks "Create Group" button
3. Modal appears with form
4. Enters group name
5. Selects currency (default USD)
6. Clicks "Create"
7. System validates input
8. Group created in database
9. User added as owner
10. Invite code generated
11. Group appears in list

**Alternative Flows**:
- Empty name → Show validation error
- Name too long → Truncate or show error
- Duplicate name → Allow (names not unique)
- Network error → Show retry option

**Postcondition**: New group created, user is member

---

### UC-GROUP-2: Join Existing Group
**Actor**: Authenticated User  
**Goal**: Join an existing expense-sharing group  
**Precondition**: User has valid invite code  
**Main Flow**:
1. User clicks "Join Group" button
2. Modal appears with invite code field
3. User enters invite code (case-insensitive)
4. Clicks "Join"
5. System validates code
6. Checks if user already member
7. Adds user to group
8. Group appears in user's list

**Alternative Flows**:
- Invalid code → Show error "Code not found"
- Already a member → Show message, don't re-add
- Group is full → Show error (if limit exists)
- Expired code → Show error "Code expired"

**Postcondition**: User added to group as member

---

### UC-GROUP-3: View All Groups
**Actor**: Authenticated User  
**Goal**: See all groups user is member of  
**Precondition**: User is authenticated  
**Main Flow**:
1. User navigates to home/groups screen
2. System fetches user's groups
3. Groups displayed in list with:
   - Group name
   - Member count
   - Currency
4. User can scroll through list
5. Empty state shown if no groups

**Alternative Flows**:
- Network error → Show cached list or error message
- Loading → Show loading spinner
- No groups → Show helpful message to create/join

**Postcondition**: All user groups displayed

---

### UC-GROUP-4: View Group Details
**Actor**: Group Member  
**Goal**: See detailed information about group  
**Precondition**: User is member of group  
**Main Flow**:
1. User taps on group in list
2. System fetches group details
3. Group detail screen shows:
   - Group name
   - Member list
   - Quick stats (total expenses, etc.)
4. Three tabs shown: Expenses, Payments, Balances
5. User can switch between tabs

**Alternative Flows**:
- Network error → Show cached data or error
- Group not found → Show error, return to list
- Not a member → Show error, remove from list

**Postcondition**: Group details loaded and displayed

---

### UC-GROUP-5: Display & Share Invite Code
**Actor**: Group Member  
**Goal**: Share group invite code with others  
**Precondition**: User is member of group  
**Main Flow**:
1. User views group details
2. Clicks "Share" or "Invite Code" button
3. Modal shows group invite code
4. Code displayed in large, readable format
5. Copy button provided
6. Share button provided (via system share)
7. User can copy code and share manually
8. User can tap share to use system share

**Alternative Flows**:
- Code generation failed → Show retry option
- Share not supported → Show copy-only interface

**Postcondition**: Invite code shared with others

---

### UC-GROUP-6: View Group Members
**Actor**: Group Member  
**Goal**: See who else is in the group  
**Precondition**: User is member of group  
**Main Flow**:
1. User views group details
2. Clicks "Members" or views member list
3. System fetches member list
4. Display shows:
   - Member names
   - Member count
   - Current balance (if relevant)
5. Members listed alphabetically

**Alternative Flows**:
- Network error → Show cached members
- No members (shouldn't happen) → Show empty state

**Postcondition**: Member list displayed

---

## 3. Expense Management Use Cases

### UC-EXPENSE-1: Record New Expense
**Actor**: Group Member  
**Goal**: Add shared expense to group  
**Precondition**: User is member of group  
**Main Flow**:
1. User navigates to group
2. Clicks "Add Expense" button
3. Expense form opens with fields:
   - Description (e.g., "Dinner")
   - Amount (e.g., 45.50)
   - Currency (dropdown, defaults to group currency)
   - Paid by (selector, defaults to current user)
   - Split method (radio buttons):
     - Equal split (auto-divides equally)
     - Manual split (specific amounts per person)
   - Participants (multi-select)
4. User fills in details
5. For equal split: calculates amount per person
6. For manual split: user enters each person's amount
7. Total must equal expense amount
8. Clicks "Save"
9. Expense created and appears in timeline

**Alternative Flows**:
- Amount not valid → Show error
- Participants empty → Show error "Select at least 2 people"
- Manual split total doesn't match → Show error
- Network error → Show retry/save draft option

**Postcondition**: Expense recorded, participants' balances updated

---

### UC-EXPENSE-2: View Expense List
**Actor**: Group Member  
**Goal**: See all expenses in group  
**Precondition**: User is member of group  
**Main Flow**:
1. User navigates to group
2. Clicks "Expenses" tab
3. System fetches all expenses
4. Expenses displayed in reverse chronological order (newest first)
5. Each expense shows:
   - Description
   - Amount and currency
   - Paid by (user name)
   - Date/time
   - Number of participants
6. User can scroll to load more
7. Pull to refresh available

**Alternative Flows**:
- No expenses → Show "No expenses yet" message
- Network error → Show cached expenses or error
- Loading → Show loading indicator

**Postcondition**: Expense list displayed

---

### UC-EXPENSE-3: View Expense Details
**Actor**: Group Member  
**Goal**: See breakdown of expense split  
**Precondition**: Expense exists in group  
**Main Flow**:
1. User taps on expense in list
2. Expense detail screen opens showing:
   - Description
   - Total amount
   - Paid by (with name)
   - Date/time
   - Split details:
     - Each participant's amount owed
     - How much they paid (if applicable)
   - Split method used
3. Option to edit (if permissions allow)
4. Option to delete (if permissions allow)

**Alternative Flows**:
- Expense deleted before loading → Show error
- Permission denied → Hide edit/delete options
- Network error → Show cached data

**Postcondition**: Expense details displayed

---

### UC-EXPENSE-4: Filter Expenses
**Actor**: Group Member  
**Goal**: Find specific expenses  
**Precondition**: Multiple expenses exist  
**Main Flow**:
1. User views expense list
2. Clicks filter/search button
3. Filter options shown:
   - By person (who paid)
   - By date range
   - By amount range
   - By keyword (description)
4. User selects filters
5. Expense list updates to show matching items
6. Clear filters option available

**Alternative Flows**:
- No matches → Show "No expenses match filters"
- Multiple filters → Apply all simultaneously

**Postcondition**: Filtered expense list displayed

---

### UC-EXPENSE-5: Edit Expense (Future)
**Actor**: Expense Creator or Group Owner  
**Goal**: Modify existing expense details  
**Precondition**: Expense exists, user has permission  
**Main Flow**:
1. User taps expense
2. Clicks "Edit" button
3. Expense form opens with current values
4. User modifies fields
5. Clicks "Save"
6. Changes saved, balances recalculated
7. Notification shown to group

**Note**: This feature requires future implementation

---

## 4. Payment & Settlement Use Cases

### UC-PAYMENT-1: View Group Balances
**Actor**: Group Member  
**Goal**: See current financial position in group  
**Precondition**: Group has members and expenses  
**Main Flow**:
1. User navigates to group
2. Clicks "Balances" tab
3. System calculates balances
4. Display shows for each member:
   - Net balance (+ owed to them, - they owe)
   - Who they owe money to (person-to-person debts)
   - Who owes them money
5. Color coding:
   - Red for owed amounts
   - Green for credit amounts
   - Neutral for settled

**Alternative Flows**:
- No balances (all settled) → Show "All settled!" message
- Network error → Show cached balances
- Zero balance → Show 0.00

**Postcondition**: Current balances displayed

---

### UC-PAYMENT-2: View Detailed Debts
**Actor**: Group Member  
**Goal**: Understand exactly who owes whom  
**Precondition**: Balances exist  
**Main Flow**:
1. User views balance information
2. Clicks on a debt/credit entry
3. Details screen shows:
   - Person A owes Person B
   - Specific amount
   - Which expenses caused this debt
   - Suggested payment

**Alternative Flows**:
- Balanced (no debt) → Show "Settled" message
- Multiple debts between same people → Consolidated view

**Postcondition**: Detailed debt information shown

---

### UC-PAYMENT-3: Get Settlement Suggestions
**Actor**: Group Member  
**Goal**: Receive payment recommendations to settle debts  
**Precondition**: Unsettled balances exist  
**Main Flow**:
1. User views balances
2. Clicks "Settlement Suggestions"
3. System runs settlement algorithm:
   - Identifies all debts
   - Applies greedy algorithm
   - Minimizes number of payments
4. Displays suggested payments:
   - Person A pays Person B: $XX.XX
   - Person C pays Person D: $YY.YY
   - ... (sorted by optimal order)
5. Each suggestion has "Record Payment" button
6. Shows total payments needed

**Alternative Flows**:
- All balanced → Show "All settled!" message
- Single payment needed → Show single suggestion
- Complex debts → Show multiple suggestions

**Postcondition**: Settlement suggestions displayed

---

### UC-PAYMENT-4: Record Actual Payment
**Actor**: Group Member  
**Goal**: Log payment made between members  
**Precondition**: Group has members and balances  
**Main Flow**:
1. User navigates to group
2. Clicks "Record Payment" or uses suggestion
3. Payment form opens with fields:
   - Paid by (selector - who paid)
   - Paid to (selector - who received)
   - Amount (numeric input)
4. Form validates:
   - Cannot pay self
   - Amount must be positive
   - Both people must be group members
5. User confirms
6. Payment recorded in system
7. Balances immediately updated
8. Payment appears in Payment History

**Alternative Flows**:
- Invalid data → Show validation error
- Amount too large → Show warning (allow anyway)
- Network error → Show retry option
- Same person selected → Show "Cannot pay yourself"

**Postcondition**: Payment recorded, balances updated

---

### UC-PAYMENT-5: View Payment History
**Actor**: Group Member  
**Goal**: See record of all payments made  
**Precondition**: Payments have been recorded  
**Main Flow**:
1. User navigates to group
2. Clicks "Payments" tab
3. System fetches all payments
4. Payments displayed in reverse chronological order
5. Each payment shows:
   - From (paid by)
   - To (paid to)
   - Amount
   - Date/time
   - Optional note
6. User can scroll through history
7. Pull to refresh available

**Alternative Flows**:
- No payments → Show "No payments recorded"
- Network error → Show cached payments

**Postcondition**: Payment history displayed

---

### UC-PAYMENT-6: Record Suggested Payment
**Actor**: Group Member  
**Goal**: Quickly record payment from settlement suggestion  
**Precondition**: Settlement suggestions exist  
**Main Flow**:
1. User views settlement suggestions
2. Clicks "Record Payment" on suggestion
3. Payment form pre-filled with:
   - Paid by: person from suggestion
   - Paid to: person from suggestion
   - Amount: suggested amount
4. User reviews and confirms
5. Payment recorded
6. Suggestion removed from list

**Alternative Flows**:
- User modifies amount → Uses custom amount instead
- Network error during save → Show retry option

**Postcondition**: Suggested payment recorded

---

## 5. User Profile Use Cases

### UC-PROFILE-1: View User Profile
**Actor**: Authenticated User  
**Goal**: See personal profile information  
**Precondition**: User is logged in  
**Main Flow**:
1. User taps profile/account button
2. Profile screen shows:
   - Display name
   - Email address
   - Avatar/initial (if available)
   - Sign Out button
3. Optionally shows:
   - Total groups joined
   - Total expenses tracked
   - Total balance across groups

**Alternative Flows**:
- No profile data → Show basic info only
- Network error → Show cached profile

**Postcondition**: Profile information displayed

---

### UC-PROFILE-2: Sign Out from Profile
**Actor**: Authenticated User  
**Goal**: End session and return to login  
**Precondition**: User is on profile screen  
**Main Flow**:
1. User taps "Sign Out" button
2. Confirmation dialog shown (optional)
3. User confirms
4. Session terminated
5. Tokens cleared
6. Redirected to authentication screen

**Alternative Flows**:
- User cancels confirmation → Return to profile
- Network error → Allow forced local sign out

**Postcondition**: User logged out

---

## 6. Advanced Use Cases

### UC-ADV-1: Offline Mode (Future)
**Actor**: User with no network  
**Goal**: Continue using app offline  
**Precondition**: App has been used online before  
**Main Flow**:
1. Network connection lost
2. App continues displaying cached data
3. Actions queued locally:
   - New expenses
   - Payments recorded
4. Notification shown: "Offline Mode"
5. Network restored
6. Queued actions synced
7. Notification: "Synced"

**Note**: Future enhancement

---

### UC-ADV-2: Dark Mode Toggle
**Actor**: User with preference  
**Goal**: Switch between light and dark themes  
**Precondition**: User is authenticated  
**Main Flow**:
1. User accesses settings
2. Finds theme toggle
3. Switches theme
4. App immediately updates to dark mode
5. Preference saved
6. Persists across sessions

**Note**: Already implemented

---

### UC-ADV-3: Multiple Device Sync (Future)
**Actor**: User with multiple devices  
**Goal**: Keep data synchronized  
**Precondition**: User logged in on multiple devices  
**Main Flow**:
1. User adds expense on Device A
2. User opens app on Device B
3. Data automatically synced
4. Expense appears on Device B
5. Balances reflect latest state

**Note**: Future enhancement

---

### UC-ADV-4: Group Permissions (Future)
**Actor**: Group Owner/Admin  
**Goal**: Manage who can do what  
**Precondition**: User is group owner  
**Main Flow**:
1. User opens group settings
2. Manages member permissions:
   - View expenses (all members)
   - Add expenses (members or admin only)
   - Record payments (members or admin only)
   - Remove members (admin only)
   - Change settings (admin only)
3. Changes applied immediately

**Note**: Future enhancement

---

### UC-ADV-5: Notifications (Future)
**Actor**: Any group member  
**Goal**: Receive updates about group activity  
**Precondition**: User has notification permission  
**Main Flow**:
1. Another member adds expense
2. Notification sent: "Alice added $50 expense"
3. Another member records payment
4. Notification sent: "Bob paid Alice $25"
5. User's balance changes significantly
6. Notification sent: "Your balance updated"

**Note**: Future enhancement

---

## 7. Error & Edge Cases

### UC-ERROR-1: Network Error Recovery
**Actor**: Any User  
**Goal**: Recover gracefully from network failures  
**Main Scenarios**:
- Timeout on API call → Show error, offer retry
- 401 Unauthorized → Redirect to login, refresh token
- 403 Forbidden → Show error, not permitted
- 500 Server Error → Show error, try again later
- No internet → Use cached data, queue actions

---

### UC-ERROR-2: Data Validation
**Actor**: Any User  
**Goal**: Prevent invalid data entry  
**Main Scenarios**:
- Negative amount → Reject
- Missing required field → Show error
- Invalid email → Reject
- Empty name → Reject
- Amount precision > 2 decimals → Round

---

### UC-ERROR-3: Concurrent Modifications (Future)
**Actor**: Multiple group members  
**Goal**: Handle simultaneous edits  
**Main Scenarios**:
- User A and B both add expense simultaneously → Both succeed
- User A deletes expense while B views it → Show error, refresh
- Balances calculated while transaction in progress → Use atomic operations

---

## Use Case Matrix

| Use Case | Actor | Complexity | Status |
|----------|-------|-----------|--------|
| UC-AUTH-1 | Prospective User | Medium | ✅ Complete |
| UC-AUTH-2 | Registered User | Medium | ✅ Complete |
| UC-AUTH-3 | OAuth User | High | ✅ Ready |
| UC-AUTH-4 | Authenticated User | Low | ✅ Complete |
| UC-AUTH-5 | Authenticated User | Low | ✅ Complete |
| UC-GROUP-1 | Group Member | Medium | ✅ Complete |
| UC-GROUP-2 | New Member | Low | ✅ Complete |
| UC-GROUP-3 | Group Member | Low | ✅ Complete |
| UC-GROUP-4 | Group Member | Medium | ✅ Complete |
| UC-GROUP-5 | Group Member | Low | ✅ Complete |
| UC-GROUP-6 | Group Member | Low | ✅ Complete |
| UC-EXPENSE-1 | Group Member | High | ✅ Complete |
| UC-EXPENSE-2 | Group Member | Low | ✅ Complete |
| UC-EXPENSE-3 | Group Member | Medium | ✅ Complete |
| UC-EXPENSE-4 | Group Member | Medium | 🔄 Partial |
| UC-EXPENSE-5 | Group Member | High | 📋 Future |
| UC-PAYMENT-1 | Group Member | Medium | ✅ Complete |
| UC-PAYMENT-2 | Group Member | Low | ✅ Complete |
| UC-PAYMENT-3 | Group Member | High | ✅ Complete |
| UC-PAYMENT-4 | Group Member | Medium | ✅ Complete |
| UC-PAYMENT-5 | Group Member | Low | ✅ Complete |
| UC-PAYMENT-6 | Group Member | Low | ✅ Complete |
| UC-PROFILE-1 | Authenticated User | Low | ✅ Complete |
| UC-PROFILE-2 | Authenticated User | Low | ✅ Complete |

---

## Summary

**Total Use Cases**: 24  
**✅ Complete**: 22  
**🔄 Partial**: 1  
**📋 Future**: 1  

All core use cases for the MVP are complete and tested with Playwright.
