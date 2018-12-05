import * as React from 'react';
import { RecordingControls } from './footer-controls/footer-controls';
import { DedupedData } from '../../../scraper/types/types';
import { match } from 'react-router';
import { Fragment } from 'react';
import { RecordingApiService } from '../../services/recording-service';
import { RecordingPlayer } from './player/player';
import { withDependencies } from '../../services/with-dependencies';
import { createStyles, withStyles, WithStyles, Theme } from '@material-ui/core';

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: 480,
        height: `calc(100vh - ${theme.spacing.unit * 8}px)`
    }
})

class _ViewerComponent extends React.Component<ViewerData, ViewerState> {

    constructor(props: ViewerData) {
        super(props)
        this.state = { data: undefined, lastFrameTime: undefined, playerTime: 0, isPlaying: false }
    }
    
    render() {
        const { classes } = this.props;
        return <div className={ classes.root }>{
                this.state.data === undefined
                    ? <h1>Loading</h1>
                    : <Fragment>
                        <RecordingPlayer 
                            data={ this.state.data } 
                            currentTime={ this.state.playerTime } 
                            isPlaying={ this.state.isPlaying}/>
                        { this.Controls(this.state.data) }
                    </Fragment>
        }</div>;
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
                time={ this.state.playerTime }
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
            this.nextFrame();
        }
    }

    stop = () => {
        if(this.state.isPlaying) {
            this.setState({ 
                isPlaying: false,
                lastFrameTime: undefined
            });
        }
    }

    seek = (toTime: number) => {
        this.setState({
            playerTime: toTime,
        }, () => {
            this.play();
        });
    }

    private nextFrame() {
        requestAnimationFrame((curr) => {
            let timeDiff = 0;
            if(this.state.lastFrameTime) {
                timeDiff = curr - this.state.lastFrameTime
            }
            const duration = this.duration();
            const currentTime = Math.min(this.state.playerTime + timeDiff, duration);
            if(currentTime === duration) {
                this.stop();
                this.setState({ playerTime: this.duration() })
            } else {
                // this.setState({ playerTime: currentTime });
                if(this.state.isPlaying) {
                    this.setState({ lastFrameTime: curr, playerTime: currentTime })
                    this.nextFrame();
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
    playerTime: number;
    lastFrameTime?: number;
    isPlaying: boolean;
}