import { Checkbox, createStyles, TableCell, TableRow, makeStyles } from "@material-ui/core";
import { formatDate, formatPlayerTime, RecordingOverview } from "../../../../../common/src";
import React from "react";
import { Link } from "react-router-dom";
import { AvailableRecordingColumn, RecordingColumn } from "./available-columns";

const useStyles = makeStyles(createStyles({
  preview: {
    maxWidth: 360,
    maxHeight: 240,
    cursor: "pointer"
  },
}));

const columnDefs: {
  [col in AvailableRecordingColumn]:
  (recording: RecordingOverview, props: Props, classes: ReturnType<typeof useStyles>) => JSX.Element | string | null
} = {
  date: ({ startTime, uuid }) =>
    <Link to={`/recordings/${uuid}`}>
      {formatDate(startTime)}
    </Link>,
  duration: ({ duration }) =>
    duration
      ? formatPlayerTime(duration)
      : "N/A",
  ua: ({ uaDetails }) =>
    uaDetails
      ? `${uaDetails.browser.name} - ${uaDetails.os.name}`
      : "Unknown",
  preview: (recording, props, classes) =>
    recording.thumbnailPath
      ? <img
          className={ classes.preview }
          src={`${process.env.STATIC_HOST}/${recording.thumbnailPath}`}
          onClick={() => props.onPreview(recording)} />
      : null
};

export function RecordingRow(props: Props) {
  const classes = useStyles();
  const { recording, selected, onToggle, displayColumns } = props;
  const cols = displayColumns.map(col => columnDefs[col.key]);

  return (
    <TableRow>
      <TableCell>
        <Checkbox onChange={() => onToggle(recording)} checked={selected} />
      </TableCell>
      {cols.map((col, i) => <TableCell key={i}>{col(recording, props, classes)}</TableCell>)}
    </TableRow>
  );
}

interface Props {
  recording: RecordingOverview;
  selected: boolean;
  displayColumns: RecordingColumn[];
  onPreview: (thumbnail: RecordingOverview) => void;
  onToggle: (recording: RecordingOverview) => void;
}
