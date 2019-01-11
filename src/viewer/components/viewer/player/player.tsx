import { createStyles, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import c from 'classnames';
import React from "react";
import { between } from "../../../../common/utils/functional-utils";
import { PlaybackManager } from '../../../../scraper/playback/playback-manager';
import { RecordedResize } from '../../../../scraper/types/event-types';
import { RecordedMutationGroup, RecordingMetadata, SnapshotChunk } from "../../../../scraper/types/types";
import { withDependencies } from "../../../services/with-dependencies";
import { eventsBetween, UserInputGroup } from "../../utils/recording-data-utils";

const styles = (theme: Theme) => createStyles({
    horizExpand: {
        width: '100%',
        height: '100%',
        flexGrow: 1,
        border: 'none'
    },
    
    playerContainer: {
        display: 'flex',
        position: 'absolute',
        background: theme.palette.grey[800],
        overflow: 'hidden',
    },
    
    inputGuard: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 10
    },

    errorOverlay: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99,
    },
    
    player: {
        transformOrigin: 'center',
        top: '50%',
        left: '50%',
        position: 'absolute',
    }
})

class _RecordingPlayer extends React.PureComponent<RecordingPlayerProps, PlayerState> {

    private iframe: React.RefObject<HTMLIFrameElement>;
    private viewPort: React.RefObject<HTMLDivElement>;

    constructor(props: RecordingPlayerProps){
        super(props);
        const { viewportHeight, viewportWidth } = props.snapshots[0].snapshot.documentMetadata
        this.state = { scale: 0, height: viewportHeight, width: viewportWidth }
        this.iframe = React.createRef();
        this.viewPort = React.createRef();
    }

    render() {
        const { classes } = this.props;
        return <div className={ c(classes.horizExpand, classes.playerContainer) } ref={this.viewPort}>
            { (this.props.isPlaying || this.props.lockUI) ? <div className={ classes.inputGuard } /> : null }
            { this.props.error ? <div className={ classes.errorOverlay } >
                <Typography variant="h2" color="inherit">{ this.props.error }</Typography>
            </div> : null}
            <iframe className={ c(classes.player, classes.horizExpand) } ref={this.iframe} src="about:blank" style={ this.iframeDimensions() }></iframe>
        </div>
    }

    async componentDidMount() {
        this.initializeViewer();
    }

    componentDidUpdate(prevProps: RecordingPlayerProps) { 
        const prevTime = prevProps.currentTime <= this.props.currentTime ? prevProps.currentTime : 0;
        const snapshots = this.props.snapshots
            .filter(snapshot => between(snapshot.metadata.startTime, prevTime, this.props.currentTime));
        const lastSnapshot = snapshots[snapshots.length - 1];
        
        const adjustedPrevTime = lastSnapshot ? lastSnapshot.metadata.startTime : prevTime;
        const { inputs, changes } = eventsBetween(this.props.changes, this.props.inputs, adjustedPrevTime, this.props.currentTime);

        if(this.props.currentTime < prevProps.currentTime || (lastSnapshot !== undefined && lastSnapshot !== this.state.currentSnapshot)) {
            this.setState({ currentSnapshot: lastSnapshot })
            this.initializeIframe(lastSnapshot);
        }

        this.props.playbackManager.play(changes, inputs);

        this.checkPlayerResize(inputs);
        this.checkPauseAnimations(prevProps.isPlaying);
    }

    private checkPlayerResize(inputGroups: UserInputGroup[]) {
        const resizeGroup = inputGroups.find(group => group.name === 'resize');
        if(resizeGroup && resizeGroup.elements.length > 0) {
            const lastResize = resizeGroup.elements[resizeGroup.elements.length - 1] as RecordedResize;
            this.setState({
                height: lastResize.height,
                width: lastResize.width
            }, this.calcSize) 
        }
    }

    private checkPauseAnimations(wasPlaying: boolean) {
        if(wasPlaying && !this.props.isPlaying) {
            this.props.playbackManager.togglePause(true);
        } else if (!wasPlaying && this.props.isPlaying) {
            this.props.playbackManager.togglePause(false);
        }
    }

    private initializeIframe(snapshot: SnapshotChunk) {
        const currDocument = this.iframe.current && this.iframe.current.contentDocument
        if(currDocument) {
            this.props.playbackManager.initialize(currDocument, snapshot);
        } else {
            throw new Error("Could not initialize player")
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

export interface RecordingPlayerProps extends WithStyles<typeof styles> {
    recordingMetadata: RecordingMetadata;
    snapshots: SnapshotChunk[];
    changes: RecordedMutationGroup[];
    inputs: UserInputGroup[];
    currentTime: number;
    isPlaying: boolean;
    error?: string;
    playbackManager: PlaybackManager;
    lockUI: boolean;
}

export interface PlayerState {
    currentSnapshot?: SnapshotChunk;
    height: number;
    width: number;
    scale: number;
}