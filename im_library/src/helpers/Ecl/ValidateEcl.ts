import setupTree from "./SetupTree";

export default function validateEcl(ecl: string) {
  try {
    const tree = setupTree(ecl);
    return true;
  } catch (error) {
    return false;
  }
}
