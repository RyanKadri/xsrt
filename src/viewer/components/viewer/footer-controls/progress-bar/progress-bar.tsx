import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core";
import c from 'classnames';
import React from "react";

const styles = (theme: Theme) => createStyles({
    progressBarContainer: {
        width: '100%',
        height: 20,
        position: 'absolute', 
        top: -10,
        '&:hover $progressBar, &:hover $bufferBar': {
            transform: 'scaleY(1)'
        }
    },
    progressBar: {
        height: 4,
        backgroundColor: theme.palette.secondary.main,
        transform: 'scaleY(0.6)',
        zIndex: 5
    },
    bufferBar: {
        height: 3,
        backgroundColor: theme.palette.grey[500],
        transform: 'scaleY(0.6)',
        zIndex: 1
    },
    indicatorBar: {
        position: 'absolute',
        top: 10,
        transition: 'transform 150ms ease-in',
    }
})

const _ProgressBar = ({seek, time, buffer, duration, classes}: ProgressBarProps) =>
    <div className={ classes.progressBarContainer} onClick={ (e) => handleSeek(e, seek, duration) }>
        <div className={ c(classes.indicatorBar, classes.progressBar) } style={ { width: time / duration * 100 + '%' } }></div>
        <div className={ c(classes.indicatorBar, classes.bufferBar) } style={ { width: buffer / duration * 100 + '%' } }></div>
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
    buffer: number;
    duration: number;
}