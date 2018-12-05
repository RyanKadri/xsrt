import React from "react";
import { DedupedData } from "../../../../scraper/types/types";
import { PlaybackManager } from "@scraper/playback/playback-manager";
import { withDependencies } from "../../../services/with-dependencies";
import { withStyles, createStyles, WithStyles, Theme } from "@material-ui/core";
import c from 'classnames';

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
    private data: DedupedData;

    constructor(props: PlayerInput){
        super(props) 
        this.state = { scale: 0 }
        this.iframe = React.createRef();
        this.viewPort = React.createRef();
        this.data = this.props.data;
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
        this.initializeIframe();
    }

    componentDidUpdate(prevProps: PlayerInput) { 
        if(this.props.currentTime < prevProps.currentTime) {
            this.initializeIframe();
        }

        this.props.playbackManager.play(this.data, prevProps.currentTime, this.props.currentTime);
    }

    private initializeIframe() {
        const currDocument = this.iframe.current && this.iframe.current.contentDocument
        if(this.data.root && currDocument) {
            this.props.playbackManager.initialize(currDocument, this.data)
        }
    }
    
    private initializeViewer() {
        window.addEventListener('resize', this.calcSize);
        this.calcSize();
    }
    
    private calcSize = () => {
        if(this.viewPort.current) {
            const bb = this.viewPort.current.getBoundingClientRect();
            const horizScale = bb.width / this.data.metadata.viewportWidth;
            const vertScale = bb.height / this.data.metadata.viewportHeight;
            this.setState({
                scale: Math.min(horizScale, vertScale)
            })
        }
    }

    private iframeDimensions(): React.CSSProperties {
        return {
            height: this.data.metadata.viewportHeight,
            width: this.data.metadata.viewportWidth,
            transform: `translate(-50%, -50%) scale(${ this.state.scale })`
        };
    }

}

export const RecordingPlayer = withStyles(styles)(
    withDependencies(_RecordingPlayer, { playbackManager: PlaybackManager })
);

export interface PlayerInput extends WithStyles<typeof styles> {
    data: DedupedData;
    currentTime: number;
    isPlaying: boolean;
    playbackManager: PlaybackManager
}

export interface PlayerState {
    scale: number;
}