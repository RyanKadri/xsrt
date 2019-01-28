import { Checkbox, TableCell, TableHead, TableRow } from "@material-ui/core";
import React from "react";
import { RecordingColumn } from "./available-columns";

export const RecordingTableHeader = ({ onToggleAll, allSelected, displayColumns }: RecordingTableHeaderProps) => {
    return <TableHead>
        <TableRow>
            <TableCell>
                <Checkbox
                    onChange={ (checked) => onToggleAll(checked.target.checked) }
                    checked={ allSelected }
                />
            </TableCell>
            { displayColumns.map(col => <TableCell key={col.key}>{ col.header }</TableCell> ) }
        </TableRow>
    </TableHead>;
};

export interface RecordingTableHeaderProps {
    displayColumns: RecordingColumn[];
    allSelected: boolean;
    onToggleAll: (select: boolean) => void;
}
