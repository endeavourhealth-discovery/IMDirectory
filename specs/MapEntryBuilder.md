# Map Entry builder

## Functional Requirements

To edit a list of Map entries based on the MapEntry interface.
Editing consists of

1. Adding a new Map entry
2. Removing an existing Map entry
3. Editing the fields of the map entry
4. Clear the list.
5. Upload a tab or csv file of entries from a local source.
6. Save the list of entries.
7. Cancel any changes

The source Text is mutually exclusive to source Value and to (rangeFrom and Range to fields)

## User interface requirements

1. Dialog box with title Map Entry Builder.
2. 6 column Tabular approach, one row per map entry.
2. Display the names of the entities iris in the source entity, source type, source property fields with hyperlink to
   entity
   definition.
3. Use the entity selector for the source entity, source type and source property fields.
4. Buttons for upload.
5. Buttons for delete on each row
5. buttons for cancel and save and clear all

## Technical approach

### Map Entry Interface

The Map entry interface is imported from the AutoGen ts interfaces
Source entity, source type and source property fields are TTIRefs i.e. iris and names.

## Sub components used in data entry

use Primevuew numeric input for fromValue and toValue and source value
use Primevue text input for source text
The entity selector is : /components/shared/AutompleteSearchBar for source entity,source type and source property as
this component is used to find entities,

## general approach

Style in line with the QueryEditor.

## component location

The component is in /src/components/editor/shapeComponents/MapEntryBuilder.vue
