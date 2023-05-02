import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import Env from "@/services/env.service";

export default class CognitoService {
  private config = {
    region: Env.COGNITO_REGION,
    userPoolId: Env.COGNITO_USER_POOL
  };

  private cognitoIdentity;

  constructor() {
    this.cognitoIdentity = new CognitoIdentityProvider(this.config);
  }

  public async isEmailRegistered(email: string) {
    const params = { UserPoolId: this.config.userPoolId, AttributesToGet: ["email"], Filter: 'email = "' + email + '"' };
    const results = await this.cognitoIdentity.listUsers(params);
    return results.Users?.length !== 0;
  }
}
