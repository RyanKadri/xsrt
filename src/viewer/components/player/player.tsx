import React from "react";
import { MutationManager } from "../../../scraper/playback/mutation-manager";
import { UserInputPlaybackManager } from "../../../scraper/playback/user-input/user-input-manager";
import { DedupedData } from "../../../scraper/types/types";
import { DomManager } from "../../../scraper/playback/dom-utils";
import './player.css';

export class RecordingPlayer extends React.Component<PlayerInput, PlayerState> {

    private iframe: React.RefObject<HTMLIFrameElement>;
    private viewPort: React.RefObject<HTMLDivElement>;
    private data: DedupedData;
    private lastTime: number;
    private mutationManager?: MutationManager;
    private domManager?: DomManager;
    private userInputManager?: UserInputPlaybackManager;

    constructor(props: PlayerInput){
        super(props) 
        this.state = { scale: 0 }
        this.iframe = React.createRef();
        this.viewPort = React.createRef();
        this.data = this.props.data;
        this.lastTime = this.data.metadata.startTime;
    }

    render() {
        return <div className="player-container" ref={this.viewPort}>
            { this.props.isPlaying ? <div className="input-guard"></div> : null }
            <iframe ref={this.iframe} style={this.iframeDimensions()}></iframe>
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

        const domChanges = this.data.changes.filter(change => change.timestamp > this.lastTime && change.timestamp <= currentTime);
        this.mutationManager!.applyChanges(domChanges);
        
        const userInputs = Object.entries(this.data.inputs)
            .map(([channel, inputs]) => ({
                channel,
                updates: inputs.filter(input => input.timestamp > this.lastTime && input.timestamp <= currentTime),
                upcoming: inputs.filter(input => input.timestamp > currentTime),
                time: currentTime
            })).filter(req => req.updates.length > 0);
        this.userInputManager!.simulateUserInputs(userInputs);

        this.lastTime = currentTime;
        
    }

    private initializeIframe() {
        const currDocument = this.iframe.current && this.iframe.current.contentDocument
        if(this.data.root && currDocument) {
            this.domManager = new DomManager(currDocument);
            this.domManager.serializeToDocument(this.data);
            this.mutationManager = new MutationManager(this.domManager);
            this.userInputManager = new UserInputPlaybackManager(currDocument, this.domManager);
        }
    }
    
    private initializeViewer() {
        window.addEventListener('resize', this.calcSize);
        this.calcSize();
    }
    
    private calcSize = () => {
        if(this.viewPort.current) {
            const bb = this.viewPort.current!.getBoundingClientRect();
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
            transform: `scale(${ this.state.scale })`
        };
    }
}

export interface PlayerInput {
    data: DedupedData;
    currentTime: number;
    isPlaying: boolean;
}

export interface PlayerState {
    scale: number;
}