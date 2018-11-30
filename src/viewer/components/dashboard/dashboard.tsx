import React from "react";
import { RecordingApiService, MetadataGroup } from "../../services/recording-service";
import { RecordingGroup } from "./recording-group/recording-group";
import { Typography } from "@material-ui/core";
import styles from './dashboard.css';

export class DashboardView extends React.Component<DashboardViewProps, DashboardState> {

    constructor(props: DashboardViewProps) { 
        super(props);
        this.state = {
            availableRecordings: undefined,
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
        return !this.currentGroup
            ? <Typography variant="body1">There are not any recordings yet</Typography>
            :   <div className={ styles.dashboardView }>
                    <Typography variant="h4">{ this.currentGroup.site }</Typography>
                    <RecordingGroup group={ this.currentGroup }/>
                </div>
    }

    get currentGroup() {
        return this.state.availableRecordings
            ? this.state.availableRecordings[this.state.selectedSite]
            : null;
    }

    async componentDidMount() {
        const recordings = await this.props.recordingService.fetchAvailableRecordings();
        this.setState({ availableRecordings: recordings });
    }

}

interface DashboardViewProps {
    recordingService: RecordingApiService
}

interface DashboardState {
    availableRecordings?: MetadataGroup[];
    selectedSite: number;
}