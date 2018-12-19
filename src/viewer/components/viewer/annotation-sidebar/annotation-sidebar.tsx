import { createStyles, Fade, Paper, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { RecordingAnnotation } from "../../../services/annotation/annotation-service";

const styles = (theme: Theme) => createStyles({
    root: {
        position: 'absolute',
        right: 0,
        height: '100%',
        padding: theme.spacing.unit,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 240,
        overflowY: 'auto'
    },
    notification: {
        padding: theme.spacing.unit,
        marginTop: theme.spacing.unit
    }
})

class _AnnotationSidebar extends React.Component<AnnotationOverlayProps> {

    render() {
        const { classes, expanded, annotations } = this.props;
        return <Fade in={expanded}>
            <div className={ classes.root }>{
                annotations.map((annotation, i) => (
                    <Paper key={ i } elevation={ 6 } classes={{ root: classes.notification }}>
                        <Typography variant="body1">{ annotation.description }</Typography>
                    </Paper>
                ))
            }</div>
        </Fade>
    }
}

export const AnnotationSidebar = withStyles(styles)(_AnnotationSidebar)

export interface AnnotationOverlayProps extends WithStyles<typeof styles> {
    expanded: boolean;
    annotations: RecordingAnnotation[]
}