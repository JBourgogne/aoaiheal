// Import statements
import React, { useContext, useState, useEffect, FormEvent } from "react";
import { Outlet, Link } from "react-router-dom";
import { Dialog, Stack, TextField } from "@fluentui/react";
import { HistoryButton, FeedbackButton } from "../../components/common/Button";
import { AppStateContext } from "../../state/AppProvider";
import { MdChat, MdPerson, MdList, MdHome } from "react-icons/md";
import styles from "./Layout.module.css";
import Contoso from "../../assets/Contoso.svg";


// Assuming you have a UI model (update according to your actual model)
interface UI {
  logo?: string;
  title?: string;
  show_feedback_button?: boolean; // Ensure this is defined in your UI model
}

// Assuming AppState has a 'ui' of type UI and a 'userId' field
const Layout = () => {
    // Use context within the component function
    const context = useContext(AppStateContext);
    
    // Early return if context is undefined
    if (!context) {
      return null; // or any other placeholder you want to display
    }

    // Destructure state and dispatch from context
    const { state, dispatch } = context;
    
    // UI object from state with optional chaining
    const ui: UI = state?.frontendSettings?.ui ?? {};

    // Handlers and state hooks
    const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState<boolean>(false);
    const [isSharePanelOpen, setIsSharePanelOpen] = useState<boolean>(false);
    const [copyClicked, setCopyClicked] = useState<boolean>(false);
    const [copyText, setCopyText] = useState<string>("Copy URL");

    // Ensure handlers are correctly typed
    const handleFeedbackClick = () => setIsFeedbackPanelOpen(true);
    const handleFeedbackPanelDismiss = () => setIsFeedbackPanelOpen(false);
    const handleShareClick = () => setIsSharePanelOpen(true);
    const handleSharePanelDismiss = () => {
        setIsSharePanelOpen(false);
        setCopyClicked(false);
        setCopyText("Copy URL");
    };
    const handleCopyClick = () => navigator.clipboard.writeText(window.location.href).then(() => setCopyClicked(true));
    const handleHistoryClick = () => dispatch && dispatch({ type: 'TOGGLE_CHAT_HISTORY' });

    // Feedback form submit handler correction
    const handleSubmitFeedback = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget); // Use event.currentTarget for form elements
        const feedbackData = Object.fromEntries(formData.entries());
        // Example API call
        console.log(feedbackData);
        handleFeedbackPanelDismiss();
    };

    return (
        <div className={styles.layout}>
            {/* Header */}
            <header className={styles.header}>
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 20 }}>
                    <Link to="/" className={styles.logoLink}>
                        <img src={ui.logo || Contoso} alt="Logo" className={styles.logo} />
                        {ui.title && <h1 className={styles.title}>{ui.title}</h1>}
                    </Link>
                    {ui.show_feedback_button && <FeedbackButton onClick={handleFeedbackClick} text="Feedback" />}
                    <HistoryButton onClick={handleHistoryClick} text="History" />
                </Stack>
            </header>
            <Outlet />
            <footer className={styles.footer}>
                <div className={styles.footerItem}>
                    <Link to="/chat" className={styles.footerLink}>
                    <MdChat className={styles.footerIcon} />
                    Chat
                </Link>
                </div>
                <div className={styles.footerItem}>
                    <Link to="/profile" className={styles.footerLink}>
                        <MdPerson className={styles.footerIcon} />
                        Profile
                    </Link>
                </div>
                <div className={styles.footerItem}>
                    <Link to="/items" className={styles.footerLink}>
                        <MdList className={styles.footerIcon} />
                        Goals
                </Link>
                </div>
                <div className={styles.footerItem}>
                    <Link to="/" className={styles.footerLink}>
                        <MdHome className={styles.footerIcon} />
                        Home
                    </Link>
                </div>
            </footer>
            <Dialog hidden={!isFeedbackPanelOpen} onDismiss={handleFeedbackPanelDismiss}>
    <form onSubmit={handleSubmitFeedback}>
        <Stack tokens={{ childrenGap: 12 }}>
            {/* Relevant form fields */}
            <TextField label="Your Email (optional):" name="email" type="email" />
            <TextField label="Feedback / Bug Description:" name="description" multiline rows={4} required />
            <FeedbackButton onClick={() => {}} text="Submit" type="submit" />
        </Stack>
    </form>
</Dialog>
        </div>
    );
};

export default Layout;
