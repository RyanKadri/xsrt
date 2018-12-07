import React, { Fragment } from "react";
import { RecordingMetadataResolver, StoredMetadata } from "../../services/recording-service";
import { Typography, createStyles, withStyles, WithStyles, Theme, Dialog } from "@material-ui/core";
import ExternalLink from '@material-ui/icons/OpenInBrowserSharp'; 
import { RecordingList } from "./recording-list/recording-list";
import { SiteTarget } from "@common/db/targets";
import { withData } from "../../services/with-data";

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
        }
    }
    
    // TODO. More fully flesh out url
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
                    <RecordingList recordings={ this.props.recordings } onPreview={ this.onPreview } />
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

    private onPreview = (preview: StoredMetadata) => {
        this.setState({
            preview
        })
    }

    private onClose = () => {
        this.setState({
            preview: undefined
        })
    }

}

export const SiteDashboardView = withStyles(styles)(
    withData(_SiteDashboardView, { recordings: RecordingMetadataResolver })
)

interface DashboardViewProps extends WithStyles<typeof styles> {
    recordings: StoredMetadata[]
    site: SiteTarget
}

interface DashboardState {
    preview?: StoredMetadata;
}