import { vueMarkupFormatter } from "vue3-snapshot-serializer";
import { diffChars } from "diff";
import Chainable = Cypress.Chainable;
import Assertion = Chai.Assertion;

declare global {
  var vueSnapshots: any;
}

interface SnapshotMeta {
  counters: {
    [key: string]: {
      index: number;
    };
  };
  snapshots: {
    [key: string]: string[];
  };
  updated: string[];
}

const snapshotMeta: SnapshotMeta = { counters: {}, snapshots: {}, updated: [] };

export function toMatchSnapshot(element: any, options?: any): Chainable<Assertion> {
  globalThis.vueSnapshots = options ?? {
    formatting: {},
    debug: true
  };

  const id =
    (Cypress.spec.relative.startsWith("__") ? "" : Cypress.spec.relative.replace("cypress\\e2e\\", "").replace(".feature", "\\")) +
    Cypress.currentTest.titlePath.join("\\");
  console.log("Relative: " + Cypress.spec.relative);

  let snapshot = snapshotMeta.snapshots[id];
  const actual = vueMarkupFormatter(element.html());

  if (snapshot) {
    let counter = snapshotMeta.counters[id].index++;
    if (counter < snapshot.length) {
      return cy.wrap(doCompare(snapshot[counter], actual));
    } else {
      snapshot.push(actual);
      snapshotMeta.updated.push(id);
      return cy.wrap(expect(snapshot[counter]).to.equal(actual));
    }
  }

  return cy.task("readFileMaybe", ".\\cypress\\snapshots\\" + id + ".js").then(data => {
    if (data != null) {
      snapshot = (0, eval)(data as string);
    } else {
      snapshot = [actual];
      snapshotMeta.updated.push(id);
    }
    snapshotMeta.snapshots[id] = snapshot;
    snapshotMeta.counters[id] = { index: 1 };
    return doCompare(snapshot[0], actual);
  });
}

function doCompare(one: string, other: string) {
  if (one != other) {
    const diff = diffChars(one, other);
    let text = "";
    let color = "unset";
    let styles: string[] = [];
    diff.forEach(part => {
      if (part.added && color != "green") {
        text += "%c";
        color = "green";
        styles.push("color: green; font-weight: bold");
      } else if (part.removed && color != "red") {
        text += "%c";
        color = "red";
        styles.push("color: red; font-weight: bold");
      } else {
        text += "%c";
        color = "unset";
        styles.push("color: unset; font-weight: regular");
      }
      text += part.value;
    });
    console.error("Snapshot mismatch - " + Cypress.spec.relative + ": " + Cypress.currentTest.titlePath.join(" > "));
    console.log(text, ...styles);
  }
  return expect(one).to.equal(other);
}

after(() => {
  console.log("Writing snapshots");
  if (snapshotMeta.updated.length > 0) {
    for (let id of snapshotMeta.updated) {
      const data = snapshotMeta.snapshots[id].map((s, index) => "snapshot[" + index + "] = `" + s + "`;\n").join("\n");
      console.log("Writing cypress/snapshots/" + id + ".js");
      cy.writeFile("cypress/snapshots/" + id + ".js", "const snapshot = [];\n\n" + data + "\nsnapshot;");
    }
  }
});
