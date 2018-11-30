import React from "react";
import { DedupedData } from "../../../../scraper/types/types";
import styles from './player.css';
import { PlaybackManager } from "@scraper/playback/playback-manager";

export class RecordingPlayer extends React.Component<PlayerInput, PlayerState> {

    private iframe: React.RefObject<HTMLIFrameElement>;
    private viewPort: React.RefObject<HTMLDivElement>;
    private data: DedupedData;
    private lastTime: number;

    constructor(props: PlayerInput){
        super(props) 
        this.state = { scale: 0 }
        this.iframe = React.createRef();
        this.viewPort = React.createRef();
        this.data = this.props.data;
        this.lastTime = this.data.metadata.startTime;
    }

    render() {
        return <div className={ styles.playerContainer } ref={this.viewPort}>
            { this.props.isPlaying ? <div className={ styles.inputGuard }></div> : null }
            <iframe className={ styles.player } ref={this.iframe} src="about:blank" style={ this.iframeDimensions() }></iframe>
        </div>
    }

    async componentDidMount() {
        this.initializeViewer();
        this.initializeIframe();
    }

    componentWillReceiveProps() { 
        const currentTime = this.props.currentTime;
        if(currentTime < this.lastTime) {
            this.initializeIframe();
            this.lastTime = 0;
        }

        this.props.playbackManager.play(this.data, this.lastTime, currentTime);
        this.lastTime = currentTime;
        
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

export interface PlayerInput {
    data: DedupedData;
    currentTime: number;
    isPlaying: boolean;
    playbackManager: PlaybackManager
}

export interface PlayerState {
    scale: number;
}