import { Checkbox, createStyles, TableCell, TableRow, WithStyles, withStyles } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { RecordingOverview } from "../../../../scraper/types/types";
import { formatDate, formatPlayerTime } from "../../utils/format-utils";
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
    date: ({metadata, _id}) =>
            <Link to={`/recordings/${_id}`}>
                { formatDate(metadata.startTime) }
            </Link>,
    duration: ({metadata}) =>
            metadata.duration
                ? formatPlayerTime(metadata.duration)
                : "N/A",
    ua: ({metadata}) =>
            metadata.uaDetails
                ? `${ metadata.uaDetails.browser.name } - ${ metadata.uaDetails.os.name }`
                : "Unknown",
    preview: (recording, props ) =>
            recording.thumbnail
                ? <img
                    className={ props.classes.preview }
                    src={ `/screenshots/${recording.thumbnail}` }
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
