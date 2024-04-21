import React, { useState } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

// Assuming Modal is appropriately configured elsewhere in your project
Modal.setAppElement('#root');

interface Goal {
    id: string;
    description: string;
    completed: boolean;
}

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;  // No parameters and returns nothing
    onGoalAdded: (goal: Goal) => void;  // Accepts a goal object and returns nothing
}

// Apply the AddGoalModalProps interface to the function signature
const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onGoalAdded }) => {
    const [description, setDescription] = useState<string>('');
    const [completed, setCompleted] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        try {
            const response = await axios.post<Goal>('/user/goals', { description, completed });
            onGoalAdded(response.data);  // Assume response.data is correctly typed as Goal
            setDescription('');
            setCompleted(false);
            onClose();  // Close modal on successful addition
        } catch (error) {
            console.error('Failed to add goal', error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Add Goal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <h2>Add New Goal</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Description:
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Completed:
                    <input
                        type="checkbox"
                        checked={completed}
                        onChange={(e) => setCompleted(e.target.checked)}
                    />
                </label>
                <button type="submit">Add Goal</button>
                <button onClick={onClose} type="button">Cancel</button>
            </form>
        </Modal>
    );
};

export default AddGoalModal;
