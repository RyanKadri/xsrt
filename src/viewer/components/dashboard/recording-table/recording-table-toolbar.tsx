import { createStyles, IconButton, Theme, Toolbar, Typography, WithStyles, withStyles } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import FilterIcon from '@material-ui/icons/FilterSharp';
import React from 'react';

const styles = (_: Theme) => createStyles({
    actions: {
        marginLeft: 'auto'
    }
})

const _RecordingTableToolbar = (props: RecordingTableToolbarProps) => {
    const { numSelected, classes } = props;
    return <Toolbar>
        { numSelected > 0 
            ? <Typography variant="subtitle1">{ numSelected } recordings selected</Typography>
            : <Typography variant="h6">Recordings</Typography>}
        <div className={classes.actions}>
            { numSelected > 0
                ? <IconButton><DeleteIcon /></IconButton>
                : <IconButton><FilterIcon /></IconButton>
            }
        </div>
    </Toolbar>
}

export const RecordingTableToolbar = withStyles(styles)(_RecordingTableToolbar)

export interface RecordingTableToolbarProps extends WithStyles<typeof styles> {
    numSelected: number; 
}