import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Item {
  id: string;
  text: string;
  completed: boolean;
}

const ItemsList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // Fetch items on component mount
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const response = await axios.get('/items');
    setItems(response.data);
  };

  const handleAddItem = async () => {
    const newItem = { text: '', completed: false };
    await axios.post('/item', newItem);
    fetchItems(); // Refresh the list
  };

  const handleSave = async (id: string, text: string) => {
    await axios.put(`/item/${id}`, { text, completed: false });
    fetchItems(); // Refresh the list
  };

  const handleComplete = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      await axios.put(`/item/${id}`, { ...item, completed: !item.completed });
      fetchItems(); // Refresh the list
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await axios.delete(`/item/${id}`);
      fetchItems(); // Refresh the list
    }
  };

  // Adjusted JSX to include editable text fields and CRUD operations
  // Similar to the previous frontend code, but now with CRUD operation calls

  return (
    <div>
      {/* Render your items here */}
      <button onClick={handleAddItem}>Add entry</button>
    </div>
  );
};

export default ItemsList;
