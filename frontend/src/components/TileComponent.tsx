import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Tile } from '../state/AppProvider';

const TileComponent: React.FC<{ tile: Tile }> = ({ tile }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TILE',
    item: tile,
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <h3>{tile.title}</h3>
      <p>{tile.description}</p>
      {/* Render icon based on tile.icon */}
    </div>
  );
};
