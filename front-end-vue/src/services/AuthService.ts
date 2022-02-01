import { Auth } from "aws-amplify";
import { User } from "@/models/user/User";
import { CustomAlert } from "@/models/user/CustomAlert";

export default {
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
      return new CustomAlert(201, "User registered successfully");
    } catch (err) {
      if (err.code === "UsernameExistsException") {
        return new CustomAlert(409, "Username already exists", err);
      } else {
        return new CustomAlert(400, "User registration failed", err);
      }
    }
  },

  async confirmRegister(username: string, code: string): Promise<CustomAlert> {
    try {
      await Auth.confirmSignUp(username, code);
      return new CustomAlert(200, "Register confirmation successful");
    } catch (err) {
      return new CustomAlert(403, "Failed register confirmation", err);
    }
  },

  async signIn(username: string, password: string): Promise<CustomAlert> {
    try {
      const user = await Auth.signIn(username, password);
      const signedInUser = new User(
        user.username,
        user.attributes["custom:forename"],
        user.attributes["custom:surname"],
        user.attributes.email,
        "",
        user.attributes["custom:avatar"]
      );
      signedInUser.setId(user.attributes.sub);
      return new CustomAlert(200, "Login successful", undefined, signedInUser);
    } catch (err) {
      if (err.code === "UserNotConfirmedException") {
        return new CustomAlert(401, err.message, err); //message: "User is not confirmed."
      }
      return new CustomAlert(403, "Login failed. Check username and password are correct", err);
    }
  },

  async resendConfirmationCode(username: string): Promise<CustomAlert> {
    try {
      await Auth.resendSignUp(username);
      return new CustomAlert(200, "Code resent successfully");
    } catch (err) {
      return new CustomAlert(400, "Error resending code", err);
    }
  },

  async signOut(): Promise<CustomAlert> {
    try {
      await Auth.signOut({ global: true });
      return new CustomAlert(200, "Logged out successfully");
    } catch (err) {
      return new CustomAlert(400, "Error logging out from auth server", err);
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
        const updatedUser = new User(
          updateResults.username,
          updateResults.attributes["custom:forename"],
          updateResults.attributes["custom:surname"],
          updateResults.attributes.email,
          "",
          updateResults.attributes["custom:avatar"]
        );
        updatedUser.setId(updateResults.attributes.sub);
        return new CustomAlert(200, "User updated successfully", undefined, updatedUser);
      } else {
        return new CustomAlert(403, "Authentication error with server");
      }
    } catch (err) {
      return new CustomAlert(500, "Error authenticating current user", err);
    }
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<CustomAlert> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(user, oldPassword, newPassword);
      return new CustomAlert(200, "Password successfully changed");
    } catch (err) {
      return new CustomAlert(400, err.message, err);
    }
  },

  async forgotPassword(username: string): Promise<CustomAlert> {
    try {
      await Auth.forgotPassword(username);
      return new CustomAlert(200, "Password reset request sent to server");
    } catch (err) {
      return new CustomAlert(400, "Error resetting password from server", err);
    }
  },

  async forgotPasswordSubmit(username: string, code: string, newPassword: string): Promise<CustomAlert> {
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
      return new CustomAlert(200, "Password reset successfully");
    } catch (err) {
      if (err.code === "ExpiredCodeException") {
        return new CustomAlert(403, "Code has expired", err);
      }
      return new CustomAlert(400, "Error submitting password-reset credentials", err);
    }
  },

  async forgotUsername(email: string): Promise<CustomAlert> {
    try {
      await Auth.verifyCurrentUserAttribute(email);
      return new CustomAlert(200, "Account recovery code sent");
    } catch (err) {
      return new CustomAlert(400, "Error submitting email", err);
    }
  },

  async getCurrentAuthenticatedUser(): Promise<CustomAlert> {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const authenticatedUser = new User(
        cognitoUser.username,
        cognitoUser.attributes["custom:forename"],
        cognitoUser.attributes["custom:surname"],
        cognitoUser.attributes.email,
        "",
        cognitoUser.attributes["custom:avatar"]
      );
      authenticatedUser.setId(cognitoUser.attributes.sub);
      return new CustomAlert(200, "User authenticated successfully", undefined, authenticatedUser);
    } catch (err) {
      return new CustomAlert(403, "Error authenticating current user", err);
    }
  }

  // currently not a feature with AWS Auth
  // async forgotUsernameSubmit(email: string, code: string): Promise<CustomAlert> {
  //   try {
  //     await Auth.(email, code); // finish this if ever becomes a feature
  //     return new CustomAlert(200, "Account recovered successfully");
  //   } catch (err) {
  //     console.error(err);
  //     if (err.code === "ExpiredCodeException"){
  //       return new CustomAlert(403, "Code has expired", err);
  //     }
  //     return new CustomAlert(400, "Error submitting account recovery credentials", err);
  //   }
  // },
};
