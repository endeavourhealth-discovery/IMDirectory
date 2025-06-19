Feature: login
#  Scenario: Admin menu
#    When I visit the home page
#    And I accept the license and cookies
#    Then I see the account menu
#
#  Scenario: Login option
#    When I visit the home page
#    And I accept the license and cookies
#    And I click on the account menu
#    Then I see login option
#
#  Scenario: Login page
#    When I visit the home page
#    And I accept the license and cookies
#    And I click on the account menu
#    And I click on the login option
#    Then I see the login page
#
#  Scenario: Login
#    When I navigate to the login page
#    And I enter a valid username
#    And I enter a valid password
#    And I click on the login button
#    Then I see the login confirmation
#
#  Scenario: Reveal password
#    When I navigate to the login page
#    And I enter a valid password
#    And I click reveal password
#    Then I see the password
#
#  Scenario: Register new account
#    When I navigate to the login page
#    Then I be able to navigate to register an account
#
#  Scenario: enter confirmation code
#    When I navigate to the login page
#    Then I be able to navigate to enter a confirmation code
#
#  Scenario: Recover account
#    When I navigate to the login page
#    Then I be able to navigate to recover my account
#
#  Scenario: Private mode home page
#    Given the server is in private mode
#    When I visit the home page
#    And I accept the license and cookies
#    Then I see the login page
#
#  Scenario: Private mode direct url
#    Given the server is in private mode
#    When I accept the license and cookies
#    And I navigate to a concept page
#    Then I see the login page
#
#  Scenario: Private mode hidden navigation
#    Given the server is in private mode
#    When I visit the home page
#    And I accept the license and cookies
#    Then I see the login page
#    And the home and back buttons are not available
#
#  Scenario: Private mode remain logged in on refresh
#    Given the server is in private mode
#    When I visit the home page
#    And I accept the license and cookies
#    And I login to the application
#    Then I see the login confirmation
#    When I visit the home page
#    And I refresh the page
#    Then I see the home page
#
#    Scenario: Public mode directly visit entity url
#    When I visit an entity url
#        Then I see the entity viewer

  Scenario: Login Snapshot
    When I navigate to the login page
    Then the login-page matches the snapshot
    When I enter a valid username
    And I enter a valid password
    And I click on the login button
    Then the login-page matches the snapshot
