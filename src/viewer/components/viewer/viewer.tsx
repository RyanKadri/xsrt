import * as React from 'react';
import { RecordingControls } from './footer-controls/footer-controls';
import { DedupedData } from '../../../scraper/types/types';
import { Fragment } from 'react';
import { RecordingResolver } from '../../services/recording-service';
import { RecordingPlayer } from './player/player';
import { createStyles, withStyles, WithStyles, Theme } from '@material-ui/core';
import { withData } from '../../services/with-data';

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
        this.state = { lastFrameTime: undefined, playerTime: 0, isPlaying: false }
    }
    
    render() {
        const { classes } = this.props;
        return <div className={ classes.root }>
            <Fragment>
                <RecordingPlayer 
                    data={ this.props.data } 
                    currentTime={ this.state.playerTime } 
                    isPlaying={ this.state.isPlaying}/>
                { this.Controls(this.props.data) }
            </Fragment>
        </div>;
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
        if(!this.props.data) return 0;
        const { stopTime, startTime } = this.props.data.metadata;
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
    withData(_ViewerComponent, { data: RecordingResolver })
)

export interface ViewerData extends WithStyles<typeof styles> {
    data: DedupedData;
}

export interface ViewerState {
    playerTime: number;
    lastFrameTime?: number;
    isPlaying: boolean;
}