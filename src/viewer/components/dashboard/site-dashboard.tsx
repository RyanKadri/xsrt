import { SiteTarget } from "@common/db/targets";
import { createStyles, Dialog, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import ExternalLink from '@material-ui/icons/OpenInBrowserSharp';
import React, { Fragment } from "react";
import { RecordingOverview } from "../../../scraper/types/types";
import { RecordingApiService, RecordingMetadataResolver } from "../../services/recording-service";
import { RecordingState } from '../../services/state/recording-overview-state';
import { withData } from "../../services/with-data";
import { withDependencies } from '../../services/with-dependencies';
import { RecordingTable } from "./recording-table/recording-table";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing.unit * 2
    },
    externalLink: {
        marginLeft: theme.spacing.unit
    }
});

class _SiteDashboardView extends React.Component<DashboardViewProps, DashboardState> {

    constructor(props: DashboardViewProps) { 
        super(props);
        this.state = {
            preview: undefined,
            selected: []
        }
    }
    
    render() {
        const { classes } = this.props;
        return <div className={ classes.root }>{ 
            !this.props.site
                ? <Typography variant="body1">This site no longer exists</Typography>
                : <Fragment>
                    <Typography variant="h4">{ this.props.site.name }
                        <a  target="_blank" className={classes.externalLink}
                            href={ `https://${this.props.site.url || this.props.site.identifier}` }>
                            <ExternalLink />
                        </a>
                    </Typography>
                    { this.props.recordings.length === 0 
                      ? <Typography variant="body1">No recordings yet...</Typography>
                      : <RecordingTable 
                            recordings={ this.props.recordings }
                            selected={ this.state.selected }
                            onPreview={ this.onPreview }
                            onToggleSelect={ this.onToggleSelect }
                            onToggleSelectAll={ this.onToggleSelectAll }
                            onDeleteSelected={ this.onDeleteSelected }
                        /> 
                    }
                    <Dialog maxWidth='lg'
                        open={ this.state.preview !== undefined }
                        onClose={ this.onClose }>{
                        this.state.preview && this.state.preview.thumbnail 
                            ? <img src={`/screenshots/${this.state.preview!.thumbnail}`}></img>
                            : <p>No image</p>
                    }</Dialog>
                </Fragment>
        }</div>
    }

    private onPreview = (preview: RecordingOverview) => {
        this.setState({
            preview
        })
    }

    private onClose = () => {
        this.setState({
            preview: undefined
        })
    }

    private onToggleSelect = (recording: RecordingOverview) => {
        this.setState(({ selected }) => ({
            selected: selected.includes(recording)
                ? selected.filter(rec => rec !== recording)
                : selected.concat(recording)
        }))
    }

    private onToggleSelectAll = (shouldSelect: boolean) => {
        this.setState(() => ({
            selected: shouldSelect
                ? this.props.recordings
                : []
        }))
    }

    private onDeleteSelected = async () => {
        try {
            await this.props.recordingsApi.deleteRecordings(this.state.selected);
            this.setState(({ selected: [] }))
        } catch(e) {

        }
    }

}

export const SiteDashboardView = withStyles(styles)(
    withDependencies(
        withData(_SiteDashboardView, { recordings: {
            resolver: RecordingMetadataResolver,
            state: RecordingState,
            criteria: () => true,
            unique: false
        } }),
        { recordingsApi: RecordingApiService }
    )
)

interface DashboardViewProps extends WithStyles<typeof styles> {
    recordings: RecordingOverview[];
    site: SiteTarget;
    recordingsApi: RecordingApiService
}

interface DashboardState {
    preview?: RecordingOverview;
    selected: RecordingOverview[]
}