import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "bab0cbca-ef97-4e2e-a4f3-672fee2234c7",
    authority: "https://login.microsoftonline.com/e4cf3bcd-af2d-4529-ba4a-abd9a0a0f0e1",
    redirectUri: window.location.origin  }
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;
