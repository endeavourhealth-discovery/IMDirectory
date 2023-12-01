import setupTree from "./SetupTree";

export function validateEcl(ecl: string) {
  try {
    setupTree(ecl);
    return true;
  } catch (error) {
    return false;
  }
}
