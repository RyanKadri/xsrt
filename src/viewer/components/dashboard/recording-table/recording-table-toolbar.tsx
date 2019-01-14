import { createStyles, IconButton, Theme, Toolbar, Typography, WithStyles, withStyles } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/DeleteSharp";
import SettingsIcon from "@material-ui/icons/Settings";
import React from "react";

const styles = (_: Theme) => createStyles({
    actions: {
        marginLeft: "auto"
    }
});

const _RecordingTableToolbar =
    ({ numSelected, onDeleteSelected, onFilterSelected, classes }: RecordingTableToolbarProps) => {
    return <Toolbar>
        { numSelected > 0
            ? <Typography variant="subtitle1">{ numSelected } recordings selected</Typography>
            : <Typography variant="h6">Recordings</Typography>}
        <div className={classes.actions}>
            { numSelected > 0
                ? <IconButton onClick={ onDeleteSelected }><DeleteIcon /></IconButton>
                : <IconButton onClick={ onFilterSelected }><SettingsIcon /></IconButton>
            }
        </div>
    </Toolbar>;
};

export const RecordingTableToolbar = withStyles(styles)(_RecordingTableToolbar);

export interface RecordingTableToolbarProps extends WithStyles<typeof styles> {
    numSelected: number;
    onDeleteSelected: () => void;
    onFilterSelected: (e: React.MouseEvent) => void;
}
