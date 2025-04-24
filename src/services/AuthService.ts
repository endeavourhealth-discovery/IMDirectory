import { isObjectHasKeys } from "@/helpers/DataTypeCheckers";
import { CustomAlert, User } from "@/interfaces";
import {
  AuthError,
  AuthSession,
  autoSignIn,
  confirmResetPassword,
  confirmSignIn,
  confirmSignUp,
  confirmUserAttribute,
  fetchAuthSession,
  fetchMFAPreference,
  FetchMFAPreferenceOutput,
  fetchUserAttributes,
  FetchUserAttributesOutput,
  getCurrentUser,
  GetCurrentUserOutput,
  resendSignUpCode,
  resetPassword,
  setUpTOTP,
  signIn,
  signOut,
  signUp,
  SignUpOutput,
  verifyTOTPSetup,
  updateMFAPreference,
  updatePassword,
  updateUserAttributes
} from "aws-amplify/auth";
import axios from "axios";
import Env from "./Env";
import { useUserStore } from "@/stores/userStore";
import { Avatars } from "@/constants";

function processAwsUser(cognitoUser: GetCurrentUserOutput, userAttributes: FetchUserAttributesOutput, authSession: AuthSession, mfa: FetchMFAPreferenceOutput) {
  if (!isObjectHasKeys(cognitoUser, ["userId", "username"]) || !isObjectHasKeys(userAttributes, ["email", "custom:forename", "custom:surname"]))
    throw new Error("Unable to process aws user");
  return {
    id: cognitoUser.userId,
    username: cognitoUser.username,
    firstName: userAttributes["custom:forename"],
    lastName: userAttributes["custom:surname"],
    email: userAttributes.email,
    password: "",
    avatar: userAttributes["custom:avatar"] ?? "",
    roles: authSession.tokens?.accessToken?.payload["cognito:groups"] ?? [],
    mfaStatus: mfa.preferred ? [mfa.preferred] : []
  } as User;
}

const AuthService = {
  async getConfig(): Promise<any> {
    return axios.get(Env.API + "api/cognito/public/config");
  },

  async register(userToRegister: User): Promise<CustomAlert> {
    try {
      const { isSignUpComplete, nextStep, userId }: SignUpOutput = await signUp({
        username: userToRegister.username,
        password: userToRegister.password,
        options: {
          userAttributes: {
            email: userToRegister.email,
            "custom:forename": userToRegister.firstName,
            "custom:surname": userToRegister.lastName,
            "custom:avatar": userToRegister.avatar
          },
          autoSignIn: true
        }
      });
      switch (nextStep.signUpStep) {
        case "DONE": {
          if (isSignUpComplete) return { status: 201, message: "User registered successfully" };
          else return { status: 400, message: "Registration failed" };
        }
        case "CONFIRM_SIGN_UP":
        case "COMPLETE_AUTO_SIGN_IN":
          return { status: 201, message: "Additional step required", nextStep: nextStep.signUpStep };
        default:
          throw new Error(`Unhandled signup next step: ${nextStep}`);
      }
    } catch (err: any) {
      if (err instanceof AuthError) {
        if (err.name === "UsernameExistsException") {
          return { status: 409, message: "Username already exists", error: err };
        } else {
          throw new Error("Unhandled AWS amplify error", err);
        }
      } else {
        throw err;
      }
    }
  },

  async isEmailRegistered(email: string): Promise<boolean> {
    return axios.get(Env.API + "api/cognito/public/isEmailRegistered", { params: { email: email } });
  },

  async confirmRegister(username: string, code: string): Promise<CustomAlert> {
    try {
      const { isSignUpComplete, userId, nextStep } = await confirmSignUp({ username: username, confirmationCode: code });
      switch (nextStep.signUpStep) {
        case "DONE": {
          if (isSignUpComplete) {
            return { status: 200, message: "Register confirmation successful" };
          } else {
            return { status: 403, message: "Failed register confirmation" };
          }
        }
        case "COMPLETE_AUTO_SIGN_IN":
        case "CONFIRM_SIGN_UP":
          return { status: 403, message: "Additional step required", nextStep: nextStep.signUpStep };
      }
    } catch (err: any) {
      return { status: 403, message: "Failed register confirmation", error: err };
    }
  },

  async signIn(username: string, password: string): Promise<CustomAlert> {
    try {
      const { isSignedIn, nextStep } = await signIn({ username: username, password: password });
      switch (nextStep.signInStep) {
        case "CONFIRM_SIGN_IN_WITH_TOTP_CODE":
        case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
        case "RESET_PASSWORD":
        case "CONFIRM_SIGN_UP":
        case "CONTINUE_SIGN_IN_WITH_TOTP_SETUP":
          return { status: 403, message: "Additional step required", nextStep: nextStep.signInStep };
        case "DONE":
          if (isSignedIn) {
            await this.getCurrentAuthenticatedUser();
            return { status: 200, message: "Login successful" };
          } else return { status: 400, message: "Login failed" };
        case "CONTINUE_SIGN_IN_WITH_MFA_SELECTION":
        case "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE":
        case "CONFIRM_SIGN_IN_WITH_SMS_CODE":
        default:
          throw new Error(`Unhandled signin next step: ${nextStep}`);
      }
    } catch (err: any) {
      if (err.message === "Temporary password has expired and must be reset by an administrator.") {
        return { status: 403, message: err.message, error: err };
      }
      if (err.name === "UserAlreadyAuthenticatedException") return { status: 200, message: "Login successful" };
      return { status: 403, message: "Login failed. Check username and password are correct", error: err };
    }
  },

  async handleAutoSignIn(): Promise<void> {
    await autoSignIn();
    await this.getCurrentAuthenticatedUser();
  },

  async resendConfirmationCode(username: string): Promise<CustomAlert> {
    try {
      await resendSignUpCode({ username: username });
      return { status: 200, message: "Code resent successfully" };
    } catch (err: any) {
      return { status: 400, message: err.message, error: err };
    }
  },

  async signOut(): Promise<CustomAlert> {
    try {
      await signOut({ global: true });
      const userStore = useUserStore();
      userStore.updateCurrentUser(undefined);
      userStore.clearAllFromUserDatabase();
      userStore.clearAllFromLocalStorage();
      return { status: 200, message: "Logged out successfully" };
    } catch (err: any) {
      return { status: 400, message: "Error logging out from auth server", error: err };
    }
  },

  async updateUser(userToUpdate: User): Promise<CustomAlert> {
    try {
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
      const result = await updateUserAttributes({ userAttributes: atts });
      if (!result.email.isUpdated) {
        if (result.email.nextStep.updateAttributeStep === "CONFIRM_ATTRIBUTE_WITH_CODE") return { status: 403, message: "Confirm with email code" };
      }
      await this.getCurrentAuthenticatedUser();
      return { status: 200, message: "User updated successfully" };
    } catch (err: any) {
      return { status: 500, message: "Error authenticating current user" };
    }
  },

  async verifyEmail(code: string) {
    try {
      await confirmUserAttribute({ userAttributeKey: "email", confirmationCode: code });
      return { status: 200, message: "Email verified successfully" };
    } catch (err: any) {
      return { status: 500, message: "Error verifying email", error: err };
    }
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<CustomAlert> {
    try {
      await updatePassword({ oldPassword: oldPassword, newPassword: newPassword });
      return { status: 200, message: "Password successfully changed" };
    } catch (err: any) {
      return { status: 400, message: err.message, error: err };
    }
  },

  async forgotPassword(username: string): Promise<CustomAlert> {
    try {
      const { isPasswordReset, nextStep } = await resetPassword({ username: username });
      switch (nextStep.resetPasswordStep) {
        case "DONE":
          return { status: 200, message: "Password has been reset" };
        case "CONFIRM_RESET_PASSWORD_WITH_CODE":
          return { status: 200, message: "Password reset request sent to server", nextStep: nextStep.resetPasswordStep };
        default:
          throw new Error(`Unhandled reset password next step: ${nextStep}`);
      }
    } catch (err: any) {
      return { status: 400, message: "Error resetting password from server", error: err };
    }
  },

  async forgotPasswordSubmit(username: string, code: string, newPassword: string): Promise<CustomAlert> {
    try {
      await confirmResetPassword({ username: username, confirmationCode: code, newPassword: newPassword });
      return { status: 200, message: "Password reset successfully" };
    } catch (err: any) {
      if (err.code === "ExpiredCodeException") {
        return { status: 403, message: "Code has expired", error: err };
      }
      return { status: 400, message: "Error submitting password-reset credentials", error: err };
    }
  },

  async getCurrentAuthenticatedUser(): Promise<CustomAlert> {
    try {
      const cognitoUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      const tokens = await fetchAuthSession();
      const mfa = await fetchMFAPreference();
      const authenticatedUser = processAwsUser(cognitoUser, userAttributes, tokens, mfa);
      if (!authenticatedUser.avatar || !Avatars.find((avatar: string) => avatar === authenticatedUser.avatar)) {
        authenticatedUser.avatar = Avatars[0];
        await this.updateUser(authenticatedUser);
      }
      const userStore = useUserStore();
      userStore.updateCurrentUser(authenticatedUser);
      if (userStore.$state.currentUser?.id !== authenticatedUser.id) await userStore.getAllFromUserDatabase();
      return { status: 200, message: "User authenticated successfully", user: authenticatedUser };
    } catch (err: any) {
      return { status: 403, message: "Error authenticating current user", error: err };
    }
  },

  async getMfaToken(): Promise<URL> {
    const output = await setUpTOTP();
    return output.getSetupUri("Cognito");
  },

  async mfaSignIn(mfaCode: string): Promise<CustomAlert> {
    try {
      const { isSignedIn, nextStep } = await confirmSignIn({ challengeResponse: mfaCode });
      switch (nextStep.signInStep) {
        case "DONE": {
          if (isSignedIn) {
            await this.getCurrentAuthenticatedUser();
            return { status: 200, message: "Login successful" };
          } else {
            return { status: 403, message: "Error authenticating current user" };
          }
        }
        case "RESET_PASSWORD":
        case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
        case "CONFIRM_SIGN_UP":
          return { status: 403, message: "Additional step required", nextStep: nextStep.signInStep };
        default:
          throw new Error(`Unhandled mfa signin next step: ${nextStep}`);
      }
    } catch (err: any) {
      return { status: 403, message: "Error authenticating current user", error: err };
    }
  },

  async setMfaPreference(preference: "TOTP" | "SMS" | "NOMFA" | "SMS_MFA" | "SOFTWARE_TOKEN_MFA") {
    try {
      switch (preference) {
        case "NOMFA":
          await updateMFAPreference({ sms: "DISABLED", totp: "DISABLED" });
          break;
        case "SMS":
          await updateMFAPreference({ sms: "PREFERRED", totp: "DISABLED" });
          break;
        case "TOTP":
          await updateMFAPreference({ sms: "DISABLED", totp: "PREFERRED" });
          break;
        case "SMS_MFA":
          await updateMFAPreference({ sms: "ENABLED", totp: "PREFERRED" });
          break;
      }
    } catch (error: any) {
      throw new Error("Failed to set user mfa preference", error);
    }
  },

  async verifyMFAToken(token: string) {
    await verifyTOTPSetup({ code: token });
  }
};

if (process.env.NODE_ENV !== "test") Object.freeze(AuthService);

export default AuthService;
