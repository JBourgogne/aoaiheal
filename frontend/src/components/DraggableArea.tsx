import React from 'react';
import { Draggable, Droppable, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

interface Tile {
  id: string;  // Unique identifier for each tile
  title: string;
  icon: string;
  blurb: string;
}

interface DraggableAreaProps {
  tiles: Tile[];
  setTiles: (tiles: Tile[]) => void;
}

const DraggableArea: React.FC<DraggableAreaProps> = ({ tiles, setTiles }) => {
  return (
    <Droppable droppableId="tiles">
      {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {tiles.map((tile, index) => (
            <Draggable key={tile.id} draggableId={tile.id} index={index}>
              {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                  <h3>{tile.title}</h3>
                  <img src={tile.icon} alt={tile.title} />
                  <p>{tile.blurb}</p>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DraggableArea;
