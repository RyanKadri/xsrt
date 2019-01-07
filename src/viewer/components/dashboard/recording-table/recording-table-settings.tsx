import { Checkbox, List, ListItem, ListItemText, Popover } from '@material-ui/core';
import React from 'react';
import { allowedColumns, RecordingColumn } from './available-columns';

const toggleCol = (col: RecordingColumn, settings: RecordingTableSettings): RecordingTableSettings => {
    return {
        columns: settings.columns.includes(col)
            ? settings.columns.filter(settingsCol => settingsCol !== col)
            : allowedColumns.filter(allowed => [...settings.columns, col].some(test => test.key === allowed.key))
    }
}

export const RecordingTableSettings = ({ open, onClose, availableColumns, settings, onChangeSettings, anchor }: RecordingTableSettingsDialogProps) => {
    return <Popover onClose={ onClose} open={ open } anchorEl={ anchor } >
        <List>{
            availableColumns.map(col => 
                <ListItem key={col.key}>
                    <Checkbox 
                        checked={ settings.columns.some(selected => selected.key === col.key) } 
                        onChange={ () => onChangeSettings(toggleCol(col, settings)) }    
                    />
                    <ListItemText>{ col.header }</ListItemText>
                </ListItem>
            )
        }</List>
    </Popover>
}

export interface RecordingTableSettingsDialogProps {
    open: boolean;
    onClose: () => void;
    availableColumns: RecordingColumn[];
    settings: RecordingTableSettings;
    onChangeSettings: (settings: RecordingTableSettings) => void;
    anchor: HTMLElement | null
}

export interface RecordingTableSettings {
    columns: RecordingColumn[];
}