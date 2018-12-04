import * as React from 'react';
import { RecordingControls } from './footer-controls/footer-controls';
import { DedupedData } from '../../../scraper/types/types';
import { match } from 'react-router';
import { Fragment } from 'react';
import { RecordingApiService } from '../../services/recording-service';
import { RecordingPlayer } from './player/player';
import { withDependencies } from '../../services/with-dependencies';
import { createStyles, withStyles, WithStyles } from '@material-ui/core';

const styles = createStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: 480
    }
})

class _ViewerComponent extends React.Component<ViewerData, ViewerState> {

    private startTime?: number;
    
    constructor(props: ViewerData) {
        super(props)
        this.state = { data: undefined, currentTime: 0, isPlaying: false }
    }
    
    render() {
        const { classes } = this.props;
        return <div className={ classes.root }>
            {
                this.state.data === undefined
                    ? <h1>Loading</h1>
                    : <Fragment>
                        <RecordingPlayer 
                            data={ this.state.data } 
                            currentTime={ this.state.currentTime } 
                            isPlaying={ this.state.isPlaying}/>
                        { this.Controls(this.state.data) }
                    </Fragment>
            }
        </div>;
    }

    componentDidMount() {
        this.props.recordingService.fetchRecordingData(this.props.match.params.recordingId)
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

export const ViewerComponent = withStyles(styles)(
    withDependencies(_ViewerComponent, { recordingService: RecordingApiService })
)

export interface ViewerData extends WithStyles<typeof styles> {
    match: match<{ recordingId: string }>;
    recordingService: RecordingApiService
}

export interface ViewerState {
    data?: DedupedData;
    currentTime: number;
    isPlaying: boolean;
}