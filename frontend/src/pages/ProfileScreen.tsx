import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppStateContext } from '../state/AppProvider'; // Adjust the import path as necessary
import { UserDetails, Answer } from '../api/models';

// Define a function to initialize the default answers
const initializeAnswers = (): Answer[] => ([
    {
        shortName: "Sex",
        questionId: "sex",
        questionText: "Sex",
        answerType: "single choice",
        options: ["Male", "Female", "Other"],
        answer: ""
    },
    {
        shortName: "Health_Conditions",
        questionId: "healthConditions",
        questionText: "Select any health conditions you have:",
        answerType: "multi-choice",
        options: ["High Blood Pressure", "Diabetes", "Overweight", "Heart Disease", "Depression", "Other"],
        answer: []
    },
    {
shortName: "HC_Other",
questionId: "hcOther",
questionText: "If other health conditions, please specify:",
answerType: "text",
answer: ""
},
{
shortName: "Medical_History",
questionId: "medicalHistory",
questionText: "Please provide any and all medical history that you can remember:",
answerType: "text",
answer: ""
},
{
shortName: "Medications",
questionId: "medications",
questionText: "Please provide list all medications that you are taking currently with dosage and frequency:",
answerType: "text",
answer: ""
},
{
shortName: "Allergies",
questionId: "allergies",
questionText: "Please list any allergies with severity:",
answerType: "text",
answer: ""
},
{
shortName: "Dietary_Preferences",
questionId: "dietaryPreferences",
questionText: "Please select your dietary preference(s)",
answerType: "multi-choice",
options: ["Vegan", "Vegetarian", "Gluten-Free", "Low-Carb/Keto", "Dairy-Free","No restrictions", "Other (Please Specify)"],
answer: []
},
{
shortName: "Diet_Other",
questionId: "dietOther",
questionText: "If other dietary preferences/restrictions, please specify:",
answerType: "text",
answer: ""
},
{
shortName: "Physical_Activity",
questionId: "physicalActivity",
questionText: "How much do you excersise every week on average?",
answerType: "single choice",
options: ["Sedentary (little or no exercise)", "Lightly active (light exercise/sports 1-3 days/week)", "Moderately active (moderate exercise/sports 3-5 days/week)","Very active (hard exercise/sports 6-7 days a week)","Extra active (very hard exercise/physical job & exercise 2x/day)"],
answer: ""
},
{
shortName: "Sleep_Patterns",
questionId: "sleepPatterns",
questionText: "How much do you sleep everynight on average?",
answerType: "single choice",
options: ["Consistent (7-9 hours per night)", "Inconsistent (varying hours)", "Insomnia (difficulty falling/staying asleep)","Hypersomnia (excessive sleep, trouble staying awake)","Other sleep-related issues"],
answer: ""
},
{
shortName: "Tobacco_Alcohol_Other",
questionId: "tAo",
questionText: "Do you consume any of the below?",
answerType: "multi-choice",
options: ["No usage", "Alcohol","Nicotine","Cannabis","Other"],
answer: ""
},
{
shortName: "Sleep_Other",
questionId: "sleepOther",
questionText: "If other sleep issues, please specify:",
answerType: "text",
answer: ""
},
{
shortName: "Health_Goals",
questionId: "healthGoals",
questionText: "What are your health goals?",
answerType: "text",
answer: ""
}
]);

// Define a function to initialize the default user details with placeholders
const initializeUserDetails = (): UserDetails => ({
    userId: "",
    email: "",
    firstName: "",
    lastName: "",
    fullName: "",
    userPhone: "",
    userEmail: "",
    sex: "Other", // Default to 'Other' or another appropriate value
    healthConditions: [],
    medicalHistory: "",
    medications: "",
    allergies: "",
    dietaryPreferences: [],
    physicalActivityLevel: "Sedentary", // Default to 'Sedentary' or another appropriate value
    sleepPatterns: "Consistent", // Default to 'Consistent' or another appropriate value
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
    answers: initializeAnswers() // Initialize answers as before
  });
  
  const ProfileScreen: React.FC = () => {
    const { state } = useContext(AppStateContext)!;
    const userId = state.userId;
  
    // Initialize userDetails with the default structure
    const [userDetails, setUserDetails] = useState<UserDetails>(initializeUserDetails());
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
  
    useEffect(() => {
      if (!userId) {
        setError('No user ID found');
        setLoading(false);
        return;
      }
  
      const fetchUserDetails = async () => {
        setLoading(true);
        try {
          const response = await axios.get<UserDetails>(`/api/user/details/${userId}`);
          setUserDetails(prevDetails => ({ ...prevDetails, ...response.data }));
        } catch (err) {
          const message = axios.isAxiosError(err) ? err.message : 'Failed to fetch user details';
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
      </div>
    );
  };
  
  export default ProfileScreen;
  