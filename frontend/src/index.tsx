import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";
import "./index.css";
import Layout from "./pages/layout/Layout";
import HamburgerMenu from "./components/HamburgerMenu";
import NoPage from "./pages/NoPage";
import HomeScreen from "./pages/HomeScreen";
import Chat from "./pages/chat/Chat";
import ProfileScreen from "./pages/ProfileScreen";
import { AppStateProvider } from "./state/AppProvider";
import { MsalProvider, useIsAuthenticated } from "@azure/msal-react";
import msalInstance from './msalConfig';
import UserDetailsComponent from './components/UserDetailsComponent';
import GoalsPage from "./pages/GoalsPage";


const App = () => {
    initializeIcons();
    
    return (
       <MsalProvider instance={msalInstance}>
            <AppStateProvider>
                <BrowserRouter>
                    <HamburgerMenu />
                    {/* Render UserDetailsComponent only if the user is authenticated */}
                    {useIsAuthenticated() && <UserDetailsComponent />}
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<HomeScreen />} />
                            <Route path="chat" element={<Chat />} />
                            <Route path="goals" element={<GoalsPage />} />
                            <Route path="profile" element={<ProfileScreen />} />
                            <Route path="*" element={<NoPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AppStateProvider>
        </MsalProvider>
    );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
