import React from 'react';
import { Link } from 'react-router-dom';
// Using TypeScript, define props and state interfaces
// interface HomeScreenState { ... }
// interface HomeScreenProps { ... }

const HomeScreen: React.FC = () => {
  // Placeholder function for drag and drop logic
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Handle the drop logic here
    console.log('Widget dropped');
  };

  return (
    <div>
      <section>
        <h2>Profile</h2>
        {/* Profile component or details go here */}
      </section>
      <section>
        <h2>Profile Details</h2>
        {/* More detailed information or a link to it */}
      </section>
      <section>
        <h2>Chat</h2>
        <Link to="/chat">Go to Chat</Link>
        {/* Assuming you have a route set up for '/chat' */}
      </section>
      <section
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ width: '100%', height: '200px', border: '2px dashed #ccc', marginTop: '20px' }}>
        <h2>Drag and Drop Widgets Here</h2>
        {/* This area is for dropping widgets. Add your logic */}
      </section>
    </div>
  );
};

export default HomeScreen;
