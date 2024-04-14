import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import { appStateReducer } from './AppReducer';
import { Conversation, ChatHistoryLoadingState, CosmosDBHealth, historyList, historyEnsure, CosmosDBStatus, FrontendSettings, Feedback } from '../api';

export interface Tile {
    id: string;
    title: string;
    icon: string;
    description: string;
    type: 'checkbox' | 'percentage' | 'fractional';
}

export interface AppState {
    isChatHistoryOpen: boolean;
    chatHistoryLoadingState: ChatHistoryLoadingState;
    isCosmosDBAvailable: CosmosDBHealth;
    chatHistory: Conversation[] | null;
    filteredChatHistory: Conversation[] | null;
    currentChat: Conversation | null;
    frontendSettings: FrontendSettings | null;
    feedbackState: { [answerId: string]: Feedback.Neutral | Feedback.Positive | Feedback.Negative; };
    userId: string | null;
    tiles: Tile[];
    dispatch: () => null ;
}

export type Action =
    | { type: 'TOGGLE_CHAT_HISTORY' }
    | { type: 'SET_COSMOSDB_STATUS', payload: CosmosDBHealth }
    | { type: 'UPDATE_CHAT_HISTORY_LOADING_STATE', payload: ChatHistoryLoadingState }
    | { type: 'UPDATE_CURRENT_CHAT', payload: Conversation | null }
    | { type: 'UPDATE_FILTERED_CHAT_HISTORY', payload: Conversation[] | null }
    | { type: 'UPDATE_CHAT_HISTORY', payload: Conversation }
    | { type: 'UPDATE_CHAT_TITLE', payload: Conversation }
    | { type: 'DELETE_CHAT_ENTRY', payload: string }
    | { type: 'DELETE_CHAT_HISTORY'}
    | { type: 'DELETE_CURRENT_CHAT_MESSAGES', payload: string }
    | { type: 'FETCH_CHAT_HISTORY', payload: Conversation[] | null }
    | { type: 'FETCH_FRONTEND_SETTINGS', payload: FrontendSettings | null }
    | { type: 'SET_FEEDBACK_STATE', payload: { answerId: string; feedback: Feedback.Positive | Feedback.Negative | Feedback.Neutral } }
    | { type: 'GET_FEEDBACK_STATE', payload: string }
    | { type: 'SET_TILES', payload: Tile[] }
    | { type: 'ADD_TILE', payload: Tile }
    | { type: 'UPDATE_TILE', payload: Tile }
    | { type: 'REMOVE_TILE', payload: string }
    | { type: 'SET_USER_ID', payload: string | null };

const initialState: AppState = {
    isChatHistoryOpen: false,
    chatHistoryLoadingState: ChatHistoryLoadingState.Loading,
    chatHistory: null,
    filteredChatHistory: null,
    currentChat: null,
    isCosmosDBAvailable: {
        cosmosDB: false,
        status: CosmosDBStatus.NotConfigured,
    },
    frontendSettings: null,
    feedbackState: {},
    userId: null,
    tiles: [],
    dispatch: function (): null {
        throw new Error('Function not implemented.');
    }
};

// Provide default values for the context
export const AppStateContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
}>({
    state: initialState,  // You need to define a sensible initial state
    dispatch: () => null  // A no-op function for dispatch
});


type AppStateProviderProps = {
    children: ReactNode;
};

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(appStateReducer, initialState);

    useEffect(() => {
        // Initialization logic and API calls as already detailed
    }, []);

    return (
      <AppStateContext.Provider value={{ state, dispatch }}>
        {children}
      </AppStateContext.Provider>
    );
};
