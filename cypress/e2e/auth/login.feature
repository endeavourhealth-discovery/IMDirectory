Feature: login
  Scenario: Admin menu
    When I visit the home page
    And I accept the license and cookies
    Then I should see the account menu

  Scenario: Login option
    When I visit the home page
    And I accept the license and cookies
    And I click on the account menu
    Then I should see login option

  Scenario: Login page
    When I visit the home page
    And I accept the license and cookies
    And I click on the account menu
    And I click on the login option
    Then I should see the login page

  Scenario: Login
    When I navigate to the login page
    And I Enter a valid username
    And I Enter a valid password
    And I click on the login button
    Then I should see the login confirmation

  Scenario: Reveal password
    When I navigate to the login page
    And I Enter a valid password
    And I click reveal password
    Then I should see the password

  Scenario: Register new account
    When I navigate to the login page
    Then I should be able to navigate to register an account

  Scenario: Enter confirmation code
    When I navigate to the login page
    Then I should be able to navigate to enter a confirmation code

  Scenario: Recover account
    When I navigate to the login page
    Then I should be able to navigate to recover my account

