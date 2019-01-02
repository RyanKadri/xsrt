import { CircularProgress, createStyles, Theme, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';
import { Fragment } from 'react';
import { RecordedMutationGroup } from '../../../scraper/record/dom-changes/mutation-recorder';
import { RecordingMetadata, SnapshotChunk } from '../../../scraper/types/types';
import { RecordingAnnotation } from '../../services/annotation/annotation-service';
import { UserInputGroup } from '../utils/recording-data-utils';
import { AnnotationSidebar } from './annotation-sidebar/annotation-sidebar';
import { RecordingControls } from './footer-controls/footer-controls';
import { RecordingPlayer } from './player/player';

const styles = (theme: Theme) => createStyles({
    recordingSpace: {
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        position: 'relative',
        backgroundColor: theme.palette.grey[800],
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressSpinner: {
        width: 80,
        height: 80
    }
})

class _RecordingViewer extends React.Component<ViewerProps, ViewerState> {

    constructor(props: ViewerProps) {
        super(props)
        this.state = { 
            hasError: false,
            playerTime: 0,
            isPlaying: false,
            showingAnnotations: false,
            lastFrameTime: undefined,
            waitingOnBuffer: false
        }
    }

    static getDerivedStateFromError(_: string | Error): Partial<ViewerState> {
        return { hasError: true, isPlaying: false }
    }
    
    render() {
        const { classes } = this.props; 
        return <Fragment>
                <div className={ classes.recordingSpace }>
                    {
                        this.props.snapshots.length === 0
                            ? <CircularProgress color="secondary" className={ classes.progressSpinner } />
                            : <Fragment>
                                <RecordingPlayer 
                                    snapshots={ this.props.snapshots }
                                    inputs={ this.props.inputs }
                                    changes={ this.props.changes } 
                                    currentTime={ this.state.playerTime } 
                                    isPlaying={ this.state.isPlaying}
                                    recordingMetadata={ this.props.recordingMetadata }
                                    error={ this.state.hasError ? "Something went wrong": undefined }
                                />
                                <AnnotationSidebar 
                                    expanded={ this.state.showingAnnotations }
                                    annotations={ this.availableAnnotations } />
                            </Fragment>
                    }
                </div>
                { this.Controls() }
            </Fragment>
    }

    private Controls() {
        return <RecordingControls 
                duration={ this.props.duration }
                time={ this.state.playerTime }
                buffer={ this.props.bufferPos }
                isPlaying={ this.state.isPlaying }
                numAnnotations={ this.availableAnnotations.length }
                onPlay={ this.play }
                onPause={ this.stop }
                seek={ this.seek }
                onToggleAnnotations={ this.toggleAnnotations } />;
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
        this.updateTime(toTime);
        this.setState({ }, () => {
            this.play();
        });
    }

    toggleAnnotations = () => {
        this.setState(oldState => ({
            showingAnnotations: !oldState.showingAnnotations
        }))
    }

    private nextFrame() {
        requestAnimationFrame((curr) => {
            let timeDiff = 0;
            if(this.state.lastFrameTime) {
                timeDiff = curr - this.state.lastFrameTime
            }
            const duration = this.props.duration;
            const currentTime = Math.min(this.state.playerTime + timeDiff, duration);
            if(currentTime === duration) {
                this.stop();
                this.updateTime(this.props.duration);
            } else {
                if(this.state.isPlaying) {
                    this.updateTime(currentTime)
                    this.setState({ 
                        lastFrameTime: curr,
                    });
                    this.nextFrame();
                }
            }
        });
    }

    private updateTime(toTime: number) {
        this.setState({
            playerTime: toTime,
        })
        this.props.onUpdateTime(toTime);
    }

    componentDidUpdate() {
        if(this.props.bufferPos <= this.state.playerTime && !this.state.waitingOnBuffer && this.state.isPlaying) {
            this.stop();
            this.setState({
                waitingOnBuffer: true
            });
        } else if(this.props.bufferPos > this.state.playerTime && this.state.waitingOnBuffer) {
            this.play();
            this.setState({
                waitingOnBuffer: false
            })
        }
    }

    get availableAnnotations() {
        return this.props.annotations.filter(ann => ann.startTime < this.state.playerTime)
    }
}

export const RecordingViewer = withStyles(styles)(_RecordingViewer);

export interface ViewerProps extends WithStyles<typeof styles> {
    snapshots: SnapshotChunk[];
    inputs: UserInputGroup[];
    changes: RecordedMutationGroup[];
    annotations: RecordingAnnotation[]

    recordingMetadata: RecordingMetadata;
    duration: number;

    bufferPos: number;
    onUpdateTime: (newTime: number) => void
}

export interface ViewerState {
    hasError: boolean;
    playerTime: number;
    lastFrameTime?: number;
    isPlaying: boolean;
    showingAnnotations: boolean;
    waitingOnBuffer: boolean;
}
