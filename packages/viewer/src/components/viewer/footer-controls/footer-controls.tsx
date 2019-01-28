import { Badge, createStyles, IconButton, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import { SvgIconProps } from "@material-ui/core/SvgIcon";
import ChatBubbleSharp from "@material-ui/icons/ChatBubbleSharp";
import FastRewindSharp from "@material-ui/icons/FastRewindSharp";
import PauseSharp from "@material-ui/icons/PauseSharp";
import PlaySharp from "@material-ui/icons/PlayArrowSharp";
import SettingsIcon from "@material-ui/icons/SettingsSharp";
import { formatPlayerTime } from "@xsrt/common/src/utils/format-utils";
import * as React from "react";
import { RecordingAnnotation } from "../../../services/annotation/annotation-service";
import { Region } from "../../../services/regions-service";
import { ProgressBar } from "./progress-bar/progress-bar";

export const footerRenderDebounce = 100;
const darkGreyInd = 900;

const styles = (theme: Theme) => createStyles({
    controls: {
        backgroundColor: theme.palette.grey[darkGreyInd],
        color: theme.palette.primary.contrastText,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        position: "relative"
    },
    icon: {
        color: theme.palette.primary.contrastText
    },
    actionButton: {
        marginLeft: "auto"
    }
});

class _RecordingControls extends React.Component<ControlsInput> {
    private lastRenderTime = 0;
    render() {
        const props = this.props;
        const { classes, onToggleAnnotations, onToggleSettings, annotations, time, showRegions } = props;
        const pastAnnotations = annotations.filter(ann => ann.startTime < time);
        return <footer className={ classes.controls }>
            <ProgressBar
                duration={ props.duration }
                buffer={ props.buffer }
                time={ props.time }
                seek={ props.onSeek }
                regions={ props.regions }
                annotations={ annotations }
                showRegions={showRegions}
            />
            <PlayOrPause {...props} />
            <Typography variant="body1" color="inherit">
                { formatPlayerTime(props.time) } / { formatPlayerTime(props.duration) }
            </Typography>
            <IconButton onClick={ onToggleSettings } color="inherit" className={classes.actionButton}>
                <SettingsIcon />
            </IconButton>
            <IconButton onClick={ onToggleAnnotations } color="inherit">
                <Badge color="primary"
                     badgeContent={ pastAnnotations.length }
                     invisible={ pastAnnotations.length === 0 }>
                    <ChatBubbleSharp />
                </Badge>
            </IconButton>
        </footer>;
    }

    shouldComponentUpdate(nextProps: ControlsInput) {
        for (const [key, val] of Object.entries(nextProps)) {
            const currVal = this.props[key as keyof ControlsInput];
            if (key !== "time" && currVal !== val) {
                this.lastRenderTime = nextProps.time;
                return true;
            }
        }
        if (nextProps.time - this.lastRenderTime > footerRenderDebounce) {
            this.lastRenderTime = nextProps.time;
            return true;
        } else {
            return false;
        }
    }
}

const PlayOrPause = ({ isPlaying, onPlay, onPause, onSeek: seek, time, duration }: ControlsInput ) => {
    if (isPlaying) {
        return <Icon action={ onPause } ButtonIcon={ PauseSharp } />;
    } else if (time === duration) {
        return <Icon action={() => seek(0)} ButtonIcon={ FastRewindSharp } />;
    } else {
        return <Icon action={ onPlay} ButtonIcon={ PlaySharp } />;
    }
};

const Icon = ({action, ButtonIcon}: { action: () => void, ButtonIcon: React.ComponentType<SvgIconProps>}) => (
    <IconButton onClick={ action } color="inherit">
        <ButtonIcon />
    </IconButton>
);

export const RecordingControls = withStyles(styles)(_RecordingControls);

export interface ControlsInput extends WithStyles<typeof styles> {
    onPlay: () => void;
    onPause: () => void;
    onToggleAnnotations: () => void;
    onToggleSettings: (evt: React.MouseEvent) => void;
    onSeek: (pos: number) => void;
    isPlaying: boolean;
    duration: number;
    time: number;
    buffer: number;
    annotations: RecordingAnnotation[];
    regions: Region[];
    showRegions: boolean;
}
