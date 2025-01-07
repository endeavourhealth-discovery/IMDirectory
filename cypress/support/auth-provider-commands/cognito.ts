import { fetchAuthSession, signIn } from "aws-amplify/auth";

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
