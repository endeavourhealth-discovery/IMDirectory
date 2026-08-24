import { execSync } from "node:child_process";

const files = execSync("git diff --cached --name-only --diff-filter=ACMR", { encoding: "utf8" }).split("\n").filter(Boolean);

for (const file of files) {
  if (file !== "package.json" && file !== "pnpm-lock.yaml") continue;

  const content = execSync(`git show :${file}`, { encoding: "utf8" });

  if (content.includes('@endeavour/vue-library') && content.includes("link:../VueLibrary")) {
    console.error(
      "\nLocal VueLibrary must be unlinked before committing.\nPlease use 'pnpm unlink' before committing either package.json or pnpm-lock.yaml.\n"
    );
    process.exit(1);
  }
}
process.exit(0);
