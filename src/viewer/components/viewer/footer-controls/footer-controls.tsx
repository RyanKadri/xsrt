import * as React from "react";
import { formatDuration } from "../../utils/format-utils";
import { ProgressBar } from "./progress-bar/progress-bar";
import { IconButton, createStyles, Theme, WithStyles, withStyles, Typography } from "@material-ui/core";
import PauseSharp from '@material-ui/icons/PauseSharp';
import PlaySharp from '@material-ui/icons/PlayArrowSharp';
import FastRewindSharp from '@material-ui/icons/FastRewindSharp';
import { SvgIconProps } from "@material-ui/core/SvgIcon";
import { pure } from "../../common/pure-wrapper";

const styles = (theme: Theme) => createStyles({
    controls: {
        backgroundColor: theme.palette.grey[900],
        color: theme.palette.primary.contrastText,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        position: 'relative'
    },
    icon: {
        color: theme.palette.primary.contrastText
    }
})

const _RecordingControls = (props: ControlsInput) => {
    const { classes } = props;
    return <footer className={ classes.controls }>
        <ProgressBar duration={props.duration} time={props.time} seek={props.seek} />
        { PlayOrPause(props) }
        <Typography variant="body1" color="inherit">{ formatDuration(props.time) } / { formatDuration(props.duration) }</Typography>
    </footer>
}


const PlayOrPause = ({ isPlaying, onPlay, onPause, seek, time, duration }: ControlsInput ) => {
    if(isPlaying){
        return Icon(onPause, PauseSharp);
    } else if(time === duration) {
        return Icon(() => seek(0), FastRewindSharp);
    } else {
        return Icon(onPlay, PlaySharp);
    }
}

const Icon = (onClick: () => void, Icon: React.ComponentType<SvgIconProps>) => (
    <IconButton onClick={ onClick } color="inherit">
        <Icon></Icon>
    </IconButton>
)

export const RecordingControls = withStyles(styles)(pure(_RecordingControls));

export interface ControlsInput extends WithStyles<typeof styles> {
    onPlay: () => void;
    onPause: () => void;
    seek: (pos: number) => void;
    isPlaying: boolean;
    duration: number;
    time: number;
}