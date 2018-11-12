import React from "react";
import { DocumentManager } from "../../../scraper/playback/mutation-manager";
import { UserInputPlaybackManager } from "../../../scraper/playback/user-input-manager";
import { DedupedData } from "../../../scraper/types/types";

export class RecordingPlayer extends React.Component<PlayerInput> {

    private iframe: React.RefObject<HTMLIFrameElement>;
    private data: DedupedData;
    private lastTime: number;
    private documentManager?: DocumentManager;
    private userInputManager?: UserInputPlaybackManager;

    constructor(props: PlayerInput){
        super(props) 
        this.iframe = React.createRef();
        this.data = this.props.data;
        this.lastTime = this.data.metadata.startTime;
    }

    render() {
        return <iframe ref={this.iframe}></iframe>;
    }

    componentDidMount() {
        if(this.data.root && this.iframe.current && this.iframe.current.contentDocument) {
            this.documentManager = new DocumentManager(this.iframe.current.contentDocument);
            this.userInputManager = new UserInputPlaybackManager(this.iframe.current.contentDocument);
            this.documentManager.renderSnapshot(this.data);
        }
    }

    componentWillReceiveProps() { 
        const currentTime = this.data.metadata.startTime + this.props.currentTime; // TODO - Normalize times to durations
        if(this.documentManager && currentTime > this.lastTime) {
            const domChanges = this.data.changes.filter(change => change.timestamp > this.lastTime && change.timestamp < currentTime);
            this.documentManager.applyChanges(domChanges);
            
            const userInputs = this.data.inputs.filter(input => input.timestamp > this.lastTime && input.timestamp < currentTime);
            this.userInputManager!.simulateUserInputs(userInputs);

            this.lastTime = currentTime;
        } else if(currentTime < this.lastTime) {
            throw new Error('Not sure how to rewind yet')
        }
    }
}

export interface PlayerInput {
    data: DedupedData;
    currentTime: number;
}