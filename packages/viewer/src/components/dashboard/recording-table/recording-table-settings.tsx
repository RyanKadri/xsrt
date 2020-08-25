import { Checkbox, List, ListItem, ListItemText, Popover } from "@material-ui/core";
import React from "react";
import { allowedRecordingTableColumns, RecordingColumn } from "./available-columns";

const toggleCol = (col: RecordingColumn, settings: RecordingTableSettings): RecordingTableSettings => {
  return {
    columns: settings.columns.includes(col)
      ? settings.columns.filter(settingsCol => settingsCol !== col)
      : allowedRecordingTableColumns.filter(allowed =>
        [...settings.columns, col].some(test => test.key === allowed.key)
      )
  };
};

interface Props {
  open: boolean;
  onClose: () => void;
  availableColumns: RecordingColumn[];
  settings: RecordingTableSettings;
  onChangeSettings: (settings: RecordingTableSettings) => void;
  anchor: HTMLElement | null;
}

export function RecordingTableSettings(
  { open, onClose, availableColumns, settings, onChangeSettings, anchor }: Props
) {
  return (
    <Popover onClose={onClose} open={open} anchorEl={anchor} >
      <List>{
        availableColumns.map(col =>
          <ListItem key={col.key}
            onClick={() => onChangeSettings(toggleCol(col, settings))}
          >
            <Checkbox
              checked={settings.columns.some(selected => selected.key === col.key)}
            />
            <ListItemText>{col.header}</ListItemText>
          </ListItem>
        )
      }</List>
    </Popover>
  );
};

export interface RecordingTableSettings {
  columns: RecordingColumn[];
}
