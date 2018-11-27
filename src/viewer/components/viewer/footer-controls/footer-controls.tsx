import * as React from "react";
import { faPlay, faPause, faRedo } from '@fortawesome/free-solid-svg-icons';
import styles from './footer-controls.css';
import { IconButton } from "../../common/icon-button";
import { formatDuration } from "../../utils/format-utils";
import { ProgressBar } from "./progress-bar/progress-bar";

export const RecordingControls = (props: ControlsInput) => {
    return <footer className={ styles.controls }>
        <ProgressBar duration={props.duration} time={props.time} seek={props.seek} />
        <nav className={ styles.controlIcons }>
            { PlayOrPause(props) }
        </nav>
        <section>{ formatDuration(props.time) } / { formatDuration(props.duration) }</section>
    </footer>
}


const controlButton = 'control-button';
const PlayOrPause = ({ isPlaying, onPlay, onPause, seek, time, duration }: ControlsInput ) => {
    if(isPlaying){
        return <IconButton icon={ faPause } onClick={ onPause } buttonClass={ controlButton }></IconButton>
    } else if(time === duration) {
        return <IconButton icon={ faRedo } onClick={ () => seek(0) } buttonClass={ controlButton }></IconButton>
    } else {
        return <IconButton icon={ faPlay } onClick={ onPlay } buttonClass={ controlButton }></IconButton>;
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