import { createStyles, Paper, Table, TableBody, Theme, makeStyles } from "@material-ui/core";
import { RecordingOverview } from "../../../../../common/src";
import React, { useReducer, useState } from "react";
import { UIConfigService } from "../../../services/ui-config-service";
import { useDialog } from "../../utils/useDialog";
import { allowedRecordingTableColumns } from "./available-columns";
import { RecordingTableFilterComp, RecordingTableFilter } from "./recording-table-filter";
import { RecordingTableHeader } from "./recording-table-header";
import { RecordingRow } from "./recording-table-row";
import { RecordingTableSettings } from "./recording-table-settings";
import { RecordingTableToolbar } from "./recording-table-toolbar";

const useStyles = makeStyles((theme: Theme) => createStyles({
  tableContainer: {
    marginTop: theme.spacing(2)
  }
}));

function reducer(selected: RecordingOverview[], action: Action) {
  switch (action.type) {
    case "toggle":
      return selected.includes(action.recording)
        ? selected.filter(rec => rec !== action.recording)
        : selected.concat(action.recording);
    case "selectAll":
      return selected.length < action.recordings.length ? action.recordings : [];
    case "deselectAll":
      return [];
  }
}

const initFilter: RecordingTableFilter = {
  before: undefined,
  after: undefined,
  url: ""
};

interface Props {
  uiConfigService: UIConfigService;

  recordings: RecordingOverview[];

  onPreview(recording: RecordingOverview): void;
  onDeleteSelected(selected: RecordingOverview[]): Promise<void>;
  onRefresh(filter: RecordingTableFilter): void;
}

export function RecordingTable(props: Props) {

  const { onRefresh, onDeleteSelected, onPreview, uiConfigService } = props;
  const classes = useStyles();

  const settingsDialog = useDialog(false);
  const filterDialog = useDialog(false);

  const [settings, updateSettings] = useState(uiConfigService.loadRecordingsTableConfig());
  const [filter, updateFilter] = useState(initFilter);

  const [selected, dispatch] = useReducer(reducer, []);

  const recordings = props.recordings.concat().sort((a, b) => b.startTime - a.startTime);

  const onSettingsChange = (newSettings: RecordingTableSettings) => {
    updateSettings(newSettings);
    uiConfigService.saveRecordingsTableConfig(newSettings);
  };

  const onFilterChange = (newFilter: RecordingTableFilter) => {
    updateFilter(newFilter);
    onRefresh(newFilter);
  };

  const onDelete = async () => {
    await onDeleteSelected(selected);
    dispatch({ type: "deselectAll" });
  };

  return <Paper className={classes.tableContainer}>
    <RecordingTableToolbar
      numSelected={selected.length}
      onDeleteSelected={onDelete}
      onSettingsToggle={e => settingsDialog.openDialog(e.currentTarget as HTMLElement)}
      onFilterToggle={e => filterDialog.openDialog(e.currentTarget as HTMLElement)}
      onRefresh={() => onRefresh(filter)} />
    <Table>
      <RecordingTableHeader
        displayColumns={settings.columns}
        allSelected={recordings.length === selected.length}
        onToggleAll={() => dispatch({ type: "selectAll", recordings })}
      />
      <TableBody>{
        recordings.map(recording =>
          <RecordingRow
            recording={recording}
            selected={selected.includes(recording)}
            onPreview={onPreview}
            onToggle={() => dispatch({ type: "toggle", recording })}
            key={recording.uuid}
            displayColumns={settings.columns}
          />
        )
      }</TableBody>
    </Table>
    <RecordingTableSettings
      open={settingsDialog.open}
      availableColumns={allowedRecordingTableColumns}
      onChangeSettings={onSettingsChange}
      settings={settings}
      onClose={settingsDialog.closeDialog}
      anchor={settingsDialog.anchorEl}
    />
    <RecordingTableFilterComp
      open={filterDialog.open}
      anchor={filterDialog.anchorEl}
      onClose={filterDialog.closeDialog}
      filter={filter}
      onUpdateFilter={onFilterChange}
    />
  </Paper>;
};

type Action = { type: "toggle", recording: RecordingOverview } |
  { type: "selectAll", recordings: RecordingOverview[] } |
  { type: "deselectAll" };
