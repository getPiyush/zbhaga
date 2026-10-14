Feature: Denver Trip Expense Splitting
  As a group of travelers
  I want to track and split expenses fairly during our Denver trip
  So that we can settle debts accurately at the end

  Background:
    Given the app is running at "http://localhost:8081"
    And the API is available at "http://localhost:4000"

  Scenario: Complete Denver trip expense tracking workflow
    # Phase 1: User Signup
    Given I sign up the following users one by one:
      | displayName | email                   | password     |
      | Alice       | alice.denver@test.com   | TestPass123! |
      | Bob         | bob.denver@test.com     | TestPass123! |
      | Charlie     | charlie.denver@test.com | TestPass123! |
      | Diana       | diana.denver@test.com   | TestPass123! |
      | Eve         | eve.denver@test.com     | TestPass123! |

    # Phase 2: Create group and get invite code
    When "Alice" logs in with email "alice.denver@test.com" and password "TestPass123!"
    And "Alice" creates a new group named "Denver Trip 2026"
    And "Alice" views the group invite code
    Then the invite code should be displayed

    # Phase 3: Other users join group
    When "Bob" logs in with email "bob.denver@test.com" and password "TestPass123!"
    And "Bob" joins the group using the invite code
    Then "Bob" should be in the Denver Trip group

    When "Charlie" logs in with email "charlie.denver@test.com" and password "TestPass123!"
    And "Charlie" joins the group using the invite code
    Then "Charlie" should be in the Denver Trip group

    When "Diana" logs in with email "diana.denver@test.com" and password "TestPass123!"
    And "Diana" joins the group using the invite code
    Then "Diana" should be in the Denver Trip group

    When "Eve" logs in with email "eve.denver@test.com" and password "TestPass123!"
    And "Eve" joins the group using the invite code
    Then "Eve" should be in the Denver Trip group

    # Phase 4: Add expenses over 5 days (first 3 users)
    When "Alice" logs in with email "alice.denver@test.com" and password "TestPass123!"
    And "Alice" adds an expense to "Denver Trip 2026" group:
      | description       | amount | date       |
      | Day 1 - Hotel     | 300    | 2026-10-15 |
      | Day 1 - Breakfast | 45     | 2026-10-15 |

    When "Bob" logs in with email "bob.denver@test.com" and password "TestPass123!"
    And "Bob" adds an expense to "Denver Trip 2026" group:
      | description        | amount | date       |
      | Day 2 - Car Rental | 450    | 2026-10-16 |
      | Day 2 - Lunch      | 60     | 2026-10-16 |

    When "Charlie" logs in with email "charlie.denver@test.com" and password "TestPass123!"
    And "Charlie" adds an expense to "Denver Trip 2026" group:
      | description         | amount | date       |
      | Day 3 - Dinner      | 150    | 2026-10-17 |
      | Day 3 - Parking     | 25     | 2026-10-17 |
      | Day 4 - Attractions | 200    | 2026-10-18 |
      | Day 4 - Dinner      | 120    | 2026-10-18 |
      | Day 5 - Checkout    | 100    | 2026-10-19 |

    # Phase 5: Record payments randomly by all users
    When "Alice" logs in with email "alice.denver@test.com" and password "TestPass123!"
    And "Alice" records a payment in "Denver Trip 2026" group:
      | paidBy | paidTo | amount |
      | Bob    | Alice  | 200    |

    When "Bob" logs in with email "bob.denver@test.com" and password "TestPass123!"
    And "Bob" records a payment in "Denver Trip 2026" group:
      | paidBy  | paidTo | amount |
      | Charlie | Bob    | 150    |

    When "Charlie" logs in with email "charlie.denver@test.com" and password "TestPass123!"
    And "Charlie" records a payment in "Denver Trip 2026" group:
      | paidBy | paidTo  | amount |
      | Diana  | Charlie | 100    |

    When "Diana" logs in with email "diana.denver@test.com" and password "TestPass123!"
    And "Diana" records a payment in "Denver Trip 2026" group:
      | paidBy | paidTo | amount |
      | Eve    | Diana  | 50     |

    When "Eve" logs in with email "eve.denver@test.com" and password "TestPass123!"
    And "Eve" records a payment in "Denver Trip 2026" group:
      | paidBy | paidTo | amount |
      | Alice  | Eve    | 75     |

    # Phase 6: Verify final state
    When "Alice" logs in with email "alice.denver@test.com" and password "TestPass123!"
    Then "Alice" should see the group "Denver Trip 2026" with all expenses listed
    And "Alice" should see the group balances tab
    And the expenses tab should show at least 9 total expenses
    And the payments tab should show at least 5 recorded payments

    # Cleanup
    Then cleanup all test data for the trip

  Scenario: Single user group creation and expense tracking
    Given I sign up the following users one by one:
      | displayName | email                 | password     |
      | Frank       | frank.denver@test.com | TestPass456! |

    When "Frank" logs in with email "frank.denver@test.com" and password "TestPass456!"
    And "Frank" creates a new group named "Solo Trip"
    Then "Frank" should see the group "Solo Trip" in the groups list

    When "Frank" adds an expense to "Solo Trip" group:
      | description | amount | date       |
      | Hotel       | 250    | 2026-10-15 |
      | Meals       | 100    | 2026-10-15 |

    Then "Solo Trip" group should have 2 expenses with total amount 350

    When "Frank" logs in with email "frank.denver@test.com" and password "TestPass456!"
    Then "Frank" should see the group "Solo Trip" with expenses listed

    Then cleanup all test data for the trip
