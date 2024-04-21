// This file will handle actions related to user details and tiles (goals)
import { Action, AppState} from './AppProvider';

export const userGoalsReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_TILES':
            return { ...state, tiles: action.payload };
        case 'ADD_TILE':
            return { ...state, tiles: [...state.tiles, action.payload] };
        case 'UPDATE_TILE':
            const updatedTiles = state.tiles.map(tile => tile.id === action.payload.id ? { ...tile, ...action.payload } : tile);
            return { ...state, tiles: updatedTiles };
        case 'REMOVE_TILE':
            const newTiles = state.tiles.filter(tile => tile.id !== action.payload);
            return { ...state, tiles: newTiles };
        case 'SET_USER_ID':
            return { ...state, userId: action.payload };
        // potentially other user detail actions
        default:
            return state;
    }
};
