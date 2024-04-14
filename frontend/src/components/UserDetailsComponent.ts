import React, { useEffect, useContext } from 'react';
import { useMsal } from "@azure/msal-react";
import { AppStateContext } from '../state/AppProvider'; // Adjust path as needed

const { dispatch } = useContext(AppStateContext) ?? {};

const UserDetailsComponent = () => {
  const { instance, accounts } = useMsal();
  const { dispatch } = useContext(AppStateContext);

  useEffect(() => {
    const userId = accounts[0]?.localAccountId;

    if (userId) {
      // Dispatch action to set user ID globally
      dispatch({ type: 'SET_USER_ID', payload: userId });
    }
  }, [accounts, dispatch]);

  return null; // This component doesn't render anything
};

export default UserDetailsComponent;
