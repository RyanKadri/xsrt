import React from "react";
import { DedupedData } from "../../../scraper/scrape";
import { serializeToDocument } from "../../../scraper/serialize/serialize";

export class RecordingPlayer extends React.Component<PlayerInput> {

    private iframe: React.RefObject<HTMLIFrameElement>;
    private data: DedupedData;

    constructor(props: PlayerInput){
        super(props) 
        this.iframe = React.createRef();
        this.data = this.props.data;
    }

    render() {
        console.log('render');
        return <iframe ref={this.iframe}></iframe>;
    }

    componentDidMount() {
        if(this.data.root && this.iframe.current && this.iframe.current.contentDocument) {
            const docType = `<!DOCTYPE ${this.data.metadata.docType}>`
            this.iframe.current.contentDocument.write(docType + '\n<html></html>');
            serializeToDocument(this.data, this.iframe.current.contentDocument);
        }
    }
}

export interface PlayerInput {
    data: DedupedData;
}