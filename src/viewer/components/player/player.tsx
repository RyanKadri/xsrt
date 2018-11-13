import React from "react";
import { MutationManager } from "../../../scraper/playback/mutation-manager";
import { UserInputPlaybackManager } from "../../../scraper/playback/user-input/user-input-manager";
import { DedupedData } from "../../../scraper/types/types";
import { DomManager } from "../../../scraper/playback/dom-utils";
import './player.css';

export class RecordingPlayer extends React.Component<PlayerInput> {

    private iframe: React.RefObject<HTMLIFrameElement>;
    private data: DedupedData;
    private lastTime: number;
    private mutationManager?: MutationManager;
    private domManager?: DomManager;
    private userInputManager?: UserInputPlaybackManager;

    constructor(props: PlayerInput){
        super(props) 
        this.iframe = React.createRef();
        this.data = this.props.data;
        this.lastTime = this.data.metadata.startTime;
    }

    render() {
        return <div className="player-container">
            { this.props.isPlaying ? <div className="input-guard"></div> : null }
            <iframe ref={this.iframe}></iframe>
        </div> 
    }

    async componentDidMount() {
        this.initializeIframe();
    }

    componentWillReceiveProps() { 
        const currentTime = this.data.metadata.startTime + this.props.currentTime; // TODO - Normalize times to durations
        if(currentTime < this.lastTime) {
            this.initializeIframe();
            this.lastTime = this.data.metadata.startTime;
        }

        const domChanges = this.data.changes.filter(change => change.timestamp > this.lastTime && change.timestamp < currentTime);
        this.mutationManager!.applyChanges(domChanges);
        
        const userInputs = Object.entries(this.data.inputs)
            .map(([channel, inputs]) => ({
                channel,
                updates: inputs.filter(input => input.timestamp > this.lastTime && input.timestamp < currentTime),
                preview: inputs.find(inp => inp.timestamp > currentTime)
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
}

export interface PlayerInput {
    data: DedupedData;
    currentTime: number;
    isPlaying: boolean;
}