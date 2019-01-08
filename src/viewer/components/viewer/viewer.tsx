import { CircularProgress, createStyles, Theme, withStyles, WithStyles } from '@material-ui/core';
import * as React from 'react';
import { Fragment } from 'react';
import { between } from '../../../common/utils/functional-utils';
import { RecordedMutationGroup, RecordingMetadata, SnapshotChunk } from '../../../scraper/types/types';
import { RecordingAnnotation } from '../../services/annotation/annotation-service';
import { Region } from '../../services/regions-service';
import { UIConfigService } from '../../services/ui-config-service';
import { withDependencies } from '../../services/with-dependencies';
import { formatPlayerTime } from '../utils/format-utils';
import { UserInputGroup } from '../utils/recording-data-utils';
import { ActionPrompt } from './action-prompt';
import { AnnotationSidebar } from './annotation-sidebar/annotation-sidebar';
import { RecordingControls } from './footer-controls/footer-controls';
import { RecordingPlayer } from './player/player';
import { ViewerSettingsPopover } from './viewer-settings';

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

class _RecordingViewer extends React.PureComponent<ViewerProps, ViewerState> {

    constructor(props: ViewerProps) {
        super(props)
        this.state = { 
            hasError: false,
            playerTime: 0,
            isPlaying: false,
            showingAnnotations: false,
            lastFrameTime: undefined,
            waitingOnBuffer: false,
            showingSettings: false,
            settingsAnchor: null,
            settings: props.uiConfig.loadViewerConfig()
        }
    }

    static getDerivedStateFromError(_: string | Error): Partial<ViewerState> {
        return { hasError: true, isPlaying: false }
    }
    
    render() {
        const { classes } = this.props;
        const actionPrompt = this.formActionPrompt();
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
                                    isPlaying={ this.state.isPlaying }
                                    recordingMetadata={ this.props.recordingMetadata }
                                    error={ this.state.hasError ? "Something went wrong": undefined }
                                    lockUI={ this.state.settings.blockViewerOnPause }
                                />
                                { actionPrompt
                                    ? <ActionPrompt prompt={ actionPrompt.prompt } onPromptClicked={ actionPrompt.action } />
                                    : null
                                }
                                <AnnotationSidebar 
                                    expanded={ this.state.showingAnnotations }
                                    annotations={ this.pastAnnotations } />
                            </Fragment>
                    }
                </div>
                <RecordingControls 
                    duration={ this.props.duration }
                    time={ this.state.playerTime }
                    buffer={ this.props.bufferPos }
                    isPlaying={ this.state.isPlaying }
                    annotations={ this.props.annotations }
                    regions={ this.props.regions }
                    showRegions={ this.state.settings.showRegions }
                    onPlay={ this.play }
                    onPause={ this.stop }
                    onSeek={ this.seek }
                    onToggleAnnotations={ this.toggleAnnotations }
                    onToggleSettings={ this.toggleSettings } />
                <ViewerSettingsPopover 
                    open={this.state.showingSettings}
                    settings={this.state.settings}
                    onUpdate={this.updateSettings}
                    onClose={this.closeSettings}
                    anchor={this.state.settingsAnchor}
                />
            </Fragment>
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
        if(this.props.bufferPos <= this.state.playerTime
            && !this.state.waitingOnBuffer 
            && this.state.isPlaying) {
            this.stop();
            this.setState({
                waitingOnBuffer: true
            });
        } else if(this.props.bufferPos > this.state.playerTime 
            && this.state.waitingOnBuffer) {
            this.play();
            this.setState({
                waitingOnBuffer: false
            })
        }
    }

    get pastAnnotations() {
        return this.props.annotations.filter(ann => ann.startTime < this.state.playerTime)
    }

    formActionPrompt() {
        const currRegion = this.props.regions.find(region => 
            between(region.start, region.end)(this.state.playerTime)
        )

        const regionTooShort = !currRegion || currRegion.end - currRegion.start < 3000;

        return (!currRegion || currRegion.type !== 'idle' || regionTooShort)
            ? null
            : { 
                prompt: `Skip ${ formatPlayerTime(currRegion.end - this.state.playerTime) } seconds idle time`,
                action: () => { this.seek( currRegion.end ) }
             }
    }

    closeSettings = () => {
        this.setState({ showingSettings: false })
    }

    toggleSettings = (evt: React.MouseEvent) => {
        const target: HTMLElement = evt.currentTarget as HTMLElement;
        this.setState(oldState => ({ 
            showingSettings: !oldState.showingSettings,
            settingsAnchor: target
        }));
    }

    updateSettings = (settings: ViewerSettings) => {
        this.props.uiConfig.saveViewerConfig(settings);
        this.setState({
            settings
        })
    }
}

export const RecordingViewer = withStyles(styles)(
    withDependencies(_RecordingViewer, {
        uiConfig: UIConfigService
    }));

export interface ViewerProps extends WithStyles<typeof styles> {
    uiConfig: UIConfigService

    snapshots: SnapshotChunk[];
    inputs: UserInputGroup[];
    changes: RecordedMutationGroup[];
    annotations: RecordingAnnotation[];
    regions: Region[];

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
    showingSettings: boolean;
    waitingOnBuffer: boolean;
    settingsAnchor: HTMLElement | null;
    settings: ViewerSettings
}

export interface ViewerSettings {
    showRegions: boolean;
    blockViewerOnPause: boolean;
}
