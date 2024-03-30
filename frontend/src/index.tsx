import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";

import "./index.css";

import Layout from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import HomeScreen from "./pages/HomeScreen";
import Chat from "./pages/chat/Chat";
import { AppStateProvider } from "./state/AppProvider";
import ProfileScreen from "./pages/ProfileScreen";
import ItemsList from "./pages/ItemsList";

function App() {
    initializeIcons(); // Ensure this is called once in your app entry file
    return (
        <AppStateProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomeScreen />} />
                        <Route path="chat" element={<Chat />} />
                        <Route path="profile" element={<ProfileScreen />} />
                        <Route path="items" element={<ItemsList />} />
                        <Route path="*" element={<NoPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AppStateProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
