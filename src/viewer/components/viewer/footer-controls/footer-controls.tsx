import * as React from "react";
import styles from './footer-controls.css';
import { formatDuration } from "../../utils/format-utils";
import { ProgressBar } from "./progress-bar/progress-bar";
import { IconButton } from "@material-ui/core";
import PauseSharp from '@material-ui/icons/PauseSharp';
import PlaySharp from '@material-ui/icons/PlayArrowSharp';
import FastRewindSharp from '@material-ui/icons/FastRewindSharp';

export const RecordingControls = (props: ControlsInput) => {
    return <footer className={ styles.controls }>
        <ProgressBar duration={props.duration} time={props.time} seek={props.seek} />
        <nav className={ styles.controlIcons }>
            { PlayOrPause(props) }
        </nav>
        <section>{ formatDuration(props.time) } / { formatDuration(props.duration) }</section>
    </footer>
}


const PlayOrPause = ({ isPlaying, onPlay, onPause, seek, time, duration }: ControlsInput ) => {
    if(isPlaying){
        return <IconButton onClick={ onPause }>
            <PauseSharp></PauseSharp>
        </IconButton>
    } else if(time === duration) {
        return <IconButton onClick={ () => seek(0) }>
            <FastRewindSharp></FastRewindSharp>
        </IconButton>
    } else {
        return <IconButton onClick={ onPlay }>
            <PlaySharp></PlaySharp>
        </IconButton>;
    }
}

export interface ControlsInput {
    onPlay: () => void;
    onPause: () => void;
    seek: (pos: number) => void;
    isPlaying: boolean;
    duration: number;
    time: number;
}