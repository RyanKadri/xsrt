import React from "react";
import { DedupedData } from "../../../scraper/scrape";
import { DocumentManager } from "../../../scraper/serialize/document-manager";

export class RecordingPlayer extends React.Component<PlayerInput> {

    private iframe: React.RefObject<HTMLIFrameElement>;
    private data: DedupedData;
    private lastSliceEnd = 0;
    private documentManager?: DocumentManager;

    constructor(props: PlayerInput){
        super(props) 
        this.iframe = React.createRef();
        this.data = this.props.data;
    }

    render() {
        return <iframe ref={this.iframe}></iframe>;
    }

    componentDidMount() {
        if(this.data.root && this.iframe.current && this.iframe.current.contentDocument) {
            this.documentManager = new DocumentManager(this.iframe.current.contentDocument);
            this.documentManager.renderSnapshot(this.data);
        }
    }

    componentWillReceiveProps() { 
        if(this.documentManager && this.props.currentSlice + 1 > this.lastSliceEnd) {
            const changes = this.data.changes.slice(this.lastSliceEnd, this.props.currentSlice + 1);
            this.lastSliceEnd = this.props.currentSlice + 1;
            this.documentManager.applyChanges(changes);
        } else if(this.props.currentSlice + 1 < this.lastSliceEnd) {
            throw new Error('Not sure how to rewind yet')
        }
    }
}

export interface PlayerInput {
    data: DedupedData;
    currentSlice: number;
}