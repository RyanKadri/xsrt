import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { RecordedMutationGroup } from "../../../scraper/record/dom-changes/mutation-recorder";
import { RecordedInputChannels, Recording, SnapshotChunk } from "../../../scraper/types/types";
import { ChunkApiService } from "../../services/chunk-api-service";
import { RecordingResolver } from "../../services/recording-service";
import { withData } from "../../services/with-data";
import { withDependencies } from "../../services/with-dependencies";
import { RecordingViewer } from "./viewer";

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: 480,
        height: `calc(100vh - ${theme.spacing.unit * 8}px)`
    }
})

const idealBuffer = 5000;

//TODO - This data-passing pattern may need to be rethought if/when there's a standalone viewer
class _RecordingView extends React.Component<RecordingViewData, RecordingViewState> {

    constructor(props: RecordingViewData) {
        super(props);
        this.state = {
            snapshots: [],
            changes: [],
            inputs: {},
            bufferPos: 0,
            requestedChunks: []
        }
    }

    render() {
        const { classes, recording } = this.props;
        return <div className={ classes.root }>
            <RecordingViewer 
                changes={ this.state.changes }
                inputs={ this.state.inputs }
                snapshots={ this.state.snapshots }
                recordingMetadata={ recording.metadata }
                bufferPos={ this.state.bufferPos }
                onUpdateTime={ this.updateBuffer }
                duration={ this.calcEnd() } />
        </div>
    }

    componentDidMount() {
        this.updateBuffer()
    }

    private updateBuffer = async (time = 0) => {
        const chunksToGrab = this.props.recording.chunks.filter(chunk => 
            chunk.metadata.startTime - time < idealBuffer && !this.state.requestedChunks.includes(chunk._id));
        this.setState(oldState => ({
            requestedChunks: oldState.requestedChunks.concat(chunksToGrab.map(chunk => chunk._id))
        }))

        chunksToGrab.forEach(chunk => {
            this.props.chunkService.fetchChunk(chunk._id)
                .then(chunk => {
                    if(chunk.type === 'snapshot') {
                        this.setState(oldState => ({
                            snapshots: oldState.snapshots.concat(chunk).sort((a,b) => a.metadata.startTime - b.metadata.startTime)
                        }))
                    }
                    this.setState(oldState => ({
                        changes: oldState.changes.concat(chunk.changes).sort((a,b) => a.timestamp - b.timestamp),
                        inputs: this.mergeInputs(oldState.inputs, chunk.inputs)
                    }))
                    if(chunksToGrab.every(toGrab => toGrab.metadata.startTime > chunk.metadata.startTime)) {
                        this.setState(oldState => ({
                            bufferPos: Math.max(oldState.bufferPos, chunk.metadata.stopTime)
                        }))
                    }
                })
        });
    }

    private mergeInputs(oldInputs: RecordedInputChannels, newInputs: RecordedInputChannels) {
        const allChannels = Array.from(new Set([...Object.keys(oldInputs), ...Object.keys(newInputs)]));
        return allChannels.map(channel => {
            return { 
                channel,
                inputs: (oldInputs[channel] || [])
                    .concat(newInputs[channel] || [])
                    .sort((a,b) => a.timestamp - b.timestamp)
            } 
        }).reduce((acc, el) => {
            acc[el.channel] = el.inputs;
            return acc;
        }, {})
    }

    private calcEnd() {
        return Math.max(
            ...this.props.recording.chunks.map(chunk => chunk.metadata.stopTime)
        )
    }
}

export const RecordingView = withStyles(styles)(
    withDependencies(
        withData(_RecordingView, { recording: RecordingResolver }),
        { chunkService: ChunkApiService }
    )
)

export interface RecordingViewData extends WithStyles<typeof styles> {
    recording: Recording;
    chunkService: ChunkApiService;
}

export interface RecordingViewState {
    snapshots: SnapshotChunk[];
    changes: RecordedMutationGroup[];
    inputs: RecordedInputChannels;
    bufferPos: number;
    requestedChunks: string[];
}