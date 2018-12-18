import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import { PlaybackManager } from "@scraper/playback/playback-manager";
import c from 'classnames';
import React from "react";
import { between } from "../../../../common/utils/functional-utils";
import { RecordedMutationGroup } from "../../../../scraper/record/dom-changes/mutation-recorder";
import { RecordedResize } from "../../../../scraper/record/user-input/resize-recorder";
import { RecordedInputChannels, RecordingMetadata, SnapshotChunk } from "../../../../scraper/types/types";
import { withDependencies } from "../../../services/with-dependencies";
import { eventsBetween, UserInputGroup } from "../../utils/recording-data-utils";

const styles = (theme: Theme) => createStyles({
    horizExpand: {
        width: '100%',
        flexGrow: 1,
        border: 'none'
    },
    
    playerContainer: {
        display: 'flex',
        position: 'relative',
        background: theme.palette.grey[800],
        overflow: 'hidden',
    },
    
    inputGuard: {
        width: '100%',
        height: '100%',
        position: 'absolute'
    },
    
    player: {
        transformOrigin: 'center',
        top: '50%',
        left: '50%',
        position: 'absolute',
    }
})

class _RecordingPlayer extends React.Component<PlayerInput, PlayerState> {

    private iframe: React.RefObject<HTMLIFrameElement>;
    private viewPort: React.RefObject<HTMLDivElement>;

    constructor(props: PlayerInput){
        super(props);
        const { viewportHeight, viewportWidth } = props.snapshots[0].snapshot.documentMetadata
        this.state = { scale: 0, height: viewportHeight, width: viewportWidth }
        this.iframe = React.createRef();
        this.viewPort = React.createRef();
    }

    render() {
        const { classes } = this.props;
        return <div className={ c(classes.horizExpand, classes.playerContainer) } ref={this.viewPort}>
            { this.props.isPlaying ? <div className={ classes.inputGuard }></div> : null }
            <iframe className={ c(classes.player, classes.horizExpand) } ref={this.iframe} src="about:blank" style={ this.iframeDimensions() }></iframe>
        </div>
    }

    async componentDidMount() {
        this.initializeViewer();
        this.props.snapshots[0];
        this.initializeIframe(this.props.snapshots[0]);
    }

    componentDidUpdate(prevProps: PlayerInput) { 
        const prevTime = prevProps.currentTime <= this.props.currentTime ? prevProps.currentTime : 0; 
        const snapshots = this.props.snapshots
            .filter(snapshot => between(prevTime, this.props.currentTime)(snapshot.metadata.startTime));
        const lastSnapshot = snapshots[snapshots.length - 1];
        const adjustedPrevTime = lastSnapshot ? lastSnapshot.metadata.startTime : prevTime;
        const { inputs, changes } = eventsBetween(this.props.changes, this.props.inputs, adjustedPrevTime, this.props.currentTime);

        if(this.props.currentTime < prevProps.currentTime || lastSnapshot) {
            this.initializeIframe(lastSnapshot);
        }

        this.props.playbackManager.play(changes, inputs);

        this.checkPlayerResize(inputs);
    }

    private checkPlayerResize(inputGroups: UserInputGroup[]) {
        const resizeGroup = inputGroups.find(group => group.channel === 'resize');
        if(resizeGroup && resizeGroup.updates.length > 0) {
            const lastResize = resizeGroup.updates[resizeGroup.updates.length - 1] as RecordedResize;
            this.setState({
                height: lastResize.height,
                width: lastResize.width
            }, this.calcSize) 
        }
    }

    private initializeIframe(snapshot: SnapshotChunk) {
        const currDocument = this.iframe.current && this.iframe.current.contentDocument
        // TODO. Should I think about case where recording is not ready?
        if(currDocument) {
            this.props.playbackManager.initialize(currDocument, snapshot);
        }
    }
    
    private initializeViewer() {
        window.addEventListener('resize', this.calcSize);
        this.calcSize();
    }
    
    private calcSize = () => {
        if(this.viewPort.current) {
            const bb = this.viewPort.current.getBoundingClientRect();
            const horizScale = bb.width / this.state.width;
            const vertScale = bb.height / this.state.height;
            this.setState({
                scale: Math.min(horizScale, vertScale)
            })
        }
    }

    private iframeDimensions(): React.CSSProperties {
        return {
            height: this.state.height,
            width: this.state.width,
            transform: `translate(-50%, -50%) scale(${ this.state.scale })`
        };
    }

}

export const RecordingPlayer = withStyles(styles)(
    withDependencies(_RecordingPlayer, { playbackManager: PlaybackManager })
);

export interface PlayerInput extends WithStyles<typeof styles> {
    recordingMetadata: RecordingMetadata;
    snapshots: SnapshotChunk[];
    changes: RecordedMutationGroup[];
    inputs: RecordedInputChannels;
    currentTime: number;
    isPlaying: boolean;
    playbackManager: PlaybackManager
}

export interface PlayerState {
    height: number;
    width: number;
    scale: number;
}