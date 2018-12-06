import React, { Fragment } from "react";
import { RecordingMetadataResolver, StoredMetadata } from "../../services/recording-service";
import { Typography, createStyles, withStyles, WithStyles, Theme } from "@material-ui/core";
import ExternalLink from '@material-ui/icons/OpenInBrowserSharp'; 
import { RecordingList } from "./recording-list/recording-list";
import { SiteTarget } from "@common/db/targets";
import { withData } from "../../services/with-data";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing.unit * 2
    }
});

class _SiteDashboardView extends React.Component<DashboardViewProps> {

    constructor(props: DashboardViewProps) { 
        super(props);
        this.state = {
            availableRecordings: [],
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
                        <a target="_blank" href={ `https://${this.props.site.url || this.props.site.identifier}` }>
                            <ExternalLink />
                        </a>
                    </Typography>
                    <RecordingList recordings={ this.props.recordings } />
                </Fragment>
        }</div>
    }

}

export const SiteDashboardView = withStyles(styles)(
    withData(_SiteDashboardView, { recordings: RecordingMetadataResolver })
)

interface DashboardViewProps extends WithStyles<typeof styles> {
    recordings: StoredMetadata[]
    site: SiteTarget
}