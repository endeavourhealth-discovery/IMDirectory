import { fetchAuthSession, signIn } from "aws-amplify/auth";
import { Amplify } from "aws-amplify";

Amplify.configure({
  aws_project_region: "eu-west-2",
  aws_cognito_identity_pool_id: "eu-west-2:a9f46df7-f27e-4cc5-827b-d573ecf20667",
  aws_cognito_region: "eu-west-2",
  aws_user_pools_id: "eu-west-2_Vt5ScFwss",
  aws_user_pools_web_client_id: "57ihu3fqv3tidnj99dc5uicrgl",
  oauth: {},
  aws_cognito_username_attributes: [],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: ["SMS"],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: []
  },
  aws_cognito_verification_mechanisms: ["EMAIL"]
} as any);

const fetchJwts = async (username: string, password: string) => {
  // const options = { authFlowType: "USER_PASSWORD_AUTH" as const };
  await signIn({ username, password });
  const authSession = await fetchAuthSession();
  const tokens = authSession.tokens!;
  const accessToken = tokens.accessToken;
  const accessTokenPayload = accessToken.payload;
  return {
    idToken: tokens.idToken!.toString(),
    accessToken: accessToken.toString(),
    clientId: accessTokenPayload.client_id as string,
    accessTokenSub: accessTokenPayload.sub!
  };
};
type JwtResponse = Awaited<ReturnType<typeof fetchJwts>>;

// Amazon Cognito
Cypress.Commands.add(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  "loginByCognitoApi",
  (username: string, password: string) => {
    const log = Cypress.log({
      displayName: "COGNITO LOGIN",
      message: [`🔐 Authenticating | ${username}`],
      autoEnd: false
    });

    log.snapshot("before");

    cy.wrap(fetchJwts(username, password), { log: false }).then(unknownJwts => {
      const { idToken, accessToken, clientId, accessTokenSub } = unknownJwts as JwtResponse;

      const keyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
      const keyPrefixWithUsername = `${keyPrefix}.${accessTokenSub}`;

      const ls = window.localStorage;
      ls.setItem("cognitoKeyPrefixWithUsername", keyPrefixWithUsername);
      ls.setItem(`${keyPrefixWithUsername}.idToken`, idToken);
      ls.setItem(`${keyPrefixWithUsername}.accessToken`, accessToken);
      ls.setItem(`${keyPrefix}.LastAuthUser`, accessTokenSub);

      log.snapshot("after");
      log.end();
    });
  }
);
