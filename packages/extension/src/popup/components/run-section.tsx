import { Button, createStyles, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import { formatPlayerTime } from "../../../../common/src";
import React from "react";
import { RecordingStatus } from "../popup-root";

const styles = (theme: Theme) => createStyles({
    root: {
        padding: theme.spacing(2)
    }
});
const _RunSection = (props: RunSectionProps) => {
    const { classes, elapsedTime } = props;
    return <div className={ classes.root }>
        <Typography variant="body1">{ duration(elapsedTime) }</Typography>
        { Controls( props ) }
    </div>;
};

const duration = (elapsedTime?: number) => {
    return elapsedTime && elapsedTime > 0
            ? `Recording: ${formatPlayerTime(elapsedTime)}`
            : "Not Recording";
};

const Controls = (props: RunSectionProps) => {
    return props.status.recording
        ? <Button color="secondary" onClick={ props.onStop }>Stop</Button>
        : <Button color="primary" onClick={ props.onStart }>Start</Button>;
};

export const RunSection = withStyles(styles)(_RunSection);

export interface RunSectionProps extends WithStyles<typeof styles> {
    elapsedTime?: number;
    status: RecordingStatus;
    onStart(): void;
    onStop(): void;
}
