<template>
  <div id="mfa-help">
    <h1>Setting up 2-factor authentication</h1>
    <div class="content">
      <p>
        2-factor authentication uses an app on your mobile device to verify your identity as an extra layer of security for your account. These apps provide a
        time-sensitive code which is linked with your account. The code is then required each time you login, in addition to your password.
      </p>
      <p>To setup this, first download your prefered authenticator app and follow their instructions for setup.</p>
      <p>Some popular authenticator apps are:</p>
      <ul>
        <li>
          <IMFontAwesomeIcon icon="fa-brands fa-google" />
          <Button link as="a" class="p-0" href="https://support.google.com/accounts/answer/1066447?hl=en&co=GENIE.Platform%3DiOS">
            Google authenticator
          </Button>
        </li>
        <li>
          <IMFontAwesomeIcon icon="fa-brands fa-microsoft" />
          <Button
            link
            as="a"
            class="p-0"
            href="https://support.microsoft.com/en-us/account-billing/download-and-install-the-microsoft-authenticator-app-351498fc-850a-45da-b7b6-27e523b8702a"
          >
            Microsoft Authenticator
          </Button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
#mfa-help {
  display: flex;
  flex-flow: column nowrap;
  padding: 1rem;
  overflow: auto;
  width: 80vw;
}

.content {
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  padding: 1rem;
}
</style>
