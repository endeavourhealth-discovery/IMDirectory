import { glob } from "glob";
import fs from "fs";

const files = glob.sync("cypress/e2e/**/*.cy.js");
let foundOnly = false;

files.forEach(file => {
  const content = fs.readFileSync(file, "utf-8");
  if (content.includes(".only")) {
    console.error(`Found .only in file: ${file}`);
    foundOnly = true;
  }
});

if (foundOnly) {
  process.exit(1);
} else {
  console.log("No .only found.");
}
