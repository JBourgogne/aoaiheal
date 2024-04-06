import React, { useState } from 'react';
import axios from 'axios';

interface Answer {
    shortName: string;
    questionId: string;
    questionText: string;
    answerType: string;
    options?: string[];
    answer: string | string[];
}

interface FormData {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    userPhone: string;
    userEmail: string;
    sex: string;
    answers: Answer[];
}

interface ProfileFormProps {
    userId: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userId }) => {
    const [formData, setFormData] = useState<FormData>({
        userId,
        email: "",
        firstName: "",
        lastName: "",
        fullName: "",
        userPhone: "",
        userEmail: "",
        sex: "",
        answers: [
            // Pre-fill with question structure
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
        ]
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index?: number) => {
        const { name, value, type } = event.target;
        let newAnswers = [...formData.answers];
    
        if (type === "checkbox" && index !== undefined) {
            // Specifically assert event.target as HTMLInputElement for checkboxes
            const target = event.target as HTMLInputElement;
            const selectedOption = value;
            const currentAnswer = newAnswers[index].answer as string[] | string;
            let updatedAnswer: string[] = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
    
            if (target.checked) {
                updatedAnswer.push(selectedOption);
            } else {
                updatedAnswer = updatedAnswer.filter(option => option !== selectedOption);
            }
            newAnswers[index] = { ...newAnswers[index], answer: updatedAnswer };
        } else if (index !== undefined) {
            // This branch is for text inputs and radios, which don't need the 'checked' property
            newAnswers[index] = { ...newAnswers[index], answer: value };
        } else {
            // This branch is for handling changes to top-level fields
            setFormData(prevState => ({ ...prevState, [name]: value }));
            return;
        }
        setFormData(prevState => ({ ...prevState, answers: newAnswers }));
    };
    

    const renderQuestionInput = (question: Answer, index: number) => {
        switch (question.answerType) {
            case "single choice":
                return (
                    <div>
                        {question.options?.map(option => (
                            <label key={option}>
                                <input
                                    type="radio"
                                    name={question.questionId}
                                    value={option}
                                    checked={question.answer === option}
                                    onChange={e => handleChange(e, index)}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                );
            case "multi-choice":
                return (
                    <div>
                        {question.options?.map(option => (
                            <label key={option}>
                                <input
                                    type="checkbox"
                                    name={question.questionId}
                                    value={option}
                                    checked={Array.isArray(question.answer) && question.answer.includes(option)}
                                    onChange={e => handleChange(e, index)}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                );
            case "text":
                return (
                    <textarea
                        name={question.questionId}
                        value={typeof question.answer === 'string' ? question.answer : ''}
                        onChange={e => handleChange(e, index)}
                    />
                );
            // Add cases for other types if necessary...
            default:
                return null;
        }
    };

    const validateFormData = (): boolean => {
        // Basic validation logic
        if (!formData.email || !formData.userId) {
            alert('Email and User ID are required.');
            return false;
        }
        // Add more specific validation here if necessary...
        return true;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
      
        if (!validateFormData()) {
            return;
        }
      
        try {
            const response = await axios.post(`/api/user/details/${userId}`, formData);
            console.log('Profile updated successfully:', response.data);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Dynamic form rendering based on formData */}
            {formData.answers.map((question, index) => (
                <div key={question.questionId}>
                    <label>{question.questionText}</label>
                    {renderQuestionInput(question, index)}
                </div>
            ))}
            <button type="submit">Submit</button>
        </form>
    );
};

export default ProfileForm;
