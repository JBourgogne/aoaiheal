import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfileScreen: React.FC = () => {
    const [profile, setProfile] = useState<any>({});

    useEffect(() => {
        // Fetch profile details
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/profile/userIdHere');
                setProfile(response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        // Update profile details
        try {
            await axios.put('/profile/userIdHere', profile);
            alert('Profile updated successfully');
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div>
            <h2>Profile Details</h2>
            {/* Render profile details and edit form here */}
            <button onClick={handleSave}>Save</button>
        </div>
    );
};

export default ProfileScreen;
