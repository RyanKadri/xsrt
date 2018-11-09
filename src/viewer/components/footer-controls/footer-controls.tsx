import * as React from "react";
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import './footer-controls.css';
import { IconButton } from "../common/icon-button";

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
const PlayOrPause = ({ isPlaying, onPlay, onPause }: ControlsInput ) => 
isPlaying
        ? <IconButton icon={ faPause } onClick={ onPause } buttonClass={ controlButton }></IconButton>
        : <IconButton icon={ faPlay } onClick={ onPlay } buttonClass={ controlButton }></IconButton>;

const formatDuration = (timeInMillis: number) => {
    const seconds = Math.round(timeInMillis / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${ pad(minutes) }:${ pad(seconds % 60) }`;
}

const pad = (num: number) => {
    return String(num).padStart(2, '0')
}

export interface ControlsInput {
    onPlay: () => void;
    onPause: () => void;
    isPlaying: boolean;
    duration: number;
    time: number;
}