# User Story & Stakeholders

Used by an end user when building an IMQ compatible query in one of 2 scenarios

1. When editing an IMQ match clause, defining a set of columns to be returned including conditional values
2. When editing an IMQ data set entry (column group) defining a set of columns to be exported including conditional
   values

# Measurable Success Criteria

User able to build 6 or more columns in a few minutes.
End-to-end test showing the creation or editing for a set of columns and values to be returned

# Functional Requirements

User must be able to

1. Add a named column
2. Define the column as the truth value of the clause with a value being text or some other.
3. Define the column to contain a value from a column associated with the match clause type its related types
4. Define the column to contain values determined by the values of a property.
5. Define the column to contain values determined by boolean property values for example, where concept=x or value>40.

# Non-Functional Requirements

Minimum number of API calls

# Explicit Constraints (The "DO NOT" List)

No changes to IMQ model or no new interfaces.
Limit changes to the components listed within the technical context.
No changes to WhereEditor.vue

# Technical Context

The target is to populate a list of objects of type Return
Each return has an "as" property that is the name of the column to be returned.
Each return may have an "iri" field that is the IRI of the property to be returned.
Each return may have a "case" field that is the case expression to be evaluated.
Case when -> exists for truth value.
Case when -> where for property value condition checking.

Vue components to use

1. Refactoring of ReturnEditor.vue
2. Use of PopertySelector for selecting property values as in requirement2
3. Use of WhereEditor when defining conditions or boolan conditions
4. Use and modification of CaseConditionEditor for complex conditions
4. Use of primevuew components for the UI where needed.

7. Acceptance Tests
   
