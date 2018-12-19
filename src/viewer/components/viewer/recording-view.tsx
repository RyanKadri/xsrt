import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { pluck, sortAsc } from "../../../common/utils/functional-utils";
import { RecordedMutationGroup } from "../../../scraper/record/dom-changes/mutation-recorder";
import { mergeChanneledInputs } from "../../../scraper/record/user-input/input-utils";
import { RecordedInputChannels, Recording, RecordingChunk, SnapshotChunk } from "../../../scraper/types/types";
import { AnnotationService, RecordingAnnotation } from "../../services/annotation/annotation-service";
import { ChunkApiService } from "../../services/chunk-api-service";
import { RecordingResolver } from "../../services/recording-service";
import { withData } from "../../services/with-data";
import { withDependencies } from "../../services/with-dependencies";
import { eventsBetween } from "../utils/recording-data-utils";
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
            bufferPos: 0,
            requestedChunks: [],
            retrievedChunks: [],

            snapshots: [],
            changes: [],
            inputs: {},
            annotations: []
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
                annotations={ this.state.annotations }

                bufferPos={ this.state.bufferPos }
                onUpdateTime={ this.updateBuffer }
                duration={ this.calcEnd() } />
        </div>
    }

    componentDidMount() {
        this.updateBuffer()
    }

    private sortByTimestamp = sortAsc(pluck('timestamp'));
    private sortSnapshot = sortAsc<SnapshotChunk>(snap => snap.metadata.startTime);

    private updateBuffer = async (time = 0) => {
        const chunksToGrab = this.props.recording.chunks.filter(chunk => 
            chunk.metadata.startTime - time < idealBuffer && !this.state.requestedChunks.includes(chunk._id));

        this.setState(oldState => ({
            requestedChunks: oldState.requestedChunks.concat(chunksToGrab.map(chunk => chunk._id))
        }))

        chunksToGrab.forEach(async chunkShell => {
            const chunk = await this.props.chunkService.fetchChunk(chunkShell._id)
            this.processChunk(chunk);
        });
    }

    private processChunk(chunk: RecordingChunk) {
        this.setState(oldState => {
            const snapshots = oldState.snapshots.concat(chunk.type === 'snapshot' ? chunk : [])
                .sort(this.sortSnapshot)
            const changes = oldState.changes.concat(chunk.changes)
                .sort(this.sortByTimestamp)
            const inputs = mergeChanneledInputs(oldState.inputs, chunk.inputs);

            const retrievedChunks = oldState.retrievedChunks.concat(chunk._id);
            const bufferPos = this.calcBuffer(retrievedChunks);

            const allEvents = eventsBetween(changes, inputs, 0, bufferPos);
            const annotations = this.props.annotationService.annotateChanges(allEvents.changes, allEvents.inputs, oldState.annotations);
            return {
                snapshots,
                changes, 
                inputs,
                annotations,
                retrievedChunks,
                bufferPos,
            }
        })
    }

    private calcEnd() {
        return Math.max(
            ...this.props.recording.chunks.map(chunk => chunk.metadata.stopTime)
        )
    }

    private calcBuffer(retrievedChunks: string[]) {
        const chunks = this.props.recording.chunks;
        const minStopNotFetched = Math.min(...chunks
            .filter(chunk => !retrievedChunks.includes(chunk._id))
            .map(chunk => chunk.metadata.stopTime)
        )
        const maxReady = Math.max(...chunks
            .filter(chunk => retrievedChunks.includes(chunk._id))
            .map(chunk => chunk.metadata.stopTime)
            .filter(start => start < minStopNotFetched)
        )
        return maxReady;
    }
}

export const RecordingView = withStyles(styles)(
    withDependencies(
        withData(_RecordingView, { recording: RecordingResolver }),
        { 
            chunkService: ChunkApiService,
            annotationService: AnnotationService
        }
    )
)

export interface RecordingViewData extends WithStyles<typeof styles> {
    recording: Recording;
    chunkService: ChunkApiService;
    annotationService: AnnotationService
}

export interface RecordingViewState {
    snapshots: SnapshotChunk[];
    changes: RecordedMutationGroup[];
    inputs: RecordedInputChannels;
    annotations: RecordingAnnotation[]

    bufferPos: number;
    requestedChunks: string[];
    retrievedChunks: string[];
}