import React from "react";
import { RecordingService, MetadataGroup } from "../../services/recording-service";
import { RecordingGroupList } from "./recording-group/recording-group";

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
            ? <RecordingGroupList groups={this.state.availableRecordings}></RecordingGroupList>
            : <h1>Loading</h1>;
    }

    async componentDidMount() {
        const recordings = await recordingService.fetchAvailableRecordings();
        this.setState({ availableRecordings: recordings });
    }

}

interface DashboardState {
    availableRecordings?: MetadataGroup[];
}