import React from "react";
import { RecordingService, MetadataGroup } from "../../services/recording-service";
import { RecordingGroup } from "./recording-group/recording-group";
import { Typography } from "@material-ui/core";
import styles from './dashboard.css';

export type DashboardComponent = new (props: {}) => React.Component;
export const IDashboardView = Symbol('DashboardView');

export const DashboardView = (recordingService: RecordingService) =>

class extends React.Component<{}, DashboardState> {

    constructor(props: {}) { 
        super(props);
        this.state = {
            availableRecordings: undefined,
            selectedSite: 0,
        }
    }
    
    render() {
        return !this.currentGroup
            ? <h1>Loading</h1>
            : (<div className={ styles.dashboardView }>
                <Typography variant="h4">{ this.currentGroup.site }</Typography>
                <RecordingGroup group={ this.currentGroup }/>
            </div>)
    }

    get currentGroup() {
        return this.state.availableRecordings
            ? this.state.availableRecordings[this.state.selectedSite]
            : null;
    }

    async componentDidMount() {
        const recordings = await recordingService.fetchAvailableRecordings();
        this.setState({ availableRecordings: recordings });
    }

}

interface DashboardState {
    availableRecordings?: MetadataGroup[];
    selectedSite: number;
}