import { createStyles, Paper, Table, TableBody, Theme, withStyles, WithStyles } from "@material-ui/core";
import { RecordingOverview } from "@xsrt/common";
import React, { useReducer, useState } from "react";
import { UIConfigService } from "../../../services/ui-config-service";
import { useDialog } from "../../utils/useDialog";
import { allowedRecordingTableColumns } from "./available-columns";
import { RecordingTableHeader } from "./recording-table-header";
import { RecordingRow } from "./recording-table-row";
import { RecordingTableSettings } from "./recording-table-settings";
import { RecordingTableToolbar } from "./recording-table-toolbar";

const styles = (theme: Theme) => createStyles({
    tableContainer: {
        marginTop: theme.spacing.unit * 2
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

const _RecordingTable = (props: RecordingTableProps) => {

    const { classes, onRefresh, onDeleteSelected, onPreview, uiConfigService } = props;

    const { open, anchorEl, closeDialog, openDialog } = useDialog(false);
    const [ settings, updateSettings ] = useState(uiConfigService.loadRecordingsTableConfig());

    const [selected, dispatch] = useReducer(reducer, []);

    const recordings = props.recordings.concat().sort((a, b) => b.metadata.startTime - a.metadata.startTime );

    const onSettingsChange = (newSettings: RecordingTableSettings) => {
        updateSettings(newSettings);
        uiConfigService.saveRecordingsTableConfig(newSettings);
    };

    const onDelete = async () => {
        await onDeleteSelected(selected);
        dispatch({ type: "deselectAll" });
    };

    return <Paper className={ classes.tableContainer }>
        <RecordingTableToolbar
            numSelected={ selected.length }
            onDeleteSelected={ onDelete }
            onSettingsToggle={ e => openDialog(e.currentTarget as HTMLElement) }
            onRefresh={ onRefresh } />
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
            open={ open }
            availableColumns={ allowedRecordingTableColumns }
            onChangeSettings= { onSettingsChange }
            settings={ settings }
            onClose={ closeDialog }
            anchor={ anchorEl }
        />
    </Paper>;
};

interface RecordingTableProps extends WithStyles<typeof styles> {
    uiConfigService: UIConfigService;

    recordings: RecordingOverview[];

    onPreview(recording: RecordingOverview): void;
    onDeleteSelected(selected: RecordingOverview[]): Promise<void>;
    onRefresh(): void;
}

type Action = { type: "toggle", recording: RecordingOverview } |
    { type: "selectAll", recordings: RecordingOverview[] } |
    { type: "deselectAll" };

export const RecordingTable = withStyles(styles)(_RecordingTable);
