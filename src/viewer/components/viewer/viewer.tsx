import * as React from 'react';
import { hot } from 'react-hot-loader';
import { ScrapedHtmlElement } from '../../../scraper/types/types'
import { serializeToDocument } from '../../../scraper/serialize/serialize'
import './viewer.css';
import { ScrapeData } from '../../../scraper/merge/merge-dom-styles';
import { ScrapeMetadata } from '../../../scraper/traverse/extract-metadata';

class Viewer extends React.Component<ViewerData> {
    private iframe: React.RefObject<HTMLIFrameElement>;
    private root: ScrapedHtmlElement;
    private metadata: ScrapeMetadata;
    
    constructor(props: ViewerData) {
        super(props)
        this.iframe = React.createRef();
        if(!props.data) throw new Error('No data provided');
        this.root = props.data.root;
        this.metadata = props.data.metadata;
    }
    render() {
        const scrapeDate = new Date(this.metadata.timestamp);
        const urlInf = this.metadata.url;
        const portPart = !!urlInf.port ? `:${urlInf.port}`: '';
        
        const shortUrl = `${ urlInf.hostname }${ portPart }${ urlInf.path }`;
        const fullUrl = `${ urlInf.protocol }//${shortUrl}`;
        return <div className="viewer">
            <header>
                Viewing screenshot from 
                <small className="date">{ scrapeDate.toLocaleDateString('en-US') }</small>
                <a target="_blank" href={ fullUrl } className="url">{ shortUrl }</a>
            </header>
            { this.root ? 
                <iframe ref={this.iframe}></iframe> :
                undefined 
            }
        </div>;
    }

    componentDidMount() {
        if(this.root) {
            const content = serializeToDocument(this.root);
            if(this.iframe.current && this.iframe.current.contentDocument) {
                this.iframe.current.contentDocument.write(content)
            }
        }
    }
}

export default hot(module)(Viewer);

export interface ViewerData {
    data?: ScrapeData;
}