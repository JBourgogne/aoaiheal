import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Ensure Link is imported from 'react-router-dom'
import { AppStateContext } from '../state/AppProvider'; // Adjust path as needed
import { UserDetails, Answer } from '../api/models';
import GoalsTileComponent from '../components/GoalsTileComponent'; // Ensure this import points to the correct file

// Define interfaces for the response and initial state if not already defined
interface UserDetailsResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userPhone: string;
  userEmail: string;
  sex: string;
  healthConditions: string[];
  medicalHistory: string;
  medications: string;
  allergies: string;
  dietaryPreferences: string[];
  physicalActivityLevel: string;
  sleepPatterns: string;
  tobaccoAlcoholDrugUse: string[];
  healthInsuranceProvider: string;
  primaryCarePhysicianDetails: {
    name: string;
    email: string;
    address: string;
    provider: string;
  };
  emergencyContactInformation: {
    name: string;
    phone: string;
    relationship: string;
  };
  healthGoals: string;
  answers: Answer[];
}

// Helper function to initialize default user details
const initializeUserDetails = (): UserDetailsResponse => ({
  userId: "",
  email: "",
  firstName: "",
  lastName: "",
  fullName: "",
  userPhone: "",
  userEmail: "",
  sex: "Other",
  healthConditions: [],
  medicalHistory: "",
  medications: "",
  allergies: "",
  dietaryPreferences: [],
  physicalActivityLevel: "Sedentary",
  sleepPatterns: "Consistent",
  tobaccoAlcoholDrugUse: [],
  healthInsuranceProvider: "",
  primaryCarePhysicianDetails: {
    name: "",
    email: "",
    address: "",
    provider: ""
  },
  emergencyContactInformation: {
    name: "",
    phone: "",
    relationship: ""
  },
  healthGoals: "",
  answers: [] // Assuming initializeAnswers() populates this field correctly
});

const ProfileScreen: React.FC = () => {
  const { state } = useContext(AppStateContext);
  const userId = state.userId;

  const [userDetails, setUserDetails] = useState<UserDetailsResponse>(initializeUserDetails());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setError('No user ID found');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get<UserDetailsResponse>(`/api/user/details/${userId}`);
        setUserDetails(prevDetails => ({ ...prevDetails, ...response.data }));
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? (err.response?.data.message || err.message)
          : 'Failed to fetch user details';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleUpdateDetails = async (updatedAnswers: Answer[]) => {
    if (!userId) return;

    try {
      await axios.post(`/api/user/details/${userId}`, { answers: updatedAnswers });
      setUserDetails(prevDetails => ({ ...prevDetails, answers: updatedAnswers }));
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
      {userDetails.answers.map((item, index) => (
        <div key={index}>
          <p>{item.questionText}</p>
          {/* Additional implementation for rendering and updating answers */}
        </div>
      ))}
      <div>
        <h2>My Goals Overview</h2>
        <GoalsTileComponent />
        <Link to="/goals">View All Goals</Link>
      </div>
    </div>
  );
};

export default ProfileScreen;
