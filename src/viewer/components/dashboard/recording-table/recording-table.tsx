import { createStyles, Paper, Table, TableBody, Theme, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { RecordingOverview } from "../../../../scraper/types/types";
import { RecordingTableHeader } from './recording-table-header';
import { RecordingRow } from './recording-table-row';
import { RecordingTableToolbar } from './recording-table-toolbar';

const styles = (theme: Theme) => createStyles({
    tableContainer: {
        marginTop: theme.spacing.unit * 2
    }
})

const _RecordingTable = (props: RecordingTableProps) => {
    const { classes, onPreview, onToggleSelectAll, onToggleSelect, selected, onDeleteSelected } = props;
   const recordings = props.recordings.concat().sort((a, b) => b.metadata.startTime - a.metadata.startTime );

    return <Paper className={ classes.tableContainer }>
        <RecordingTableToolbar 
            numSelected={ selected.length }
            onDeleteSelected={ onDeleteSelected } />
        <Table>
            <RecordingTableHeader 
                allSelected={ recordings.length === selected.length }
                onToggleAll={ onToggleSelectAll }
            />
            <TableBody>{
                recordings.map(recording => 
                    <RecordingRow 
                        recording={ recording }
                        selected={ selected.includes(recording) }
                        onPreview={ onPreview }
                        onToggle={ onToggleSelect }
                        key={ recording._id } />
                )
            }</TableBody>
        </Table>
    </Paper>
}

export interface RecordingTableProps extends WithStyles<typeof styles> {
    recordings: RecordingOverview[];
    selected: RecordingOverview[];

    onPreview: (thumbnail: RecordingOverview) => void;
    onToggleSelect: (recording: RecordingOverview) => void;
    onToggleSelectAll: (select: boolean) => void;
    onDeleteSelected: () => void;
}

export const RecordingTable = withStyles(styles)(_RecordingTable)