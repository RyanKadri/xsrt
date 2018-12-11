import { Button, createStyles, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { formatDuration } from "../../../viewer/components/utils/format-utils";
import { RecordingStatus } from "../popup-root";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: 2 * theme.spacing.unit
    }
})
const _RunSection = (props: RunSectionProps) => {
    const { classes, elapsedTime } = props;
    return <div className={ classes.root }>
        <Typography variant="body1">{ duration(elapsedTime) }</Typography>
        { Controls( props ) }
    </div>
}

const duration = (elapsedTime?: number) => {
    return elapsedTime && elapsedTime > 0
            ? `Recording: ${formatDuration(elapsedTime)}`
            : 'Not Recording'
}

const Controls = (props: RunSectionProps) => {
    return props.status.recording
        ? <Button color="secondary" onClick={ props.onStop }>Stop</Button>
        : <Button color="primary" onClick={ props.onStart }>Start</Button>
}

export const RunSection = withStyles(styles)(_RunSection);

export interface RunSectionProps extends WithStyles<typeof styles> {
    elapsedTime?: number;
    status: RecordingStatus;
    onStart(): void;
    onStop(): void;
}