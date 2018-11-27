import React from "react";
import styles from './progress-bar.css';

export const ProgressBar = ({seek, time, duration}: ProgressBarProps) =>
    <div className={ styles.progressBarContainer} onClick={ (e) => handleSeek(e, seek, duration) }>
        <div className={styles.progressBar} style={ { width: time / duration * 100 + '%' } }></div>
    </div>

const handleSeek = (evt: React.MouseEvent<HTMLDivElement>, seek: (pos: number) => void, duration: number) => {
    const target = evt.currentTarget as HTMLDivElement;
    const bb = target.getBoundingClientRect();
    const seekRatio = (evt.pageX - bb.left) / bb.width;
    seek(duration * seekRatio)
}

export interface ProgressBarProps {
    seek(pos: number): void;
    time: number;
    duration: number
}