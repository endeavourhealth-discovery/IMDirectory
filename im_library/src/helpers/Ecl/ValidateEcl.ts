import setupTree from "./SetupTree";

export function validateEcl(ecl: string) {
  try {
    const tree = setupTree(ecl);
    return true;
  } catch (error) {
    return false;
  }
}
