// Import statements
import React, { useContext, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Dialog, Stack, PrimaryButton, TextField, IconButton } from "@fluentui/react";
import { MdChat, MdPerson, MdList, MdHome } from "react-icons/md";
import styles from "./Layout.module.css";
import { AppStateContext } from "../../state/AppProvider";

// UI model for TypeScript types
interface UI {
  logo?: string;
  title?: string;
  show_feedback_button?: boolean;
}

const Layout = () => {
  const { state } = useContext(AppStateContext) ?? {};
  const ui: UI = state?.frontendSettings?.ui ?? {};
  const show_feedback_button = true;
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);

  const toggleFeedbackPanel = () => setIsFeedbackPanelOpen(!isFeedbackPanelOpen);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Stack horizontal tokens={{ childrenGap: 20 }} verticalAlign="center" horizontalAlign="space-between">
          <Link to="/" className={styles.logoLink}>
            <img src={ui.logo || "/images/logo.png"} alt="Logo" className={styles.logo} />
            <h1>{ui.title}</h1>
          </Link>
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            {ui.show_feedback_button && (
              <PrimaryButton text="Feedback" onClick={toggleFeedbackPanel} />
            )}
            <PrimaryButton text="History" onClick={() => console.log("History")} />
          </Stack>
        </Stack>
      </header>
      <Outlet />
      <footer className={styles.footer}>
        <Stack horizontal tokens={{ childrenGap: 50 }} verticalAlign="center" horizontalAlign="center">
          <Link to="/chat" className={styles.footerLink}><MdChat size={24} /> Chat</Link>
          <Link to="/profile" className={styles.footerLink}><MdPerson size={24} /> Profile</Link>
          <Link to="/user/goals" className={styles.footerLink}><MdList size={24} /> Goals</Link>
          <Link to="/" className={styles.footerLink}><MdHome size={24} /> Home</Link>
        </Stack>
      </footer>
      <Dialog
        hidden={!isFeedbackPanelOpen}
        onDismiss={toggleFeedbackPanel}
        dialogContentProps={{
          title: "Feedback",
          subText: "Your feedback is important to us."
        }}
      >
        <TextField label="Your feedback" multiline rows={3} />
        <PrimaryButton text="Submit" onClick={toggleFeedbackPanel} />
      </Dialog>
    </div>
  );
};

export default Layout;
