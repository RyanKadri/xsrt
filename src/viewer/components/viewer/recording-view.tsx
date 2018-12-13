import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { DedupedData } from "../../../scraper/types/types";
import { RecordingResolver } from "../../services/recording-service";
import { withData } from "../../services/with-data";
import { RecordingViewer } from "./viewer";

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: 480,
        height: `calc(100vh - ${theme.spacing.unit * 8}px)`
    }
})

class _RecordingView extends React.Component<RecordingViewData> {
    render() {
        const { classes, data } = this.props;
        return <div className={ classes.root }>
            <RecordingViewer data={ data } />
        </div>
    }
}

export const RecordingView = withStyles(styles)(
    withData(_RecordingView, { data: RecordingResolver })
)

export interface RecordingViewData extends WithStyles<typeof styles> {
    data: DedupedData;
}