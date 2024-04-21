import React, { useEffect } from 'react';
import { useMsal } from "@azure/msal-react";

const UserDetailsComponent = () => {
    const { instance, accounts } = useMsal();

    useEffect(() => {
        if (accounts.length === 0) {
            instance.loginRedirect({ scopes: ["openid", "profile"] });
            return;
        }

        const account = accounts[0];
        instance.acquireTokenSilent({
            scopes: ["openid", "profile"],
            account
        }).then(response => {
            // Safely accessing idTokenClaims with optional chaining
            const userId = response.account?.idTokenClaims?.oid ?? null;
            if (userId) {
                console.log("User ID:", userId);
                // Dispatch action to store userID in your application state or context
            }
        }).catch(err => {
            console.error("Token acquisition failed", err);
            instance.loginRedirect({ scopes: ["openid", "profile"] });
        });
    }, [instance, accounts]);

    return null;
};

export default UserDetailsComponent;
