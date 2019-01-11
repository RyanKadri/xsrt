import { createStyles, CssBaseline, MuiThemeProvider, Paper, Typography, withStyles, WithStyles } from "@material-ui/core";
import React, { Fragment } from "react";
import { appTheme } from "../../viewer/theme/theme";
import { ExtensionConfig } from "../config/extension-config";
import { fetchTab } from "../utils/utils";
import { ConfigForm } from "./components/config-form";
import { RunSection } from "./components/run-section";
import { startRecording, stopRecording } from "./recording-commands";
import { ConfigStorageService } from "./services/config-storage-service";

const styles = createStyles({
    root: {
        minWidth: 400
    }
});

const notRunningState = {
    recording: false,
    startTime: undefined
};

class _PopupRoot extends React.Component<RootProps, RootState> {

    constructor(props: RootProps) {
        super(props);
        this.state = {
            config: undefined,
            runState: undefined,
            timerId: undefined,
            elapsedTime: 0
        };
    }

    render() {
        return <Paper className={ this.props.classes.root }>
            <CssBaseline />
            <MuiThemeProvider theme={ appTheme }>{
                this.state.config === undefined || this.state.runState === undefined
                    ? <Typography variant="body1">Loading Config</Typography>
                    : <Fragment>
                        <RunSection
                            elapsedTime={this.state.elapsedTime}
                            status={ this.state.runState }
                            onStart={ this.onStart }
                            onStop={ this.onStop }
                        />
                        <ConfigForm config={ this.state.config } onSubmit={ this.onUpdate } />
                     </Fragment>
            }
            </MuiThemeProvider>
        </Paper>;
    }

    private onUpdate = (newConfig: ExtensionConfig) => {
        this.props.configService.saveConfig(newConfig);
    }

    async componentDidMount() {
        const config = await this.props.configService.fetchConfig();
        const runState = (await this.props.configService.fetchRunState()) || notRunningState;
        if (runState.recording) {
            this.startTimer();
        }
        this.setState({ config, runState });
    }

    private onStart = async () => {
        const tab = await fetchTab();

        this.startTimer();

        this.setState({
            runState: {
                recording: true,
                startTime: Date.now(),
            },
            elapsedTime: 0,
        }, this.saveRunState);
        startRecording(tab, this.state.config!);
    }

    private startTimer() {
        const timerId = window.setInterval(() => {
            if (this.state.runState && this.state.runState.recording) {
                this.setState(oldState => ({ elapsedTime: Date.now() - oldState.runState!.startTime! }));
            }
        }, 100);
        this.setState({ timerId });
    }

    private saveRunState = () => {
        this.props.configService.saveRunState(this.state.runState);
    }

    private onStop = async () => {
        const tab = await fetchTab();
        if (this.state.timerId) {
            window.clearInterval(this.state.timerId);
        }
        this.setState({
            runState: notRunningState,
            timerId: undefined,
            elapsedTime: undefined
        }, this.saveRunState);
        stopRecording(tab, this.state.config!);
    }
}

export const PopupRoot = withStyles(styles)(_PopupRoot);

export interface RootProps extends WithStyles<typeof styles> {
    configService: ConfigStorageService;
}

export interface RootState {
    config?: ExtensionConfig;
    runState?: RecordingStatus;
    timerId?: number;
    elapsedTime?: number;
}

export interface RecordingStatus {
    recording: boolean;
    startTime?: number;
}
