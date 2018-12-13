import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';
import { Fragment } from 'react';
import { RecordedMutation } from '../../../scraper/record/dom-changes/mutation-recorder';
import { RecordedUserInput } from '../../../scraper/record/user-input/input-recorder';
import { DedupedData } from '../../../scraper/types/types';
import { AnnotationService } from '../../services/annotation/annotation-service';
import { withDependencies } from '../../services/with-dependencies';
import { eventsBetween } from '../utils/recording-data-utils';
import { AnnotationSidebar } from './annotation-sidebar/annotation-sidebar';
import { RecordingControls } from './footer-controls/footer-controls';
import { RecordingPlayer } from './player/player';

const styles = (_: Theme) => createStyles({
    recordingSpace: {
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        position: 'relative'
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
        }
    }
    
    render() {
        const { classes } = this.props; 
        return <Fragment>
                <div className={ classes.recordingSpace }>
                    <RecordingPlayer 
                        data={ this.props.data } 
                        currentTime={ this.state.playerTime } 
                        isPlaying={ this.state.isPlaying} />
                    <AnnotationSidebar 
                        expanded={ this.state.showingAnnotations }
                        annotations={ this.state.annotations } />
                </div>
                { this.Controls(this.props.data) }
            </Fragment>
    }

    private Controls(data: DedupedData) {
        //TODO - If I want to support single-frame snapshots, technically the inputs check is not right.
        return (data.changes.length > 0 || (Object.keys(data.inputs).length > 0))
            ? <RecordingControls 
                duration={ this.duration() }
                time={ this.state.playerTime }
                isPlaying={ this.state.isPlaying }
                numAnnotations={ this.state.annotations.length }
                onPlay={ this.play }
                onPause={ this.stop }
                seek={ this.seek }
                onToggleAnnotations={ this.toggleAnnotations } />
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
            const duration = this.duration();
            const currentTime = Math.min(this.state.playerTime + timeDiff, duration);
            if(currentTime === duration) {
                this.stop();
                this.setState({ playerTime: this.duration() })
            } else {
                if(this.state.isPlaying) {
                    const { changes, inputs } = eventsBetween(this.props.data, this.state.playerTime, currentTime);
                    this.setState({ 
                        lastFrameTime: curr,
                        playerTime: currentTime,
                        annotations: this.props.annotationService.annotateChanges(changes, inputs, this.state.annotations) 
                    });
                    this.nextFrame();
                }
            }
        });
    }
}

export const RecordingViewer = withStyles(styles)(withDependencies(_RecordingViewer, { annotationService: AnnotationService }));

export interface ViewerProps extends WithStyles<typeof styles> {
    data: DedupedData;
    annotationService: AnnotationService;
}

export interface ViewerState {
    playerTime: number;
    lastFrameTime?: number;
    isPlaying: boolean;
    showingAnnotations: boolean;
    annotations: RecordingAnnotation[];
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