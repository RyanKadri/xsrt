import { Badge, createStyles, IconButton, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import { SvgIconProps } from "@material-ui/core/SvgIcon";
import ChatBubbleSharp from '@material-ui/icons/ChatBubbleSharp';
import FastRewindSharp from '@material-ui/icons/FastRewindSharp';
import PauseSharp from '@material-ui/icons/PauseSharp';
import PlaySharp from '@material-ui/icons/PlayArrowSharp';
import SettingsIcon from '@material-ui/icons/SettingsSharp';
import * as React from "react";
import { RecordingAnnotation } from '../../../services/annotation/annotation-service';
import { Region } from '../../../services/regions-service';
import { pure } from "../../common/pure-wrapper";
import { formatPlayerTime } from "../../utils/format-utils";
import { ProgressBar } from "./progress-bar/progress-bar";

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
    },
    actionButton: {
        marginLeft: 'auto'
    }
})

const _RecordingControls = (props: ControlsInput) => {
    const { classes, onToggleAnnotations, onToggleSettings, annotations, time, showRegions } = props;
    const pastAnnotations = annotations.filter(ann => ann.startTime < time)
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
        <Typography variant="body1" color="inherit">{ formatPlayerTime(props.time) } / { formatPlayerTime(props.duration) }</Typography>
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
    </footer>
}


const PlayOrPause = ({ isPlaying, onPlay, onPause, onSeek: seek, time, duration }: ControlsInput ) => {
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
        <Icon />
    </IconButton>
)

export const RecordingControls = withStyles(styles)(pure(_RecordingControls));

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