import { Checkbox, TableCell, TableHead, TableRow } from '@material-ui/core';
import React from 'react';

export const RecordingTableHeader = ({ onToggleAll, allSelected }: RecordingTableHeaderProps) => {
    return <TableHead>
        <TableRow>
            <TableCell><Checkbox onChange={ (checked) => onToggleAll(checked.target.checked) } checked={ allSelected } /></TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>User Agent</TableCell>
            <TableCell>Preview</TableCell>
        </TableRow>
    </TableHead>
}

export interface RecordingTableHeaderProps {
    onToggleAll: (select: boolean) => void;
    allSelected: boolean;
}