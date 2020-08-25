import { createStyles, IconButton, makeStyles, Theme, Toolbar, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/DeleteSharp";
import FilterIcon from "@material-ui/icons/FilterList";
import RefreshIcon from "@material-ui/icons/Refresh";
import SettingsIcon from "@material-ui/icons/Settings";
import React from "react";

const useStyles = makeStyles((_: Theme) => createStyles({
  actions: {
    marginLeft: "auto"
  }
}));

export function RecordingTableToolbar(
  { numSelected, onRefresh, onDeleteSelected, onSettingsToggle, onFilterToggle }: Props
) {
  const classes = useStyles();
  return (
    <Toolbar>
      {numSelected > 0
        ? <Typography variant="subtitle1">{numSelected} recordings selected</Typography>
        : <Typography variant="h6">Recordings</Typography>}
      <div className={classes.actions}>
        {numSelected > 0
          ? <IconButton onClick={onDeleteSelected}><DeleteIcon /></IconButton>
          : <>
            <IconButton onClick={onRefresh}><RefreshIcon /></IconButton>
            <IconButton onClick={onFilterToggle}><FilterIcon /></IconButton>
            <IconButton onClick={onSettingsToggle}><SettingsIcon /></IconButton>
          </>
        }
      </div>
    </Toolbar>
  );
};

export interface Props {
  numSelected: number;
  onDeleteSelected(): void;
  onSettingsToggle(e: React.MouseEvent): void;
  onFilterToggle(e: React.MouseEvent): void;
  onRefresh(): void;
}
