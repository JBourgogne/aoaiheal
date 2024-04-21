import React, { useState, useEffect } from 'react';
import AddGoalModal from '../components/AddGoalModal';
import axios from 'axios';

interface Goal {
    id: string;
    description: string;
    completed: boolean;
}

const HomeScreen: React.FC = () => {
    const [goals, setGoals] = useState<Goal[]>([]); // Specify that goals is an array of 'Goal'
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        const response = await axios.get<Goal[]>('/user/goals'); // Assume that the endpoint returns an array of Goal
        setGoals(response.data);
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleAddGoal = (newGoal: Goal) => { // Specify that newGoal is of type 'Goal'
        setGoals(prevGoals => [...prevGoals, newGoal]); // Use a functional update for better predictability
        closeModal();
    };

    return (
        <div>
            <button onClick={openModal}>Add New Goal</button>
            <AddGoalModal
                isOpen={modalIsOpen}
                onClose={closeModal}
                onGoalAdded={handleAddGoal}
            />
            {goals.map(goal => (
                <div key={goal.id}>
                    {goal.description} - {goal.completed ? 'Completed' : 'Incomplete'}
                </div>
            ))}
        </div>
    );
};

export default HomeScreen;
