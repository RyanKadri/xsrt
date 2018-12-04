import React from "react";
import { createStyles, WithStyles, withStyles, Theme } from "@material-ui/core";

const styles = (theme: Theme) => createStyles({
    progressBarContainer: {
        width: '100%',
        height: 20,
        position: 'absolute', 
        top: -10,
        '&:hover $progressBar': {
            transform: 'scaleY(1)'
        }
    },
    progressBar: {
        position: 'absolute',
        top: 9,
        height: 4,
        backgroundColor: theme.palette.secondary.main,
        transition: 'transform 150ms ease-in',
        transform: 'scaleY(0.6)',
    },
})

const _ProgressBar = ({seek, time, duration, classes}: ProgressBarProps) =>
    <div className={ classes.progressBarContainer} onClick={ (e) => handleSeek(e, seek, duration) }>
        <div className={ classes.progressBar } style={ { width: time / duration * 100 + '%' } }></div>
    </div>

const handleSeek = (evt: React.MouseEvent<HTMLDivElement>, seek: (pos: number) => void, duration: number) => {
    const target = evt.currentTarget as HTMLDivElement;
    const bb = target.getBoundingClientRect();
    const seekRatio = (evt.pageX - bb.left) / bb.width;
    seek(duration * seekRatio)
}

export const ProgressBar = withStyles(styles)(_ProgressBar)

export interface ProgressBarProps extends WithStyles<typeof styles> {
    seek(pos: number): void;
    time: number;
    duration: number
}