# Data Model Creator

This specification describes the data model creator functionality of IMDirectory.

## Test cases

### Setup
* Open IMDirectory
* Login
* Click shortcut "Creator"
* Click "shape" button
* Verify Creator layout is displayed

### Initial State
* Entity combo box is empty
* IRI builder dropdown is not empty
* IRI builder input is empty
* Text display is disabled and empty
* Text inputs are empty
* HTML input is empty
* Status is "Draft"
* Search inputs are empty
* Property builder has no properties

### IRI Update
* Type "test" into IRI builder input
* Code has value "test"
* IRI builder container contains "http://endhealth.info/im#test"

### Status Update
* Select status "Active"
* Status is "Active"

### Contained In Management
* "Contained in" array builder has "1" items
* Search "all" in "Contained in" array builder
* Select first listbox item
* Click add button in "Contained in" array builder
* "Contained in" array builder has "2" items
* Click delete button "1" in "Contained in" array builder
* "Contained in" array builder has "1" items

### Subclass Of Management
* "Subclass of" array builder has "1" items
* Search "pat" in "Subclass of" array builder
* Select first listbox item
* Click add button in "Subclass of" array builder
* "Subclass of" array builder has "2" items
* Click delete button "1" in "Subclass of" array builder
* "Subclass of" array builder has "1" items

### Property Management
* Click "Add property" button
* Property builder has "1" properties
* Type "and" into "Select property"
* Select first listbox item
* Type "and" into "Select range"
* Select first listbox item
* Click "Add property" button
* Property builder has "2" properties
* Click delete property button "1"
* Property builder has "1" properties
