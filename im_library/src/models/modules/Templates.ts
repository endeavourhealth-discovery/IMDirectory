import uuid from "uuid-random";
import _ from "lodash";
import { isArrayHasLength, isObjectHasKeys } from "../../helpers/modules/DataTypeCheckers.js";

// Future updates
//#todo: create map for Paths to each entity to keep code DRY and so you can change the path to references in one places
// _vars should only be declared once for all metadata inside a JSON definition -> becomes avaialble by reference e.g. #currentClause

const valueToPhraseMap = {
  GREATER_THAN_OR_EQUAL: {
    false: "more than",
    true: "less than"
  },
  LESS_THAN_OR_EQUAL: {
    true: "more than",
    false: "less than"
  },
  firstLetterVowel: {
    true: "an",
    false: "a",
    default: null
  },
  include: {
    true: "Include",
    false: "Exclude",
    default: null
  },
  entityIri: {
    "im:PersonDetails": "Personal Details Record",
    default: null
  },
  entityName: {
    // "codeable expression": "Terminological Concept",
    "codeable expression": "clinical code",
    $referenceDate: "the Reference Date",
    "Medication order or prescription (entry type)": "Order or Prescription",
    DESCENDING: "descending",
    ASCENDING: "ascending",
    GREATER_THAN_OR_EQUAL: "greater than or equal to",
    LESS_THAN_OR_EQUAL: "less than or equal to",
    Event: "Health Record",
    "Person Details": "Personal Details Record",
    default: null //returns input itself
  },
  animatePronoun: {
    true: "they",
    false: "it",
    default: "it"
  },
  had: {
    true: "had",
    false: "didn't have",
    default: "it"
  },
  were: {
    true: "were",
    false: "were not",
    default: "were"
  },
  was: {
    true: "was",
    false: "was not",
    default: "was"
  },
  entry: {
    singular: "entry",
    plural: "entries"
  },
  records: {
    singular: "record",
    plural: "records"
  },
  DAY: {
    singular: "day",
    plural: "days"
  },
  WEEK: {
    singular: "week",
    plural: "weeks"
  },
  MONTH: {
    singular: "month",
    plural: "months"
  },
  YEAR: {
    singular: "year",
    plural: "years"
  },
  DESCENDING: {
    "im:DateTime": "latest",
    default: null
  },
  ASCENDING: {
    "im:DateTime": "earliest",
    default: null
  }
} as any;

//  entities change the importance of a phrase e.g. from required -> optional. E.g. based on name or entityType.
// const optionalPhrases = [{ entityType:}]

// - consider short syntax e.g. Include Person, with a record where [concept is BP AND value >140 AND effective date exists]
// types of words that exist

// [phrase tyes 1-3] each must go through word transformation map [using #phrase]
// [phrase types 1-3] each must preserve both a reference to the  value and the path from of the original JSON profile [hence why they're called REF]

// THIS IS NOT A PHRASE TYPE BUT A TEMPLATE RECURSIVE TEMPLATE FUNCTION
// 1. [JOIN with 1 AND/OR/NOT] collection of property joined with and/or/not -> linkedEntityProperty function  e.g.  and [effective date exists, numeric value >140, concept is]

// #REF -> references to one or more (entities or values) at paths
// e.g. references to a match clauses containing properties (not match clauses containing linked entities, these are dealt with in Profile.vue/ UI OM (definitionTree))
// for now it is assumed that only 1 parent and/or/not is used
// [ ] 2 [JOIN with 1 OR] collection of values of a property (profile, concept sets) - e.g. person hasProfile [collection], concept valueIn [collection], valueNotIn [collection] -> this may reference a single entity, or multiple entities
// 3. single value in at propertyPath -e.g. valueCompare, descending, equaltoorgreaterthan, valueFunction

// #PHRASE -> valueToPhraseMap - adds an additional key to Entity "_text"
// [1-2] -> 4 transformations applied to existing names of entitties?
// [3] -> 5. words derived from the outcome of a function applied to values from types 1-3 (i.e. function applied iteratively to [2-2]) [e.g. descending + propert with entitytype datetime = latest]

// THIS IS NOR A PHRASE but a repetition of 5 as another word in the sentence
// [5] -> 6. words derived from other words (also using a function) (a / an) ( was, was not, include, exclude)

// #CONSTANT -> prewritten, immutable words or phrases
// 6. completely static words ("with" "had")

//////// referneces and phrase transformations

function transform(targetPhrase: any, returnValue: any): any {
  //mapping words to the outcome of a function's value
  let _targetPhrase = targetPhrase;
  let _value = typeof returnValue == "string" ? returnValue : returnValue.toString();

  let _text = "";
  if (valueToPhraseMap[_targetPhrase][_value]) {
    _text = valueToPhraseMap[_targetPhrase][_value];
  } else if (valueToPhraseMap[_targetPhrase]["default"]) {
    _text = valueToPhraseMap[_targetPhrase]["default"];
  } else {
    _text = _value;
    // show rdfs label or iri
  }
  return _text;
}

//maps function outcomes against values in valueToPhraseMap
function phrase(phraseType: string, input: any, references: any[] = []): any {
  // transforming one or more references [1-2] -> 4 AND  [3] -> 5.

  // [1-2]
  if (input?.type == "reference") {
    if (Array.isArray(input.data)) {
      input.data.forEach((entity: any, index: any) => {
        //adds new "text" key to entity reference
        input.data[index]["_text"] = transform("entityName", entity["rdfs:label"]);
      });
    } else if (input.data) {
      //adds new "text" key to value at path
      const _text = transform("entityName", input.data["rdfs:label"]);
      input.data["_text"] = _text;
    } else {
      return null;
    }

    // transforming 1 existing phrase [5-> 6]
  } else if (typeof (input == "string")) {
    // if the object returned is just a string e.g. isTrue() it may have had metadata
    if (references.length > 0) {
      const _text = transform(phraseType, input);
      return {
        text: _text,
        type: "transformedReferences",
        importance: "required",
        mutable: false,
        meta: {
          transformations: [], //record subsequent transformations using phrase
          args: {
            data: references,
            transformationType: phraseType,
            transformationInput: input
          }
        },
        uuid: `urn:uuid:${uuid()}`
      };
    } else {
      //if it doesnt have references it most likely isnt mutable, but some other variable
      const _text = transform(phraseType, input);

      return {
        text: _text,
        type: "transformedText",
        importance: "required",
        mutable: false,
        meta: {
          transformations: [], //record subsequent transformations using phrase
          args: {
            transformationType: phraseType,
            transformationInput: input
          }
        },
        uuid: `urn:uuid:${uuid()}`
      };
    }
  }

  return input;
}

// used for hasPRofile/valueIn/valueNotIn or things that point to Entities
function reference(targetClause: any, propertyPath = ""): any {
  let _values = _.get(targetClause, propertyPath, targetClause);

  //generaetes an empty reference if none were found
  if (!_values) {
    return;
  }

  //generates empty entities so not references are not completely empty
  if (Array.isArray(_values)) {
    _values = _values.map((entity: any) => {
      if (isObjectHasKeys(entity, ["@id"]) && !isObjectHasKeys(entity, ["rdfs:label"])) {
        return {
          "@id": entity["@id"],
          "rdf:type": [],
          "rdfs:label": ""
        };
      } else {
        return entity;
      }
    });
  } else {
    if (isObjectHasKeys(_values, ["@id"]) && !isObjectHasKeys(_values, ["rdfs:label"])) {
      _values = {
        "@id": _values["@id"],
        "rdf:type": [],
        "rdfs:label": ""
      };
    }
  }

  const _reference = {
    text: "",
    data: _values,
    type: "reference",
    importance: "required",
    mutable: false,
    meta: {
      transformations: [], //record subsequent transformations using phrase
      args: {
        propertyPath: propertyPath
      }
    },
    uuid: `urn:uuid:${uuid()}`
  } as any;

  //sets uuid (definitionTree) or id (if json definition)
  // if not avaialble (e.g. main entity) sets the actual clause data.
  let _idKey;
  if (isObjectHasKeys(targetClause, ["uuid"])) {
    _idKey = "uuid";
  } else if (isObjectHasKeys(targetClause, ["id"])) {
    _idKey = "id";
  }
  if (_idKey) {
    _reference.meta.args[_idKey] = targetClause[_idKey];
  } else {
    _reference.meta.args["targetClause"] = targetClause;
  }
  return _reference;
}

////// functions

// checks if a path exists - e.g. for template matching
function pathExists(testObject: any, testPath: string): boolean {
  return typeof _.get(testObject, testPath) != "undefined";
}

function pathValueIs(testObject: any, testPath: string, comparatorObject: string): boolean {
  const _value = _.get(testObject, testPath);
  return _value && _value == comparatorObject;
}

function fromPath(testObject: any, testPath: string): boolean {
  return _.get(testObject, testPath);
}

function isSingular(testObject: any): boolean {
  if (typeof testObject == "number") {
    if (testObject == 1 || testObject == -1) return true;
  } else if (typeof testObject == "string") {
    // #todo compare testObject against an array of strings that represent signular, all else is plural
  }
  return false;
}

// (case-insensitive) tests the first letter for a string against an array of letters - e.g. indefiniteArticle
function firstLetterIsVowel(testString: string): boolean {
  return ["a", "e", "i", "o", "u"].some((letter: string) => letter.toLowerCase() == testString.substring(0, 1).toLowerCase());
}

// compares the value of a string (testString) against an array (of strings for comparison) - e.g. useful for valueIn
function includes(testString: string, stringArray: string[]): boolean {
  return stringArray.includes(testString);
}

function isObjectAnimate(testObjectName: string): boolean {
  return ["person", "persons", "patient", "patients", "people"].includes(testObjectName.toLowerCase()) ? true : false;
}

function isTrue(args: any[]): boolean {
  return args.every(arg => arg);
}

function hasTransformation(phraseType: any, input: any) {
  return valueToPhraseMap[phraseType][input] == null ? false : true;
}

function isNegative(testNumber: number): boolean {
  const _sign = Math.sign(testNumber);
  if (_sign == 1 || _sign == 0) {
    return false;
  } else {
    return true;
  }
}

// a phrase that is static and not mutable by user
// #todo: populate meta with info for querybuilding
function constant(text: any) {
  return {
    text: text,
    type: "constant",
    importance: "required",
    mutable: false,
    data: [],
    meta: {},
    uuid: `urn:uuid:${uuid()}`
  };
}

// a phrase derived from a function, mutable by user (i.e. when querybuilding)
function mutable(object: any) {
  if (Array.isArray(object)) {
    object.forEach((item: any) => (item.mutable = true));
  } else {
    object.mutable = true;
  }
  return object;
}

function optional(object: any) {
  if (Array.isArray(object)) {
    object.forEach((item: any) => (item.importance = "optional"));
  } else {
    object.importance = "optional";
  }
  return object;
}

function includeMainEntity(mainEntity: any, parentClause: any, currentClause: any, _args: any) {
  const _ref1 = reference(parentClause, "include");
  const _ref2 = reference(currentClause, "include");
  const _include = mutable(phrase("include", isTrue(_ref1?.data) && isTrue(_ref2?.data), [_ref1, _ref2]));
  const _ref3 = reference(mainEntity, "");
  const _mainEntity = mutable(phrase("entityName", _ref3));
  const _a = phrase("firstLetterVowel", firstLetterIsVowel(_mainEntity?.data?._text));
  const _inFinalResults = optional(constant("in the final results of this search"));
  const _if = constant("if");
  //doesnt require a refernece since it wil not be mutable by the user
  const _pronoun = phrase("animatePronoun", isObjectAnimate(_mainEntity?.data["_text"]));
  return [_include, _a, _mainEntity, _inFinalResults, _if, _pronoun];
}

function linkedEntity(_mainEntity: any, _parentClause: any, currentClause: any, _args: any) {
  const _had = constant("had");
  const _ref1 = reference(currentClause, "json.entityType");
  const _entity = mutable(phrase("entityName", _ref1));
  const _a = phrase("firstLetterVowel", firstLetterIsVowel(_entity?.data?._text));
  const _with = constant("with");
  return [_had, _a, _entity, _with];
}

function hasProfile(_mainEntity: any, _parentClause: any, currentClause: any, _args: any) {
  const _ref1 = reference(currentClause, "json.notExist");
  const _were = mutable(phrase("were", isTrue(_ref1?.data), [_ref1]));
  const _partOf = constant("part of");
  const _resultsOf = optional(constant("the final results of the search"));
  //don't need to pass references as an argument
  const _ref2 = reference(currentClause, "json.valueIn");
  const _profiles = mutable(phrase("entityName", _ref2));
  return [_were, _partOf, _resultsOf, _profiles];
}

function generateSentence(currentClause: any) {
  const _ref1 = reference(currentClause, "property");
  const _property = mutable(phrase("entityName", _ref1));
  const _a = phrase("firstLetterVowel", firstLetterIsVowel(_property?.data?._text));
  const _that = constant("that");
  const _partOf = constant("part of the set of values in");
  // applies to scenario 3/4
  const _ref2 = reference(currentClause, "valueNotIn");
  const _was = phrase("was", _ref2?.data == undefined, [_ref2]);
  //scenario 1: nothing besides property [entity reference] is declared [e.g. property opreator clause  effectiveDate4]
  //parent would be: "and the latest [3] entries in [their] health record had:"
  //current would be: "an [effective date] that exists / that was an entry in their record" //This should be autogenerated in the UI when [Latest/Earliest] is in use - i.e. if no effective date exits you cannot say "latest" or "earliest"
  const _exists = constant("that exists");
  // // scenario 2: valueCompare / valueFunction
  const _ref3 = currentClause?.valueCompare ? reference(currentClause, "valueCompare.comparison") : null;
  let _comparison = _ref3 ? mutable(phrase("entityName", _ref3?.data, [_ref3])) : null;
  const _ref4 = currentClause?.valueCompare ? reference(currentClause, "valueCompare.valueData") : null;
  let _valueData = _ref4 ? mutable(phrase("entityName", _ref4?.data, [_ref4])) : null;
  //units
  const _phraseQuantityType = _ref4 ? (isSingular(_ref4.data) ? "singular" : "plural") : null;
  const _ref5 = currentClause?.valueFunction ? reference(currentClause, "valueFunction.argument[0].valueData") : null;
  const _units = _ref5 && _phraseQuantityType ? phrase(_ref5?.data, _phraseQuantityType, [_ref5]) : null; //entry/entries //record(s)
  // simplified comparison for dates if rdfs is date-time AND the _valueData is negative (e.g. greater than -18 months before turns into "less than 18 months before")
  // requires rdfs:range in order to work e.g. only applies this function to DateTime!
  const _isDateTime = _.get(_ref1, "data.rdfs:range.@id") != undefined && _ref1?.data["rdfs:range"]["@id"] == "im:DateTime";
  if (_isDateTime && _valueData?.text) {
    //turns greater than into less than and vice versa
    const _isNegative = isNegative(parseInt(_valueData?.text));
    _comparison = _ref3 ? mutable(phrase(_ref3?.data, _isNegative, [_ref3])) : null;
    //changes negative to postive
    _valueData.text = _valueData.text.substring(1);
  }
  // comparator e.g. reference date
  const _ref6 = currentClause?.valueFunction ? reference(currentClause, "valueFunction.argument[1].valueData") : null;
  const _before = constant("before");
  const _comparator = _ref6 ? phrase("entityName", _ref6.data, [_ref6]) : null; //entry/entries //record(s)
  // secnario 3: valueIn / valueNotIn
  const _valueIn = currentClause?.valueIn ? mutable(reference(currentClause, "valueIn")) : null;
  const _valueNotIn = currentClause?.valueNotIn ? mutable(reference(currentClause, "valueNotIn")) : null;
  let _sentence = [_a, _property, _exists]; //default sentence is "exists"
  const _sentenceVariants = {
    valueIn: [_a, _property, _that, _was, _partOf, _valueIn],
    valueNotIn: [_a, _property, _that, _was, _partOf, _valueNotIn],
    valueCompare: [_a, _property, _that, _was, _comparison, _valueData],
    valueFunction: [_a, _property, _that, _was, _comparison, _valueData, _units],
    "valueFunction.argument[1]": [_a, _property, _that, _was, _comparison, _valueData, _units, _before, _comparator]
  } as any;
  //select the sentence based on json path otherwise use default sentence.
  const _expectedKeys = ["valueIn", "valueNotIn", "valueCompare", "valueFunction", "valueFunction.argument[1]"];
  //gets the last matching template in the array (most specific)
  _expectedKeys.forEach((key: string) => {
    if (isObjectHasKeys(currentClause, [key])) {
      _sentence = _sentenceVariants[key]; //chooses valueFunction over valueCompare i.e. if units are present
    }
  });
  return _sentence;
}

function entityProperty(_mainEntity: any, _parentClause: any, currentClause: any, args: any) {
  //a function that returns an array of objects that represents a single sentence (i.e. the description one property)
  let _sentences = [] as any[];

  //#todo: if there is an and/or/not key -> go through it recursively in case there are other children (not required at present)
  //gets the arguments specified in the cascade object
  // [0][paths] is the path of a clause to check for properties e.g. 1 and/or/nots, 2 "" (Root), 3 test
  const _paths = _.get(args, "[0][paths]");
  if (_paths) {
    //check each path for a property to translate
    _paths.forEach((_path: string) => {
      let _clauses = _path == "" ? currentClause.json : _.get(currentClause, _path);
      //arrays e.g. and/or/nots
      if (isArrayHasLength(_clauses)) {
        _clauses.forEach((_clause: any) => {
          if (_clause.property) {
            _sentences.push(generateSentence(_clause));
          }
        });
        // single properties e.g. at root path of a match clause clause
      } else if (isObjectHasKeys(_clauses, ["property"])) {
        _sentences.push(generateSentence(_clauses));
      }
    });
  } else {
    return null;
  }
  return _sentences;
}

function propertySort(_mainEntity: any, _parentClause: any, currentClause: any, _args: any) {
  //this can have as its child (another property test clause )
  const _refDirection = reference(currentClause, "json.sort.direction"); //e.g. descending
  const _refOrderBy = reference(currentClause, "json.sort.orderBy"); //e.g. effectivedate
  const _refCount = reference(currentClause, "json.sort.count"); //e.g. 1
  const _andAfter = constant("and after sorting by"); //[descending] [effective date]
  const _direction = phrase("entityName", _refDirection.data);
  const _propertyName = phrase("entityName", _refOrderBy);
  const _theFirst = constant("the first"); //[1]
  const _count = phrase("entityName", _refCount.data);
  const _phraseValue = isSingular(_refCount.data) ? "singular" : "plural";
  const _items = phrase("entry", _phraseValue, [_refCount]); //entry/entries //record(s)
  const _had = constant("had");
  //  have a generic default for each property's IRI
  // #todo: this map of metadata can be configured by user / added to an entity's definition?
  const _andThe = constant("and the");
  // fix entityType on population
  // ensure arrays are read
  const _hasTransformation = hasTransformation("DESCENDING", _refOrderBy.data["rdfs:range"]["@id"]);
  const _latestHighest = _hasTransformation ? phrase(_refDirection.data, _refOrderBy.data["rdfs:range"]["@id"], [_refDirection, _refOrderBy]) : null; //  e.g. latest
  let _sentence;
  if (_hasTransformation) {
    // sentence with transformed phrases = and the [latest] [1] entry had
    _sentence = [_andThe, _latestHighest, _count, _items, _had];
    //default sentence = and after sorting by [descending] [effective date] the first [1] entry/entries had
  } else {
    _sentence = [_andAfter, _direction, _propertyName, _theFirst, _count, _items, _had];
  }
  return _sentence;
}

// this acts as both "constraints" for the querybuilder and as "templates" for the query viewer
// #todo: calculate mutableCount at runtime
// #todo: add requirements for template matchin
const CascadingTemplates = [
  {
    uuid: `urn:uuid:${uuid()}`,

    get: { function: "includeMainEntity", input: [] },
    set: null,
    meta: {
      min: 0,
      max: 1,
      mutableCount: 0,
      matchIf: null
    },
    data: [],
    children: [
      {
        uuid: `urn:uuid:${uuid()}`,

        get: { function: "linkedEntity", input: [] },
        set: null,
        meta: {
          min: 0,
          max: 1,
          mutableCount: 0,
          matchIf: {
            all: [
              {
                test: "pathExists",
                input: ["#currentClause", "json.entityType.@id"],
                expect: true
              }
            ]
          }
        },
        data: [],
        children: [
          {
            uuid: `urn:uuid:${uuid()}`,

            get: { function: "entityProperty", input: [{ paths: ["json", "json.and", "json.or", "json.not"] }] },
            set: null,
            meta: {
              min: 0,
              max: 1,
              mutableCount: 0,
              matchIf: {
                any: [
                  {
                    test: "pathExists",
                    input: ["#currentClause", "json.property"],
                    expect: true
                  },
                  {
                    test: "pathExists",
                    input: ["#currentClause", "json.and"],
                    expect: true
                  }
                ]
              }
            },
            data: [],
            children: []
          },
          {
            uuid: `urn:uuid:${uuid()}`,

            get: { function: "PropertySort", input: [] },
            set: null,
            meta: {
              min: 0,
              max: 1,
              mutableCount: 0,
              matchIf: {
                all: [
                  {
                    test: "pathExists",
                    input: ["#currentClause", "json.sort"],
                    expect: true
                  }
                ]
              }
            },
            data: [],
            children: [
              {
                get: { function: "entityProperty", input: [{ paths: ["json.test.and", "json.test.or", "json.test.not", "json.test"] }] },
                set: null,
                meta: {
                  min: 0,
                  max: 1,
                  mutableCount: 0,
                  matchIf: {
                    any: [
                      {
                        test: "pathExists",
                        input: ["#currentClause", "json.test"],
                        expect: true
                      }
                    ]
                  }
                },
                data: [],
                children: []
              }
            ]
          }
        ]
      },
      {
        uuid: `urn:uuid:${uuid()}`,

        get: { function: "hasProfile", input: [] },
        set: null,
        meta: {
          min: 0,
          max: 0,
          mutableCount: 0,
          matchIf: {
            all: [
              {
                test: "pathValueIs",
                input: ["#currentClause", "json.property.@id", "im:hasProfile"],
                expect: true
              }
            ]
          }
        },
        data: [],
        children: []
      }
    ]
  }
];

// #todo: ensure all templateFunctions return empty placeholders if functions are called without paramters -> this is to generate metadata for querybuilding
const templateFunctions = {
  includeMainEntity: includeMainEntity,
  linkedEntity: linkedEntity,
  hasProfile: hasProfile,
  propertySort: propertySort,
  entityProperty: entityProperty
} as any;

const matchFunctions = {
  pathExists: pathExists,
  pathValueIs: pathValueIs
} as any;

let _vars = {} as any;

function testCriteria(criteria: any) {
  const _f = matchFunctions[criteria.test];
  let _args = criteria.input;

  //replaces args with vars
  _args.forEach((arg: any, index: number) => {
    if (typeof arg == "string" && arg.substring(0, 1) == "#") {
      return (_args[index] = _vars[arg]);
    }
  });
  return _f(..._args) == criteria.expect;
}

function doesTemplateMatch(mainEntity: any, profile: any, parentClause: any, currentClause: any, template: any): boolean {
  //do a depth first recursive function OR queue like below through matchIf
  // check every child in matchIf - if it's an "all" -> use array.every, otherwise use array.some

  // if no criteria are specified
  if (!template.meta.matchIf) return true;
  // in order to support arguments such as #currentClause #profile, #mainEntity, #parentClause use the object vars
  _vars = {
    "#mainEntity": mainEntity,
    "#profile": profile,
    "#currentClause": currentClause,
    "#parentClause": parentClause,
    "#template": template
  };
  let _shouldMatch = false;

  // #todo: add support multiple templates matching a single clause -> generate all of them
  // #display to the user first the template with the most specificity (most matchIf requirements) or least amount of placeholders (count mutables?)

  if (template.meta.matchIf.all && template.meta.matchIf.all.length) {
    //test all criteria using "every"
    const _criteria = template.meta.matchIf.all;
    _shouldMatch = _criteria.every(testCriteria);
  } else if (template.meta.matchIf.any && template.meta.matchIf.any.length) {
    //test all criteria using "every"
    const _criteria = template.meta.matchIf.any;
    _shouldMatch = _criteria.some(testCriteria);
  } else {
    _shouldMatch = false;
  }

  //#todo: select multiple compatible phrases templates and pick the shortest one (currently it only picks one
  return _shouldMatch;
}

function processQueue(_queue: any[], _cascadingTemplates: any, mainEntity: any, profile: any, clausePath: string, _deleteQueue: any[]) {
  while (_queue.length > 0) {
    const _currentItemPath = _queue.shift();
    const _template = _.get(_cascadingTemplates, _currentItemPath);
    const _currentClause = _.get(profile, clausePath);
    const _parentPath = clausePath.split(".").slice(0, -1).join(".");
    const _parentClause = _.get(profile, _parentPath);
    //check template requirements are met
    if (doesTemplateMatch(mainEntity, profile, _parentClause, _currentClause, _template)) {
      const _templateFunction = templateFunctions[_template.get.function];
      const _data: string[] = _templateFunction(mainEntity, _parentClause, _currentClause, _template.get.input);
      // if data is a collection of arrays (e.g. a function executing itself more than once ).
      // the data:[] key in the cascade acts as an "AND" operator clause and can contain and/or/not
      let _currentCascade = _.get(_cascadingTemplates, _currentItemPath);
      // if there are multiple sentences, push all sentences individually, otherwise push the single sentence
      if (Array.isArray(_data[0])) {
        _currentCascade.data = _data as never;
      } else {
        _currentCascade.data.push(_data as never);
      }
      //adds children to the queue
      if (_template.children.length > 0) {
        _template.children.forEach((_item: any, index: number) => _queue.push(_currentItemPath + `[children][${index}]`));
      }
    } else {
      // remove template from cascade if not matching
      _deleteQueue.push(_currentItemPath);
    }
  }
}

function processDeleteQueue(_deleteQueue: any, _cascadingTemplates: any) {
  while (_deleteQueue.length > 0) {
    //deletes items starting with last time to avoid shifting array indices
    const _lastIndex = _deleteQueue.length - 1;
    const _currentItemPath = _deleteQueue[_lastIndex];

    const _start: number = _currentItemPath.lastIndexOf("[");
    const _end: number = _currentItemPath.lastIndexOf("]");
    const _index = _currentItemPath.substring(_start + 1, _end);
    const _parentPath = _currentItemPath.substring(0, _start);

    const _parent: any = _.get(_cascadingTemplates, _parentPath);
    _parent.splice(_index, 1);
    _deleteQueue.splice(_lastIndex, 1);

    //does not remove object propery
    // _.unset(_cascadingTemplates, _currentItemPath)
  }
}

export function toTemplates(mainEntity: any, profile: any, clausePath: string) {
  // debugger;
  const _queue = [] as any[];
  const _deleteQueue = [] as any[];
  //add all paths of templates then recursively go through each in order to populate json[]
  const _cascadingTemplates = _.cloneDeep(CascadingTemplates);
  _cascadingTemplates.forEach((_item: any, index: number) => _queue.push(`[${index}]`));
  processQueue(_queue, _cascadingTemplates, mainEntity, profile, clausePath, _deleteQueue);

  // removes templates not matched
  processDeleteQueue(_deleteQueue, _cascadingTemplates);

  return _cascadingTemplates;
}
