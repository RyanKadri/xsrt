import { createStyles, Theme, Tooltip, WithStyles, withStyles } from "@material-ui/core";
import c from 'classnames';
import React from "react";
import { RecordingAnnotation } from '../../../../services/annotation/annotation-service';
import { Region } from '../../../../services/regions-service';
import { footerRenderDebounce } from '../footer-controls';

const styles = (theme: Theme) => createStyles({
    progressBarContainer: {
        width: '100%',
        height: 20,
        position: 'absolute', 
        top: -10,
        transform: 'scaleY(1)',
        '&:hover': {
            transform: 'scaleY(1.25)'
        },
        transition: 'transform 150ms ease-in',
    },
    progressBar: {
        height: 4,
        backgroundColor: theme.palette.secondary.main,
        zIndex: 5
    },
    bufferBar: {
        height: 3,
        backgroundColor: theme.palette.grey[500],
        zIndex: 1
    },
    regionsBar: {
        height: 3,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        zIndex: 3
    },
    region: {
        height: '100%',
        position: 'absolute'
    },
    indicatorBar: {
        position: 'absolute',
        width: '100%',
        top: 10,
        transition: `transform ${footerRenderDebounce}ms linear`,
        transformOrigin: "left"
    },
    action: {
        backgroundColor: theme.palette.primary.light
    },
    idle: {
        backgroundColor: theme.palette.secondary.light
    },
    annotationIcon: {
        minWidth: 5,
        position: 'absolute',
        height: 5,
        backgroundColor: theme.palette.error.light,
        zIndex: 4,
        top: 10
    }
})

const _ProgressBar = ({seek, time, buffer, duration, regions, annotations, classes, showRegions }: ProgressBarProps) =>
    <>
        <div className={ classes.progressBarContainer} onClick={ (e) => handleSeek(e, seek, duration) }>
            <div className={ c(classes.indicatorBar, classes.progressBar) } style={ { transform: `scaleX(${time / duration})` } } />
            <div className={ c(classes.indicatorBar, classes.bufferBar) } style={ { transform: `scaleX(${buffer / duration})` } } />
            <ProgressAnnotations 
                annotations={ annotations } 
                duration={duration} 
                classes={classes}
                time={time}
            />
        </div>
        { showRegions
            ? <RegionsBar 
                    duration={duration}
                    regions={regions}
                    classes={classes}
                />
            : null
        }
    </>

const handleSeek = (evt: React.MouseEvent<HTMLDivElement>, seek: (pos: number) => void, duration: number) => {
    const target = evt.currentTarget as HTMLDivElement;
    const bb = target.getBoundingClientRect();
    const seekRatio = (evt.pageX - bb.left) / bb.width;
    seek(duration * seekRatio)
}

const RegionsBar = ({ duration, regions, classes }: Pick<ProgressBarProps, "duration" | "regions" | "classes">) => {
    return <div className={ classes.regionsBar }>{
        regions.map((region, i) => (
            <div key={i} className={c(classes.region, region.type === 'action' ? classes.action : classes.idle)}
                style={ { 
                    width: (region.end - region.start) / duration * 100 + '%',
                    left: (region.start) / duration * 100 + "%"
                } } 
            />
        ))
    }</div>
}

const ProgressAnnotations = ({ annotations, duration, classes, time }: Pick<ProgressBarProps, "annotations" | "classes" | "duration" | "time">) => {
    return <>{
        annotations
            .filter(ann => {
                return ann.triggers[0].cause.timestamp > time
            })
            .map((ann, i) => {
                return <Tooltip key={i} title={ann.description} placement="top">
                    <i className={ classes.annotationIcon }
                        style={ { 
                            left: ann.triggers[0].cause.timestamp / duration * 100 + '%',
                            width: (ann.triggers[ann.triggers.length - 1].cause.timestamp - ann.triggers[0].cause.timestamp) / duration * 100 + '%'
                        } }
                    />
                </Tooltip>
            })
    }</>
}

export const ProgressBar = withStyles(styles)(_ProgressBar)

export interface ProgressBarProps extends WithStyles<typeof styles> {
    seek(pos: number): void;
    time: number;
    buffer: number;
    duration: number;
    regions: Region[];
    annotations: RecordingAnnotation[];
    showRegions: boolean;
}