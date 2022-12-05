import AWS from "aws-sdk";
import Env from "@/services/env.service";

class CognitoService {
  private config = {
    region: Env.COGNITO_REGION
  };

  private cognitoIdentity;

  constructor() {
    this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config);
  }
}
