import React, { Fragment } from "react";
import { RecordingApiService } from "../../services/recording-service";
import { Typography, createStyles, withStyles, WithStyles, Theme } from "@material-ui/core";
import { RouteComponentProps } from "react-router";
import { DedupedData } from "@scraper/types/types";
import { RecordingList } from "./recording-list/recording-list";
import { SiteTarget } from "@common/db/targets";
import { withDependencies } from "../../services/with-dependencies";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing.unit * 2
    }
});

class _SiteDashboardView extends React.Component<DashboardViewProps, DashboardState> {

    constructor(props: DashboardViewProps) { 
        super(props);
        this.state = {
            availableRecordings: [],
        }
    }
    
    render() {
        const { classes } = this.props;
        return <div className={ classes.root }>
            { !this.state.availableRecordings
                ? <h1>Loading</h1>
                : this.groupList()
            }
        </div>
    }

    private groupList = () => {
        return (!this.state.availableRecordings || !this.props.site )
            ? <Typography variant="body1">There are not any recordings yet</Typography>
            :   <Fragment>
                    <Typography variant="h4">{ this.props.site.name }</Typography>
                    <RecordingList recordings={ this.state.availableRecordings as any || [] } />
                </Fragment>
    }

    async componentDidMount() {
        const recordings = await this.props.recordingService.fetchAvailableRecordings(this.props.routeParams.match.params.siteId);
        this.setState({ availableRecordings: recordings });
    }

}

export const SiteDashboardView = withStyles(styles)(
    withDependencies(_SiteDashboardView, { recordingService: RecordingApiService })
)

interface DashboardViewProps extends WithStyles<typeof styles> {
    routeParams: RouteComponentProps<{siteId: string}>
    recordingService: RecordingApiService
    site: SiteTarget
}

interface DashboardState {
    availableRecordings?: Partial<DedupedData>[];
}