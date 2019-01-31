import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import { convertMapToGroups, Group, mergeGroups, pluck, RecordedMutationGroup, RecordedUserInput, Recording, RecordingChunk, SnapshotChunk, sortAsc } from "@xsrt/common";
import { withDependencies } from "@xsrt/common-frontend";
import React from "react";
import { DomPreviewService } from "../../playback/dom-preview-service";
import { AnnotationService, RecordingAnnotation } from "../../services/annotation/annotation-service";
import { ChunkApiService } from "../../services/chunk-api-service";
import { RecordingResolver } from "../../services/recording-service";
import { Region, RegionService } from "../../services/regions-service";
import { RecordingState } from "../../services/state/recording-state";
import { TweakableConfigs } from "../../services/viewer-tweaks";
import { withData } from "../../services/with-data";
import { topNavHeight } from "../app-root/top-nav/top-nav";
import { eventsBetween } from "../utils/recording-data-utils";
import { RecordingViewer } from "./viewer";

const styles = (theme: Theme) => createStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        minHeight: 480,
        height: `calc(100vh - ${theme.spacing.unit * topNavHeight}px)`
    }
});

// TODO - This data-passing pattern may need to be rethought if/when there's a standalone viewer
class _RecordingView extends React.Component<RecordingViewProps, RecordingViewState> {

    constructor(props: RecordingViewProps) {
        super(props);
        this.state = {
            bufferPos: 0,
            requestedChunks: [],
            retrievedChunks: [],

            snapshots: [],
            changes: [],
            inputs: [],
            annotations: [],
            regions: []
        };
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
                regions={ this.state.regions }

                bufferPos={ this.state.bufferPos }
                onUpdateTime={ this.updateBuffer }
                duration={ this.calcEnd() } />
        </div>;
    }

    componentDidMount() {
        this.updateBuffer();
    }

    private sortByTimestamp = sortAsc(pluck("timestamp"));
    private sortSnapshot = sortAsc<SnapshotChunk>(snap => snap.metadata.startTime);

    private updateBuffer = async (time = 0) => {
        const chunksToGrab = this.props.recording.chunks.filter(chunk =>
            chunk.metadata.startTime - time < this.props.uiTweaks.idealBuffer
                && !this.state.requestedChunks.includes(chunk._id)
        );

        this.setState(oldState => ({
            requestedChunks: oldState.requestedChunks.concat(chunksToGrab.map(chunk => chunk._id))
        }));

        chunksToGrab.forEach(async chunkShell => {
            const chunk = await this.props.chunkService.fetchChunk(chunkShell._id);
            this.processChunk(chunk);
        });
    }

    private processChunk(chunk: RecordingChunk) {
        this.setState(oldState => {
            const snapshots = oldState.snapshots.concat(chunk.type === "snapshot" ? chunk : [])
                .sort(this.sortSnapshot);
            const changes = oldState.changes.concat(chunk.changes)
                .sort(this.sortByTimestamp);
            const inputs = mergeGroups(oldState.inputs, convertMapToGroups(chunk.inputs), this.sortByTimestamp);

            const retrievedChunks = oldState.retrievedChunks.concat(chunk._id);
            const bufferPos = this.calcBuffer(retrievedChunks);

            const allEvents = eventsBetween(changes, inputs, 0, bufferPos);
            this.props.previewService.registerUpdate({
                changes,
                snapshots
            });
            const annotations = this.props.annotationService.annotate(allEvents);
            const regions = this.props.regionService.splitRegions(allEvents, bufferPos);
            return {
                snapshots,
                changes,
                inputs,
                annotations,
                retrievedChunks,
                bufferPos,
                regions
            };
        });
    }

    private calcEnd() {
        return Math.max(
            ...this.props.recording.chunks.map(chunk => chunk.metadata.stopTime)
        );
    }

    private calcBuffer(retrievedChunks: string[]) {
        const chunks = this.props.recording.chunks;
        const minStopNotFetched = Math.min(...chunks
            .filter(chunk => !retrievedChunks.includes(chunk._id))
            .map(chunk => chunk.metadata.stopTime)
        );
        const maxReady = Math.max(...chunks
            .filter(chunk => retrievedChunks.includes(chunk._id))
            .map(chunk => chunk.metadata.stopTime)
            .filter(start => start < minStopNotFetched)
        );
        return maxReady;
    }
}

export const RecordingView = withStyles(styles)(
    withDependencies(
        withData(_RecordingView, { recording:
            { resolver: RecordingResolver, state: RecordingState, criteria: () => true, unique: true }
        }),
        {
            chunkService: ChunkApiService,
            annotationService: AnnotationService,
            previewService: DomPreviewService,
            regionService: RegionService,
            uiTweaks: TweakableConfigs
        }
    )
);

export interface RecordingViewProps extends WithStyles<typeof styles> {
    recording: Recording;
    chunkService: ChunkApiService;
    annotationService: AnnotationService;
    previewService: DomPreviewService;
    regionService: RegionService;
    uiTweaks: TweakableConfigs;
}

export interface RecordingViewState {
    snapshots: SnapshotChunk[];
    changes: RecordedMutationGroup[];
    inputs: Group<RecordedUserInput>[];
    annotations: RecordingAnnotation[];
    regions: Region[];

    bufferPos: number;
    requestedChunks: string[];
    retrievedChunks: string[];
}
