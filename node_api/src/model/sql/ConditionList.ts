import { Condition } from "./Condition";

export class ConditionList {
  public operator: string = "AND";
  public conditions: Condition[] = [];
}
