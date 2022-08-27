import { Auth } from "aws-amplify";
import { Models } from "im-library";
const { User, CustomAlert } = Models;

export default {
  async signOut(): Promise<Models.CustomAlert> {
    try {
      await Auth.signOut({ global: true });
      return new CustomAlert(200, "Logged out successfully");
    } catch (err) {
      return new CustomAlert(400, "Error logging out from auth server", err as any);
    }
  },

  async getCurrentAuthenticatedUser(): Promise<Models.CustomAlert> {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();

      const authenticatedUser = new User(
        cognitoUser.username,
        cognitoUser.attributes["custom:forename"],
        cognitoUser.attributes["custom:surname"],
        cognitoUser.attributes.email,
        "",
        cognitoUser.attributes["custom:avatar"],
        cognitoUser?.signInUserSession?.accessToken?.payload["cognito:groups"] || []
      );
      authenticatedUser.setId(cognitoUser.attributes.sub);
      return new CustomAlert(200, "User authenticated successfully", undefined, authenticatedUser);
    } catch (err) {
      return new CustomAlert(403, "Error authenticating current user", err as any);
    }
  }
};
