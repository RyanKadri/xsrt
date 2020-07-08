import { Checkbox, createStyles, TableCell, TableRow, WithStyles, withStyles } from "@material-ui/core";
import { formatDate, formatPlayerTime, RecordingOverview } from "../../../../../common/src";
import React from "react";
import { Link } from "react-router-dom";
import { AvailableRecordingColumn, RecordingColumn } from "./available-columns";

const styles = createStyles({
    preview: {
        maxWidth: 360,
        maxHeight: 240,
        cursor: "pointer"
    },
});

const columnDefs: {
    [col in AvailableRecordingColumn ]:
        (recording: RecordingOverview, props: RecordingTableRowProps) => JSX.Element | string | null
} = {
    date: ({ startTime, uuid}) =>
            <Link to={`/recordings/${uuid}`}>
                { formatDate(startTime.getTime()) }
            </Link>,
    duration: ({ duration }) =>
            duration
                ? formatPlayerTime(duration)
                : "N/A",
    ua: ({ uaDetails }) =>
            uaDetails
                ? `${ uaDetails.browser.name } - ${ uaDetails.os.name }`
                : "Unknown",
    preview: (recording, props ) =>
            recording.thumbnailPath
                ? <img
                    className={ props.classes.preview }
                    src={ `${process.env.STATIC_HOST}/screenshots/${recording.thumbnailPath}` }
                    onClick={ () => props.onPreview(recording) } />
                : null
};

const _RecordingRow = (props: RecordingTableRowProps) => {
    const { recording, selected, onToggle, displayColumns } = props;
    const cols = displayColumns.map( col => columnDefs[col.key] );
    return <TableRow>
        <TableCell>
            <Checkbox onChange={() => onToggle( recording )} checked={ selected } />
        </TableCell>
        { cols.map((col, i) => <TableCell key={i}>{ col(recording, props) }</TableCell>) }
    </TableRow>;
};

export const RecordingRow = withStyles(styles)(_RecordingRow);

export interface RecordingTableRowProps extends WithStyles<typeof styles> {
    recording: RecordingOverview;
    selected: boolean;
    displayColumns: RecordingColumn[];
    onPreview: (thumbnail: RecordingOverview) => void;
    onToggle: (recording: RecordingOverview) => void;
}
