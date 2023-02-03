import ECLVisitor from "./ECLVisitor";
import { isObjectHasKeys } from "../../helpers/DataTypeCheckers";
import _ from "lodash";
import { IM, SNOMED } from "@im-library/vocabulary";

export default class ECLBuilderVisitor extends ECLVisitor {
  constructor() {
    super();
  }

  visitEcl(ctx) {
    console.log("found ecl");
    console.log(ctx.getText());
    let build = { type: "BoolGroup", conjunction: "AND" };
    if (ctx.children) {
      build.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (result && isObjectHasKeys(result, ["type"]) && result.type === "BoolGroup") build = result;
          else if (isObjectHasKeys(result)) build.items.push(result);
        }
      }
    }
    return build;
  }

  visitExpressionconstraint(ctx) {
    console.log("found expression constraint");
    console.log(ctx.getText());
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result)) return result;
        }
      }
    }
  }

  visitRefinedexpressionconstraint(ctx) {
    console.log("found refined expression constraint");
    console.log(ctx.getText());
    let build = {};
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (isObjectHasKeys(result, ["type"])) {
          if (result.type === "Concept") build = result;
          if (result.type === "Refinement" || result.type === "BoolGroup") build.items = [result];
        }
      }
    }
    return build;
  }

  visitCompoundexpressionconstraint(ctx) {
    console.log("found compound expression constraint");
    console.log(ctx.getText());
    return this.visitChildren(ctx)[0];
  }

  visitConjunctionexpressionconstraint(ctx) {
    console.log("found conjunction expression constraint");
    console.log(ctx.getText());
    let build = { type: "BoolGroup", test: "conjunction expression constraint" };
    if (ctx.children) {
      build.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.conjunction = result.conjunction;
          else if (isObjectHasKeys(result, ["type"]) && (result.type === "Concept" || result.type === "BoolGroup")) build.items.push(result);
        }
      }
    }
    return build;
  }

  visitDisjunctionexpressionconstraint(ctx) {
    console.log("found disjunction expression constraint");
    console.log(ctx.getText());
    let build = { type: "BoolGroup", test: "disjunction expression constraint" };
    if (ctx.children) {
      build.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.conjunction = result.conjunction;
          else if (isObjectHasKeys(result, ["type"]) && (result.type === "Concept" || result.type === "BoolGroup")) build.items.push(result);
        }
      }
    }
    return build;
  }

  visitExclusionexpressionconstraint(ctx) {
    console.log("found exclusion expression constraint");
    console.log(ctx.getText());
    let build = { type: "BoolGroup", test: "exclusion expression constraint" };
    if (ctx.children) {
      build.items = [];
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.conjunction = result.conjunction;
          else if (isObjectHasKeys(result, ["type"]) && (result.type === "Concept" || result.type === "BoolGroup")) build.items.push(result);
        }
      }
    }
    return build;
  }

  visitDottedexpressionconstraint(ctx) {
    console.log("found dotted expression constraint");
    console.log(ctx.getText());
    this.visitChildren(ctx);
  }

  visitDottedexpressionattribute(ctx) {
    console.log("found dotted expression attribute");
    console.log(ctx.getText());
    this.visitChildren(ctx);
  }

  visitSubexpressionconstraint(ctx) {
    console.log("found sub expression constraint");
    console.log(ctx.getText());
    let build = { type: "Concept" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["constraint"])) build.descendants = result.constraint;
          if (isObjectHasKeys(result, ["conceptReference"])) {
            build.concept = {};
            build.concept.iri = result.conceptReference;
          }
        }
      }
    }
    return build;
  }

  visitBracketcompoundexpressionconstraint(ctx) {
    console.log("found bracket compound expression constraint");
    console.log(ctx.getText());
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["type"]) && (result.type === "Concept" || result.type === "BoolGroup")) {
            return result;
          }
        }
      }
    }
  }

  visitConstraintoperator(ctx) {
    console.log("found constraintOperator");
    console.log(ctx.getText());
    if (ctx.children) return { constraint: this.visitChildren(ctx)[0] };
  }

  visitDescendantof(ctx) {
    console.log("found descendantOf");
    console.log(ctx.getText());
    return "<";
  }

  visitDescendantorselfof(ctx) {
    console.log("found descendantOrSelfOf");
    console.log(ctx.getText());
    return "<<";
  }

  visitAncestorof(ctx) {
    console.log("found ancestorOf");
    console.log(ctx.getText());
    return ">";
  }

  visitAncestororselfof(ctx) {
    console.log("found ancestorOrSelfOf");
    console.log(ctx.getText());
    return ">>";
  }

  visitChildof(ctx) {
    console.log("found childOf");
    console.log(ctx.getText());
    return "<!";
  }

  visitParentof(ctx) {
    console.log("found parentOf");
    console.log(ctx.getText());
    return ">!";
  }

  visitEclfocusconcept(ctx) {
    console.log("found ecl focus concept");
    console.log(ctx.getText());
    if (ctx.children) return { conceptReference: this.visitChildren(ctx)[0] };
  }

  visitEclconceptreference(ctx) {
    console.log("found ecl concept reference");
    console.log(ctx.getText());
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitConceptid(ctx) {
    console.log("found concept id");
    console.log(ctx.getText());
    const code = ctx.getText();
    let iri = code;
    if (code.match(/^[0-9]+$/)) {
      if (code.match(/1000252/g)) iri = IM.NAMESPACE + code;
      else iri = SNOMED.NAMESPACE + code;
    }
    return iri;
  }

  visitWildcard(ctx) {
    console.log("found wildcard");
    console.log(ctx.getText());
    return ctx.getText();
  }

  visitEclrefinement(ctx) {
    console.log("found ecl refinement");
    console.log(ctx.getText());
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitCompoundrefinementset(ctx) {
    console.log("found compound refinement set");
    console.log(ctx.getText());
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitConjunctionrefinementset(ctx) {
    console.log("found conjunction refinement set");
    console.log(ctx.getText());
    let build = { type: "BoolGroup", test: "conjunction refinement set" };
    const results = this.visitChildren(ctx);
    if (results) {
      for (const result of results) {
        if (isObjectHasKeys(result, ["conjunction"])) {
          if (build.conjunction && build.conjunction !== result.conjunction)
            throw new Error("Conjunction differs from other conjunctions within refinement set. Logic requires bracketted conjunctions.");
          else build.conjunction = result.conjunction;
        }
        if (isObjectHasKeys(result, ["type"]) && (result.type === "Refinement" || result.type === "BoolGroup")) {
          if (build.items && _.isArray(build.items)) build.items.push(result);
          else build.items = [result];
        }
      }
    }
    return build;
  }

  visitConjunction(ctx) {
    console.log("found conjunction");
    console.log(ctx.getText());
    return { conjunction: "AND" };
  }

  visitDisjunction(ctx) {
    console.log("found disjunction");
    console.log(ctx.getText());
    return { conjunction: "OR" };
  }

  visitExclusion(ctx) {
    console.log("found exclusion");
    console.log(ctx.getText());
    return { conjunction: ctx.getText() };
  }

  visitSubrefinement(ctx) {
    console.log("found sub refinement");
    console.log(ctx.getText());
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitDot(ctx) {
    console.log("dot found");
    console.log(ctx.getText());
    throw new Error("Dot '.' is not currently supported.");
  }

  visitMemberof(ctx) {
    throw new Error("member of '^' is not currently supported.");
  }

  visitCardinality(ctx) {
    throw new Error("Cardinality is not currently supported");
  }

  visitEclattributegroup(ctx) {
    console.log("found ecl attribute group");
    console.log(ctx.getText());
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result)) return result;
        }
      }
    }
  }

  visitCompoundattributeset(ctx) {
    console.log("found compount attribute set");
    console.log(ctx.getText());
    return this.visitChildren(ctx)[0];
  }

  visitConjunctionattributeset(ctx) {
    console.log("found conjunction attribute set");
    console.log(ctx.getText());
    let build = { type: "BoolGroup", test: "conjunction attribute set" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.conjunction = result.conjunction;
          if (isObjectHasKeys(result, ["type"]) && (result.type === "Refinement" || result.type === "BoolGroup")) {
            if (build.items && _.isArray(build.items)) build.items.push(result);
            else build.items = [result];
          }
        }
      }
    }
    return build;
  }

  visitDisjunctionattributeset(ctx) {
    console.log("found disjunction attribute set");
    console.log(ctx.getText());
    let build = { type: "BoolGroup", test: "disjunction attribute set" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["conjunction"])) build.conjunction = result.conjunction;
          if (isObjectHasKeys(result, ["type"]) && (result.type === "Refinement" || result.type === "BoolGroup")) {
            if (build.items && _.isArray(build.items)) build.items.push(result);
            else build.items = [result];
          }
        }
      }
    }
    return build;
  }

  visitBracketattributeset(ctx) {
    console.log("found bracket attribute set");
    console.log(ctx.getText());
    let build = { type: "BoolGroup" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result)) {
            build.items = [result];
          }
        }
      }
    }
  }

  visitSubattributeset(ctx) {
    console.log("found sub attribute set");
    console.log(ctx.getText());
    if (ctx.children) return this.visitChildren(ctx)[0];
  }

  visitEclattribute(ctx) {
    console.log("found ecl attribute");
    console.log(ctx.getText());
    let build = { type: "Refinement" };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["type"]) && result.type === "Concept") build.property = { descendants: result.descendants, concept: result.concept };
          if (isObjectHasKeys(result, ["value"])) {
            build.value = result.value;
            build.operator = result.operator;
          }
        }
      }
    }
    return build;
  }

  visitEclattributeexpressionvalue(ctx) {
    console.log("found ecl attribute expression value");
    console.log(ctx.getText());
    let build = { value: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["operator"])) build.operator = result.operator;
          if (isObjectHasKeys(result, ["type"]) && result.type === "Concept") {
            build.value.descendants = result.descendants;
            build.value.concept = result.concept;
          }
        }
      }
    }
    return build;
  }

  visitEclattributestringvalue(ctx) {
    console.log("found ecl attribute string value");
    console.log(ctx.getText());
    let build = { value: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["operator"])) build.operator = result.operator;
          if (isObjectHasKeys(result, ["text"])) {
            build.value.concept = { iri: result.text };
          }
        }
      }
    }
    return build;
  }

  visitEclattributenumbervalue(ctx) {
    console.log("found ecl attribute number value");
    console.log(ctx.getText());
    let build = { value: {} };
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      if (results) {
        for (const result of results) {
          if (isObjectHasKeys(result, ["operator"])) build.operator = result.operator;
          if (isObjectHasKeys(result, ["number"])) {
            build.value.concept = { iri: result.number };
          }
        }
      }
    }
    return build;
  }

  visitExpressioncomparisonoperator(ctx) {
    console.log("found expression comparison operator");
    console.log(ctx.getText());
    return { operator: ctx.getText() };
  }

  visitStringcomparisonoperator(ctx) {
    console.log("found string comparison operator");
    console.log(ctx.getText());
    return { operator: ctx.getText() };
  }

  visitStringvalue(ctx) {
    console.log("found string value");
    console.log(ctx.getText());
    return { text: ctx.getText() };
  }

  visitNumericcomparisonoperator(ctx) {
    console.log("found numeric comparison operator");
    console.log(ctx.getText());
    return { operator: ctx.getText() };
  }

  visitNumericvalue(ctx) {
    console.log("found numeric value");
    console.log(ctx.getText());
    return { number: ctx.getText() };
  }

  visitBracketsubrefinement(ctx) {
    console.log("found bracket sub refinement");
    console.log(ctx.getText());
    if (ctx.children) {
      const results = this.visitChildren(ctx);
      for (const result of results) {
        if (result) return result;
      }
    }
  }

  // visitChildren(ctx) {
  //   if (!ctx) return;
  //   if (ctx.children) {
  //     return ctx.children.map(child => {
  //       if (child.children && child.children.length != 0) {
  //         return child.accept(this);
  //       } else {
  //         return child.getText();
  //       }
  //     });
  //   } else {
  //     console.log("no children");
  //     console.log(ctx.getText());
  //   }
  // }

  process;
}
