import React from "react";
import { RecordingApiService } from "../../services/recording-service";
import { Typography } from "@material-ui/core";
import styles from './site-dashboard.css';
import { RouteComponentProps } from "react-router";
import { DedupedData } from "@scraper/types/types";
import { RecordingList } from "./recording-list/recording-list";
import { SiteTarget } from "@common/db/targets";

export class SiteDashboardView extends React.Component<DashboardViewProps, DashboardState> {

    constructor(props: DashboardViewProps) { 
        super(props);
        this.state = {
            availableRecordings: [],
            selectedSite: 0,
        }
    }
    
    render() {
        return <div className={ styles.dashboardView}>
            { !this.state.availableRecordings
                ? <h1>Loading</h1>
                : this.groupList()
            }
        </div>
    }

    private groupList = () => {
        return (!this.state.availableRecordings || !this.props.site )
            ? <Typography variant="body1">There are not any recordings yet</Typography>
            :   <div className={ styles.dashboardView }>
                    <Typography variant="h4">{ this.props.site.name }</Typography>
                    <RecordingList recordings={ this.state.availableRecordings as any || [] } />
                </div>
    }

    async componentDidMount() {
        const recordings = await this.props.recordingService.fetchAvailableRecordings(this.props.routeParams.match.params.siteId);
        this.setState({ availableRecordings: recordings });
    }

}

interface DashboardViewProps {
    routeParams: RouteComponentProps<{siteId: string}>
    recordingService: RecordingApiService
    site: SiteTarget
}

interface DashboardState {
    availableRecordings?: Partial<DedupedData>[];
    selectedSite: number;
}