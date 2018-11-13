import * as React from "react";
import { faPlay, faPause, faRedo } from '@fortawesome/free-solid-svg-icons';
import './footer-controls.css';
import { IconButton } from "../common/icon-button";
import { formatDuration } from "../utils/format-utils";

export const RecordingControls = (props: ControlsInput) => {
    return <footer>
        <div className="progress-bar-container">
            <div className="progress-bar" style={ { width: props.time / props.duration * 100 + '%' } }></div>
        </div>
        <nav className="control-icons">
            { PlayOrPause(props) }
        </nav>
        <section>{ formatDuration(props.time) } / { formatDuration(props.duration) }</section>
    </footer>
}


const controlButton = 'control-button';
const PlayOrPause = ({ isPlaying, onPlay, onPause, onRestart, time, duration }: ControlsInput ) => {
    if(isPlaying){
        return <IconButton icon={ faPause } onClick={ onPause } buttonClass={ controlButton }></IconButton>
    } else if(time === duration) {
        return <IconButton icon={ faRedo } onClick={ onRestart } buttonClass={ controlButton }></IconButton>
    } else {
        return <IconButton icon={ faPlay } onClick={ onPlay } buttonClass={ controlButton }></IconButton>;
    }
}

export interface ControlsInput {
    onPlay: () => void;
    onPause: () => void;
    onRestart: () => void;
    isPlaying: boolean;
    duration: number;
    time: number;
}