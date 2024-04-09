import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";

import "./index.css";

import Layout from "./pages/layout/Layout";
import NoPage from "./pages/NoPage";
import HomeScreen from "./pages/HomeScreen";
import Chat from "./pages/chat/Chat";
import { AppStateProvider } from "./state/AppProvider";
import ProfileScreen from "./pages/ProfileScreen";
import ItemsList from "./pages/ItemsList";


initializeIcons();

export default function App() {
    return (
        <AppStateProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Chat />} />
                        <Route index element={<HomeScreen />} />
                        <Route index element={<ProfileScreen />} />
                        <Route index element={<ItemsList />} />
                        <Route path="*" element={<NoPage />} />
                    </Route>
                </Routes>
            </HashRouter>
        </AppStateProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
