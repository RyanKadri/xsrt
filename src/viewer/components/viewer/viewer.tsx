import * as React from 'react';
import styles from './viewer.css';
import { RecordingControls } from './footer-controls/footer-controls';
import { DedupedData } from '../../../scraper/types/types';
import { PlayerComponentType } from './player/player';
import { match } from 'react-router';
import { Fragment } from 'react';
import { RecordingService } from '../../services/recording-service';

export type ViewerType = new (props: ViewerData) => React.Component<ViewerData, ViewerState>;
export const IViewerComponent = Symbol('Viewer');

export const ViewerComponent = (Player: PlayerComponentType, recordingService: RecordingService) => 
    class extends React.Component<ViewerData, ViewerState> {

    private startTime?: number;
    
    constructor(props: ViewerData) {
        super(props)
        this.state = { data: undefined, currentTime: 0, isPlaying: false }
    }
    
    render() {
        return <div className={styles.viewer}>
            {
                this.state.data === undefined
                    ? <h1>Loading</h1>
                    : <Fragment>
                        <Player 
                            data={ this.state.data } 
                            currentTime={ this.state.currentTime } 
                            isPlaying={ this.state.isPlaying}></Player>
                        { this.Controls(this.state.data) }
                    </Fragment>
            }
        </div>;
    }

    componentDidMount() {
        recordingService.fetchRecordingData(this.props.match.params.recordingId)
            .then(data => {
                this.setState({ data });
            })
    }

    private Controls(data: DedupedData) {
        return (data.changes.length > 0 || (Object.keys(data.inputs).length > 0))
            ? <RecordingControls 
                duration={ this.duration() }
                time={ this.state.currentTime }
                isPlaying={ this.state.isPlaying }
                onPlay={ this.play }
                onPause={ this.stop }
                seek={ this.seek }></RecordingControls> 
            : null;
    }

    private duration() {
        if(!this.state.data) return 0;
        const { stopTime, startTime } = this.state.data.metadata;
        return stopTime ? stopTime - startTime : 0;
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

    seek = (toTime: number) => {
        this.setState({
            currentTime: toTime,
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
            const duration = this.duration();
            const currentTime = Math.min(this.state.currentTime + timeDiff, duration);
            if(timeDiff > 0) {
                this.setState({ currentTime });
            }
            if(currentTime >= duration) {
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
    match: match<{ recordingId: string }>
}

export interface ViewerState {
    data?: DedupedData;
    currentTime: number;
    isPlaying: boolean;
}