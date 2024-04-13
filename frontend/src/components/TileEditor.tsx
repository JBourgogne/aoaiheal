import React, { useState } from 'react';
import { Modal, Button, TextField, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface TileEditorProps {
    open: boolean;
    onSave: (tile: Tile) => void;
    onCancel: () => void;
}

interface Tile {
    title: string;
    icon: string;
    blurb: string;
    type: 'checkbox' | 'percentage' | 'fractional';
}

const TileEditor: React.FC<TileEditorProps> = ({ open, onSave, onCancel }) => {
    const [tile, setTile] = useState<Tile>({ title: '', icon: '', blurb: '', type: 'checkbox' });

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name as keyof Tile;
        setTile({
            ...tile,
            [name]: event.target.value
        });
    };

    const handleSelectChange = (event: SelectChangeEvent<'checkbox' | 'percentage' | 'fractional'>) => {
        const name = event.target.name as keyof Tile;
        setTile({
            ...tile,
            [name]: event.target.value as 'checkbox' | 'percentage' | 'fractional'
        });
    };

    const handleSubmit = () => {
        onSave(tile);
        onCancel();
    };

    return (
        <Modal open={open} onClose={onCancel}>
            <div style={{ padding: 20, backgroundColor: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <TextField label="Title" name="title" value={tile.title} onChange={handleTextChange} />
                <TextField label="Icon" name="icon" value={tile.icon} onChange={handleTextChange} />
                <TextField label="Blurb" name="blurb" value={tile.blurb} onChange={handleTextChange} />
                <Select name="type" value={tile.type} onChange={handleSelectChange}>
                    <MenuItem value="checkbox">Checkbox</MenuItem>
                    <MenuItem value="percentage">Percentage</MenuItem>
                    <MenuItem value="fractional">Fractional</MenuItem>
                </Select>
                <Button onClick={handleSubmit}>Save Tile</Button>
            </div>
        </Modal>
    );
};

export default TileEditor;
