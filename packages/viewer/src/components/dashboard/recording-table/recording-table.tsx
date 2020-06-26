import { createStyles, Paper, Table, TableBody, Theme, withStyles, WithStyles } from "@material-ui/core";
import { RecordingOverview } from "@xsrt/common";
import React, { useReducer, useState } from "react";
import { UIConfigService } from "../../../services/ui-config-service";
import { useDialog } from "../../utils/useDialog";
import { allowedRecordingTableColumns } from "./available-columns";
import { RecordingTableFilter } from "./recording-table-filter";
import { RecordingTableHeader } from "./recording-table-header";
import { RecordingRow } from "./recording-table-row";
import { RecordingTableSettings } from "./recording-table-settings";
import { RecordingTableToolbar } from "./recording-table-toolbar";

const styles = (theme: Theme) => createStyles({
    tableContainer: {
        marginTop: theme.spacing(2)
    }
});

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
    start: null,
    end: null,
    url: ""
};

const _RecordingTable = (props: RecordingTableProps) => {

    const { classes, onRefresh, onDeleteSelected, onPreview, uiConfigService } = props;

    const settingsDialog = useDialog(false);
    const filterDialog = useDialog(false);

    const [ settings, updateSettings ] = useState(uiConfigService.loadRecordingsTableConfig());
    const [ filter, updateFilter ] = useState(initFilter);

    const [ selected, dispatch ] = useReducer(reducer, []);

    const recordings = props.recordings.concat().sort((a, b) => b.metadata.startTime - a.metadata.startTime );

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

    return <Paper className={ classes.tableContainer }>
        <RecordingTableToolbar
            numSelected={ selected.length }
            onDeleteSelected={ onDelete }
            onSettingsToggle={ e => settingsDialog.openDialog(e.currentTarget as HTMLElement) }
            onFilterToggle={ e => filterDialog.openDialog(e.currentTarget as HTMLElement)}
            onRefresh={ () => onRefresh(filter) } />
        <Table>
            <RecordingTableHeader
                displayColumns={ settings.columns }
                allSelected={ recordings.length === selected.length }
                onToggleAll={ () => dispatch({ type: "selectAll", recordings }) }
            />
            <TableBody>{
                recordings.map(recording =>
                    <RecordingRow
                        recording={ recording }
                        selected={ selected.includes(recording) }
                        onPreview={ onPreview }
                        onToggle={ () => dispatch({ type: "toggle", recording }) }
                        key={ recording._id }
                        displayColumns={ settings.columns }
                    />
                )
            }</TableBody>
        </Table>
        <RecordingTableSettings
            open={ settingsDialog.open }
            availableColumns={ allowedRecordingTableColumns }
            onChangeSettings= { onSettingsChange }
            settings={ settings }
            onClose={ settingsDialog.closeDialog }
            anchor={ settingsDialog.anchorEl }
        />
        <RecordingTableFilter
            open={ filterDialog.open }
            anchor={ filterDialog.anchorEl }
            onClose={ filterDialog.closeDialog }
            filter={ filter }
            onUpdateFilter={ onFilterChange }
        />
    </Paper>;
};

interface RecordingTableProps extends WithStyles<typeof styles> {
    uiConfigService: UIConfigService;

    recordings: RecordingOverview[];

    onPreview(recording: RecordingOverview): void;
    onDeleteSelected(selected: RecordingOverview[]): Promise<void>;
    onRefresh(filter: RecordingTableFilter): void;
}

type Action = { type: "toggle", recording: RecordingOverview } |
    { type: "selectAll", recordings: RecordingOverview[] } |
    { type: "deselectAll" };

export const RecordingTable = withStyles(styles)(_RecordingTable);
