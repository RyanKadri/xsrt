import { CircularProgress, createStyles, Theme, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';
import { Fragment } from 'react';
import { RecordedMutation, RecordedMutationGroup } from '../../../scraper/record/dom-changes/mutation-recorder';
import { RecordedUserInput } from '../../../scraper/record/user-input/input-recorder';
import { RecordedInputChannels, RecordingMetadata, SnapshotChunk } from '../../../scraper/types/types';
import { AnnotationService } from '../../services/annotation/annotation-service';
import { withDependencies } from '../../services/with-dependencies';
import { eventsBetween } from '../utils/recording-data-utils';
import { AnnotationSidebar } from './annotation-sidebar/annotation-sidebar';
import { RecordingControls } from './footer-controls/footer-controls';
import { RecordingPlayer } from './player/player';

const styles = (theme: Theme) => createStyles({
    recordingSpace: {
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        position: 'relative',
        backgroundColor: theme.palette.grey[800]
    }
})

class _RecordingViewer extends React.Component<ViewerProps, ViewerState> {

    constructor(props: ViewerProps) {
        super(props)
        this.state = { 
            playerTime: 0,
            isPlaying: false,
            showingAnnotations: false,
            annotations: [],
            lastFrameTime: undefined,
            waitingOnBuffer: false
        }
    }
    
    render() {
        const { classes } = this.props; 
        return <Fragment>
                <div className={ classes.recordingSpace }>
                    {
                        this.props.snapshots.length === 0
                            ? <CircularProgress color="secondary" />
                            : <Fragment>
                                <RecordingPlayer 
                                    snapshots={ this.props.snapshots }
                                    inputs={ this.props.inputs }
                                    changes={ this.props.changes } 
                                    currentTime={ this.state.playerTime } 
                                    isPlaying={ this.state.isPlaying}
                                    recordingMetadata={ this.props.recordingMetadata }
                                />
                                <AnnotationSidebar 
                                    expanded={ this.state.showingAnnotations }
                                    annotations={ this.state.annotations } />
                            </Fragment>
                    }
                </div>
                { this.Controls() }
            </Fragment>
    }

    //TODO - Maybe go back and rethink snapshots (if we want them)
    private Controls() {
        return <RecordingControls 
                duration={ this.props.duration }
                time={ this.state.playerTime }
                isPlaying={ this.state.isPlaying }
                numAnnotations={ this.state.annotations.length }
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
        this.setState({
            annotations: []
        }, () => {
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
                    const { changes, inputs } = eventsBetween(this.props.changes, this.props.inputs, this.state.playerTime, currentTime);
                    this.updateTime(currentTime)
                    this.setState({ 
                        lastFrameTime: curr,
                        annotations: this.props.annotationService.annotateChanges(changes, inputs, this.state.annotations) 
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
}

export const RecordingViewer = withStyles(styles)(withDependencies(_RecordingViewer, { annotationService: AnnotationService }));

export interface ViewerProps extends WithStyles<typeof styles> {
    snapshots: SnapshotChunk[];
    inputs: RecordedInputChannels;
    changes: RecordedMutationGroup[];
    recordingMetadata: RecordingMetadata;
    duration: number;
    bufferPos: number;
    annotationService: AnnotationService;
    onUpdateTime: (newTime: number) => void
}

export interface ViewerState {
    playerTime: number;
    lastFrameTime?: number;
    isPlaying: boolean;
    showingAnnotations: boolean;
    annotations: RecordingAnnotation[];
    waitingOnBuffer: boolean;
}

export interface RecordingAnnotation {
    description: string;
    cause?: AnnotationCause;
}

export type AnnotationCause = InputCause | MutationCause;

export interface InputCause {
    type: 'input';
    input: RecordedUserInput;
} 

export interface MutationCause {
    type: 'mutation';
    mutation: RecordedMutation
}