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

  public async updateEmailVerified(username: string, emailVerified: boolean): Promise<void> {
    const params = { UserPoolId: this.config.userPoolId, UserAttributes: [{ Name: "email_verified", Value: emailVerified.toString() }], Username: username };
    await this.cognitoIdentity.adminUpdateUserAttributes(params);
  }
}
