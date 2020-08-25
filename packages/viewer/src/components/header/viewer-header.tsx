import { makeStyles } from "@material-ui/core";
import React from "react";
import { DocumentMetadata, formatDate, fullUrl, shortUrl } from "../../../../common/src";

const useStyles = makeStyles({
  header: {
    padding: 12,
    fontSize: "2em",
    color: "black",
    display: "flex",
    alignItems: "center"
  },
  date: {
    marginLeft: 16
  },
  url: {
    marginLeft: "auto",
    fontSize: "1.5rem"
  }
});

interface Props {
  metadata: DocumentMetadata;
  startTime: number;
}

export function RecordingHeader({ metadata, startTime }: Props) {
  const classes = useStyles();
  return (
    <header className={classes.header}>
      <a target="_blank" href={fullUrl(metadata.url)} className={classes.url}>{shortUrl(metadata.url)}</a>
      <small className={classes.date}>{formatDate(startTime)}</small>
    </header>
  );
}
