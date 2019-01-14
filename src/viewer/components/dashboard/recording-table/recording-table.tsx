import { createStyles, Paper, Table, TableBody, Theme, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { RecordingOverview } from "../../../../scraper/types/types";
import { UIConfigService } from "../../../services/ui-config-service";
import { withDependencies } from "../../../services/with-dependencies";
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

class _RecordingTable extends React.Component<RecordingTableProps, RecordingTableState> {

    constructor(props: RecordingTableProps) {
        super(props);
        this.state = {
            settings: props.uiConfigService.loadRecordingsTableConfig(),
            settingsDialogOpen: false,
            settingsDialogAnchor: null
        };
    }

    render() {
        const { classes, onPreview, onToggleSelectAll, onToggleSelect,
                selected, onDeleteSelected } = this.props;

        const recordings = this.props.recordings.concat().sort((a, b) => b.metadata.startTime - a.metadata.startTime );

        return <Paper className={ classes.tableContainer }>
            <RecordingTableToolbar
                numSelected={ selected.length }
                onDeleteSelected={ onDeleteSelected }
                onFilterSelected={ this.onSettingsToggle } />
            <Table>
                <RecordingTableHeader
                    displayColumns={ this.state.settings.columns }
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
                            displayColumns={ this.state.settings.columns }
                        />
                    )
                }</TableBody>
            </Table>
            <RecordingTableSettings
                open={ this.state.settingsDialogOpen }
                availableColumns={ allowedRecordingTableColumns }
                onChangeSettings= { this.onSettingsChange }
                settings={ this.state.settings }
                onClose={ this.onSettingsClose }
                anchor={ this.state.settingsDialogAnchor }
            />
        </Paper>;
    }

    onSettingsToggle = (e: React.MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        this.setState(({ settingsDialogOpen: filteringColumns }) => ({
            settingsDialogOpen: !filteringColumns,
            settingsDialogAnchor: target
        }));
    }

    onSettingsClose = () => {
        this.setState({ settingsDialogOpen: false });
    }

    onSettingsChange = (settings: RecordingTableSettings) => {
        this.setState({ settings });
        this.props.uiConfigService.saveRecordingsTableConfig(settings);
    }
}

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

export const RecordingTable = withDependencies(
    withStyles(styles)(_RecordingTable),
    { uiConfigService: UIConfigService }
);
