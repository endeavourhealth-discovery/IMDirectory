import { isObjectHasKeys } from "@im-library/helpers/DataTypeCheckers";
import { CustomAlert, User } from "@im-library/interfaces";
import { Auth } from "aws-amplify";
import axios from "axios";
import Env from "./Env";

function processAwsUser(cognitoUser: any) {
  return {
    id: cognitoUser.attributes.sub,
    username: cognitoUser.username,
    firstName: cognitoUser.attributes["custom:forename"],
    lastName: cognitoUser.attributes["custom:surname"],
    email: cognitoUser.attributes.email,
    password: "",
    avatar: cognitoUser.attributes["custom:avatar"],
    roles: cognitoUser.signInUserSession?.accessToken?.payload["cognito:groups"] ?? [],
    mfaStatus: cognitoUser.userMfaSettingList ?? []
  } as User;
}

const AuthService = {
  async register(userToRegister: User): Promise<CustomAlert> {
    try {
      await Auth.signUp({
        username: userToRegister.username,
        password: userToRegister.password,
        attributes: {
          email: userToRegister.email,
          "custom:forename": userToRegister.firstName,
          "custom:surname": userToRegister.lastName,
          "custom:avatar": userToRegister.avatar
        }
      });
      return { status: 201, message: "User registered successfully" } as CustomAlert;
    } catch (err: any) {
      if (err.code === "UsernameExistsException") {
        return { status: 409, message: "Username already exists", error: err } as CustomAlert;
      } else {
        return { status: 400, message: "Username registration failed", error: err } as CustomAlert;
      }
    }
  },

  async isEmailRegistered(email: string): Promise<boolean> {
    return axios.get(Env.VITE_NODE_API + "node_api/cognito/public/isEmailRegistered", { params: { email: email } });
  },

  async confirmRegister(username: string, code: string): Promise<CustomAlert> {
    try {
      await Auth.confirmSignUp(username, code);
      return { status: 200, message: "Register confirmation successful" } as CustomAlert;
    } catch (err: any) {
      return { status: 403, message: "Failed register confirmation", error: err } as CustomAlert;
    }
  },

  async signIn(username: string, password: string): Promise<CustomAlert> {
    try {
      const user = await Auth.signIn(username, password);
      if (isObjectHasKeys(user, ["challengeName"])) {
        return { status: 403, message: user.challengeName, error: undefined, user: user };
      }
      const signedInUser = processAwsUser(user);
      return { status: 200, message: "Login successful", error: undefined, user: signedInUser, userRaw: user } as CustomAlert;
    } catch (err: any) {
      if (err.code === "UserNotConfirmedException") {
        return { status: 401, message: err.message, error: err } as CustomAlert; //message: "User is not confirmed."
      }
      return { status: 403, message: "Login failed. Check username and password are correct", error: err } as CustomAlert;
    }
  },

  async resendConfirmationCode(username: string): Promise<CustomAlert> {
    try {
      await Auth.resendSignUp(username);
      return { status: 200, message: "Code resent successfully" } as CustomAlert;
    } catch (err: any) {
      return { status: 400, message: "Error resending code", error: err } as CustomAlert;
    }
  },

  async signOut(): Promise<CustomAlert> {
    try {
      await Auth.signOut({ global: true });
      return { status: 200, message: "Logged out successfully" } as CustomAlert;
    } catch (err: any) {
      return { status: 400, message: "Error logging out from auth server", error: err } as CustomAlert;
    }
  },

  async updateUser(userToUpdate: User): Promise<CustomAlert> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      if (user.attributes.sub === userToUpdate.id) {
        const atts: {
          email: string;
          "custom:forename": string;
          "custom:surname": string;
          "custom:avatar": string;
        } = {
          email: userToUpdate.email,
          "custom:forename": userToUpdate.firstName,
          "custom:surname": userToUpdate.lastName,
          "custom:avatar": userToUpdate.avatar
        };
        await Auth.updateUserAttributes(user, atts);
        const updateResults = await Auth.currentAuthenticatedUser();
        const updatedUser = processAwsUser(updateResults);
        return { status: 200, message: "User updated successfully", error: undefined, user: updatedUser, userRaw: updateResults } as CustomAlert;
      } else {
        return { status: 403, message: "Authentication error with server" } as CustomAlert;
      }
    } catch (err: any) {
      return { status: 500, message: "Error authenticating current user", error: err } as CustomAlert;
    }
  },

  async verifyEmail(code: string) {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit("email", code);
      return { status: 200, message: "Email verified successfully" } as CustomAlert;
    } catch (err: any) {
      return { status: 500, message: "Error verifying email", error: err } as CustomAlert;
    }
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<CustomAlert> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(user, oldPassword, newPassword);
      return { status: 200, message: "Password successfully changed" } as CustomAlert;
    } catch (err: any) {
      return { status: 400, message: err.message, error: err } as CustomAlert;
    }
  },

  async forgotPassword(username: string): Promise<CustomAlert> {
    try {
      await Auth.forgotPassword(username);
      return { status: 200, message: "Password reset request sent to server" } as CustomAlert;
    } catch (err: any) {
      return { status: 400, message: "Error resetting password from server", error: err } as CustomAlert;
    }
  },

  async forgotPasswordSubmit(username: string, code: string, newPassword: string): Promise<CustomAlert> {
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
      return { status: 200, message: "Password reset successfully" } as CustomAlert;
    } catch (err: any) {
      if (err.code === "ExpiredCodeException") {
        return { status: 403, message: "Code has expired", error: err } as CustomAlert;
      }
      return { status: 400, message: "Error submitting password-reset credentials", error: err } as CustomAlert;
    }
  },

  async forgotUsername(email: string): Promise<CustomAlert> {
    try {
      await Auth.verifyCurrentUserAttribute(email);
      return { status: 200, message: "Account recovery code sent" } as CustomAlert;
    } catch (err: any) {
      return { status: 400, message: "Error submitting email", error: err } as CustomAlert;
    }
  },

  async getCurrentAuthenticatedUser(): Promise<CustomAlert> {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const authenticatedUser = processAwsUser(cognitoUser);
      return { status: 200, message: "User authenticated successfully", error: undefined, user: authenticatedUser, userRaw: cognitoUser } as CustomAlert;
    } catch (err: any) {
      return { status: 403, message: "Error authenticating current user", error: err } as CustomAlert;
    }
  },

  async getMfaToken(user: any): Promise<string> {
    return await Auth.setupTOTP(user);
  },

  async mfaSignIn(user: any, mfaToken: string) {
    try {
      await Auth.verifyTotpToken(user, mfaToken);
      const authorizedUser = await Auth.currentAuthenticatedUser();
      const signedInUser = processAwsUser(authorizedUser);
      return { status: 200, message: "Login successful", error: undefined, user: signedInUser, userRaw: user } as CustomAlert;
    } catch (err: any) {
      return { status: 403, message: "Error authenticating current user", error: err } as CustomAlert;
    }
  }

  // currently not a feature with AWS Auth
  // async forgotUsernameSubmit(email: string, code: string): Promise<CustomAlert> {
  //   try {
  //     await Auth.(email, code); // finish this if ever becomes a feature
  //     return new CustomAlert(200, "Account recovered successfully");
  //   } catch (err: any) {
  //     console.error(err);
  //     if (err.code === "ExpiredCodeException"){
  //       return new CustomAlert(403, "Code has expired", err);
  //     }
  //     return new CustomAlert(400, "Error submitting account recovery credentials", err);
  //   }
  // },
};

if (process.env.NODE_ENV !== "test") Object.freeze(AuthService);

export default AuthService;
