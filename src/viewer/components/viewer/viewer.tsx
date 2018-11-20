import * as React from 'react';
import './viewer.css';
import { RecordingHeader } from '../header/viewer-header';
import { RecordingControls } from '../footer-controls/footer-controls';
import { RecordingPlayer } from '../player/player';
import { DedupedData } from '../../../scraper/types/types';

export class Viewer extends React.Component<ViewerData, ViewerState> {

    private data: DedupedData;

    private startTime?: number;
    
    constructor(props: ViewerData) {
        super(props)
        this.data = props.data!;
        this.state = { currentTime: 0, isPlaying: false }
    }
    
    render() {
        return <div className="viewer">
            <RecordingHeader metadata={ this.data.metadata }></RecordingHeader>
            <RecordingPlayer 
                data={ this.data } 
                currentTime={ this.state.currentTime } 
                isPlaying={ this.state.isPlaying}></RecordingPlayer>
            { this.Controls() }
        </div>;
    }

    private Controls() {
        if(this.data.changes.length > 0) {
            return <RecordingControls 
                duration={ this.duration() }
                time={ this.state.currentTime }
                isPlaying={ this.state.isPlaying }
                onPlay={ this.play }
                onPause={ this.stop }
                onRestart={ this.restart }></RecordingControls> 
        } else {
            return null;
        }
    }

    private duration() {
        return this.data.metadata.stopTime
            ? this.data.metadata.stopTime - this.data.metadata.startTime
            : 0;
    }

    play = () => {
        if(!this.state.isPlaying) {
            this.setState({ isPlaying: true });
            this.animate();
        }
    }

    stop = () => {
        if(this.state.isPlaying) {
            this.setState({ isPlaying: false });
        }
    }

    restart = () => {
        this.setState({
            currentTime: 0,
        }, () => {
            this.play();
        });
    }

    private animate() {
        requestAnimationFrame((curr) => {
            let timeDiff = 0;
            if(this.startTime) {
                timeDiff = curr - this.startTime
            }
            this.startTime = curr;
            const currentTime = Math.min(this.state.currentTime + timeDiff, this.duration());
            if(timeDiff > 0) {
                this.setState({ currentTime });
            }
            if(currentTime >= this.duration()) {
                this.stop();
            } else {
                if(this.state.isPlaying) {
                    this.animate();
                }
            }
        });
    }
}

export interface ViewerData {
    data?: DedupedData;
}

export interface ViewerState {
    currentTime: number;
    isPlaying: boolean;
}