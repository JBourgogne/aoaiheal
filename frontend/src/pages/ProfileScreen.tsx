import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppStateContext } from '../state/AppProvider'; // Adjust the import path as necessary

// Assuming UserDetails is the type for the user details state
import { UserDetails , Answer} from '../api/models';

const ProfileScreen: React.FC = () => {
  // Directly asserting that the context value will not be undefined
  const { state } = useContext(AppStateContext)!; // Note the '!' at the end

  const userId = state.userId;

    // Use the UserDetails type for your state
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!userId) {
            setError('No user ID found');
            setLoading(false);
            return;
        }

        const fetchOrInitializeUserDetails = async () => {
            setLoading(true);
            try {
                const response = await axios.get<UserDetails>(`/api/user/details/${userId}`);
                setUserDetails(response.data);
            } catch (err) {
                // If `err` is an AxiosError, it can have a message. Otherwise, use a generic error message.
                const message = axios.isAxiosError(err) ? err.message : 'Failed to fetch or initialize user details';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrInitializeUserDetails();
    }, [userId]);

    const handleUpdateDetails = async (updatedAnswers: Answer[]) => {
        if (!userId || !userDetails) return;

        try {
            await axios.post(`/api/user/details/${userId}`, { answers: updatedAnswers });
            setUserDetails({ ...userDetails, answers: updatedAnswers });
        } catch (err) {
            const message = axios.isAxiosError(err) ? err.message : 'Failed to update details';
            setError(message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>User Profile</h2>
            {userDetails?.answers.map((item, index) => (
                <div key={index}>
                    <p>{item.questionText}</p>
                    {/* Additional implementation for rendering and updating answers */}
                </div>
            ))}
        </div>
    );
};

export default ProfileScreen;
