import React from "react";
import { RecordingService, StoredMetadata } from "../../services/recording-service";
import { RecordingList } from "./recording-list/recording-list";

export type DashboardComponent = new (props: {}) => React.Component;
export const IDashboardView = Symbol('DashboardView');

export const DashboardView = (recordingService: RecordingService) =>
class extends React.Component<{}, DashboardState> {

    constructor(props: {}) { 
        super(props);
        this.state = {
            availableRecordings: undefined
        }
    }
    
    render() {
        return this.state.availableRecordings
            ? <RecordingList recordings={this.state.availableRecordings}></RecordingList>
            : <h1>Loading</h1>;
    }

    async componentDidMount() {
        const recordings = await recordingService.fetchAvailableRecordings();
        this.setState({ availableRecordings: recordings });
    }

}

interface DashboardState {
    availableRecordings?: StoredMetadata[];
}