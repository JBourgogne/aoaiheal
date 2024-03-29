import React, { useState } from 'react';

interface Item {
  id: string;
  text: string;
  completed: boolean;
}

const ItemsList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [tempText, setTempText] = useState<string>('');

  const handleAddItem = () => {
    const newItem = { id: Date.now().toString(), text: '', completed: false };
    setItems([...items, newItem]);
  };

  const handleEdit = (id: string) => {
    setEditItemId(id);
    const item = items.find(item => item.id === id);
    if (item) {
      setTempText(item.text);
    }
  };

  const handleSave = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, text: tempText } : item));
    setEditItemId(null);
    setTempText('');
  };

  const handleComplete = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', marginBottom: '10px' }}>
          {editItemId === item.id ? (
            <input
              type="text"
              value={tempText}
              onChange={e => setTempText(e.target.value)}
              onBlur={() => setEditItemId(null)}
            />
          ) : (
            <div style={{ textDecoration: item.completed ? 'line-through' : 'none' }} onClick={() => handleEdit(item.id)}>
              {item.text || 'Click to edit'}
            </div>
          )}

          {editItemId === item.id ? (
            <button onClick={() => handleSave(item.id)}>Save</button>
          ) : (
            <>
              <button onClick={() => handleEdit(item.id)}>Edit</button>
              <button onClick={() => handleComplete(item.id)}>Complete</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </>
          )}
        </div>
      ))}
      <button onClick={handleAddItem}>Add entry</button>
    </div>
  );
};

export default ItemsList;
