import { ECLComponent } from "../expressionConstraintsLanguage/ECLComponent";
import { ECLType } from "../expressionConstraintsLanguage/ECLType";

export interface ComponentDetails {
  id: string;
  value: any;
  position: number;
  type: ECLType;
  label: any;
  component: ECLComponent;
}
