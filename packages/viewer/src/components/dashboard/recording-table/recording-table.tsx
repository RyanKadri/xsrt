import { createStyles, Paper, Table, TableBody, Theme, withStyles, WithStyles } from "@material-ui/core";
import { RecordingOverview } from "@xsrt/common";
import React, { useState } from "react";
import { UIConfigService } from "../../../services/ui-config-service";
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

const _RecordingTable = (props: RecordingTableProps) => {

    const { classes, onPreview, onToggleSelectAll, onToggleSelect, uiConfigService,
            selected, onDeleteSelected } = props;

    const [state, setState] = useState<RecordingTableState>({
        settings: uiConfigService.loadRecordingsTableConfig(),
        settingsDialogOpen: false,
        settingsDialogAnchor: null
    });

    const recordings = props.recordings.concat().sort((a, b) => b.metadata.startTime - a.metadata.startTime );

    const onSettingsToggle = (e: React.MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        setState((old) => ({
            ...old,
            settingsDialogOpen: !old.settingsDialogOpen,
            settingsDialogAnchor: target
        }));
    };

    const onSettingsClose = () => {
        setState(old => ({ ...old, settingsDialogOpen: false }));
    };

    const onSettingsChange = (settings: RecordingTableSettings) => {
        setState(old => ({ ...old, settings }));
        uiConfigService.saveRecordingsTableConfig(settings);
    };

    return <Paper className={ classes.tableContainer }>
        <RecordingTableToolbar
            numSelected={ selected.length }
            onDeleteSelected={ onDeleteSelected }
            onFilterSelected={ onSettingsToggle } />
        <Table>
            <RecordingTableHeader
                displayColumns={ state.settings.columns }
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
                        key={ recording._id }
                        displayColumns={ state.settings.columns }
                    />
                )
            }</TableBody>
        </Table>
        <RecordingTableSettings
            open={ state.settingsDialogOpen }
            availableColumns={ allowedRecordingTableColumns }
            onChangeSettings= { onSettingsChange }
            settings={ state.settings }
            onClose={ onSettingsClose }
            anchor={ state.settingsDialogAnchor }
        />
    </Paper>;
};

export interface RecordingTableProps extends WithStyles<typeof styles> {
    uiConfigService: UIConfigService;

    recordings: RecordingOverview[];
    selected: RecordingOverview[];

    onPreview: (thumbnail: RecordingOverview) => void;
    onToggleSelect: (recording: RecordingOverview) => void;
    onToggleSelectAll: (select: boolean) => void;
    onDeleteSelected: () => void;
}

export interface RecordingTableState {
    settings: RecordingTableSettings;
    settingsDialogOpen: boolean;
    settingsDialogAnchor: HTMLElement | null;
}

export const RecordingTable = withStyles(styles)(_RecordingTable);
