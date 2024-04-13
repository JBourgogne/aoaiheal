import { Conversation, Feedback, fetchChatHistoryInit, historyList } from '../api';
import { Action, AppState } from './AppProvider';
import { Answer, UserDetails } from '../api/models'; // Assuming these are the types

// Define the reducer function
export const appStateReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_USER_ID':
            return { ...state, userId: action.payload };
        case 'TOGGLE_CHAT_HISTORY':
            return { ...state, isChatHistoryOpen: !state.isChatHistoryOpen };
        case 'UPDATE_CURRENT_CHAT':
            return { ...state, currentChat: action.payload };
        case 'UPDATE_CHAT_HISTORY_LOADING_STATE':
            return { ...state, chatHistoryLoadingState: action.payload };
        case 'UPDATE_CHAT_HISTORY':
            if (!state.chatHistory) {
             return { ...state, chatHistory: [action.payload] };
            }
            let conversationIndex = state.chatHistory.findIndex(conv => conv.id === action.payload.id);
            if (conversationIndex !== -1) {
                let updatedChatHistory = [...state.chatHistory]; // Clone the array for immutability
                updatedChatHistory[conversationIndex] = action.payload; // Update the conversation
                return { ...state, chatHistory: updatedChatHistory };
            } else {
                return { ...state, chatHistory: [...state.chatHistory, action.payload] };
                }
        case 'DELETE_CHAT_ENTRY':
            if (!state.chatHistory) {
                return state; // Early return if chatHistory is null
            }
            let filteredChat = state.chatHistory.filter(chat => chat.id !== action.payload);
            return { ...state, chatHistory: filteredChat };
        case 'UPDATE_CHAT_TITLE':
            let updatedChats = state.chatHistory ? state.chatHistory.map(chat => {
                if (chat.id === action.payload.id) {
                    if(state.currentChat?.id === action.payload.id){
                        state.currentChat.title = action.payload.title;
                    }
                    // Make API call to save new title to DB
                    return { ...chat, title: action.payload.title };
                }
                return chat;
            }) : [];
            return { ...state, chatHistory: updatedChats };
        case 'DELETE_CHAT_HISTORY':
            return { ...state, chatHistory: [], currentChat: null };
        case 'DELETE_CURRENT_CHAT_MESSAGES':
            if (!state.currentChat || !state.chatHistory) {
                return state;
            }
            const updatedCurrentChat: Conversation = {
                ...state.currentChat,
                messages: []  // Assuming the rest of the fields are already initialized correctly
            };
            if (!updatedCurrentChat.id || !updatedCurrentChat.title || !updatedCurrentChat.date) {
                console.error('Required Conversation fields are not properly initialized');
                return state; // Optionally handle this situation more gracefully
            }
            return {
                ...state,
                currentChat: updatedCurrentChat
            };
        case 'FETCH_CHAT_HISTORY':
            return { ...state, chatHistory: action.payload };
        case 'SET_COSMOSDB_STATUS':
            return { ...state, isCosmosDBAvailable: action.payload };
        case 'FETCH_FRONTEND_SETTINGS':
            return { ...state, frontendSettings: action.payload };
        case 'SET_FEEDBACK_STATE':
            return {
                ...state,
                feedbackState: {
                    ...state.feedbackState,
                    [action.payload.answerId]: action.payload.feedback,
                },
            };
        // Tile management actions
        case 'SET_TILES':
            return { ...state, tiles: action.payload };
        case 'ADD_TILE':
            return { ...state, tiles: [...state.tiles, action.payload] };
        case 'UPDATE_TILE':
            let updatedTiles = state.tiles.map(tile =>
                tile.id === action.payload.id ? { ...tile, ...action.payload } : tile
            );
            return { ...state, tiles: updatedTiles };
        case 'REMOVE_TILE':
            let newTiles = state.tiles.filter(tile => tile.id !== action.payload);
            return { ...state, tiles: newTiles };
        default:
            return state;
    }
};
