import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "your-client-id",
    authority: "https://login.microsoftonline.com/your-tenant-id",
    redirectUri: "your-redirect-uri"
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

export default msalInstance;
