# Query Creator

This specification describes the query creator functionality of IMDirectory.

## Test cases

### Setup

* Open IMDirectory
* Login
* Click shortcut "Creator"
* Click first instance of "Query" button
* Verify Creator layout is displayed
* Click "Edit Query" button
* Verify query editor is displayed

### Initial State

* Check editor is prepopulated with "Patients registered for GMS services on the reference date"

### Changes Saved on OK

* Click delete button
* Click "OK" button
* Verify query display no longer contains clause "Patients registered for GMS services on the reference date"
* Click "Edit Query" button
* Click "Edit base type" button
* Expand "Process of care" in tree
* Select "Care activity" in tree
* Confirm item selected updated
* Click "Select" button
* Confirm item selected updated
* Verify base type is now "Care activity"
* Click "OK" button

### Build Test Query - Base Type

* Click "Edit Query" button
* Click "Edit base type" button
* Expand "People and things" in tree
* Select "Patient" in tree
* Confirm item selected updated
* Click "Select" button
* Confirm item selected updated
* Verify base type is now "Patient"

### Build Test Query - Add Query Reference Clause

* Click "Add Clause" button
* Click menu item "Add query reference or import clause"
* Expand "Query library" in tree
* Expand "Example cohort definitions" in tree
* Select "Patients 65-70, or diabetes or prediabetes that need invitations for blood pressure measuring" in tree
* Confirm item selected updated
* Click "Import query as reference" button

### Build Test Query - Add Age Clause

* Click "Add Clause" button
* Click menu item "Add new clause"
* Expand "Personal identifiers" in tree
* Select "age" in tree
* Confirm item selected updated
* Fill in description with "aged between 65 and 70"
* Check "0" instance of "Range" option
* Fill out "0" instance of age value "greater or equal to", "65"
* Fill out "1" instance of age value "less than", "70"
* Click "Save" button

### Build Test Query - Add Diabetes Clause

* Click "Add Clause" button
* Click menu item "Add new clause"
* Expand "Clinical" in tree
* Select "Condition" in tree
* Confirm item selected updated
* Fill in description with "has pre-diabetes"
* Search for "prediabetes" and select
* Click "Save" button
* Check "1" match checkbox
* Check "2" match checkbox
* Click "Create boolean OR subgroup" button
* test