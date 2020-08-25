import { Fade, makeStyles, Paper, Theme, Typography } from "@material-ui/core";
import React from "react";
import { RecordingAnnotation } from "../../../services/annotation/annotation-service";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "absolute",
    right: 0,
    height: "100%",
    padding: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 240,
    overflowY: "auto"
  },
  notification: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
}));

const sidebarElevation = 6;

interface Props {
  expanded: boolean;
  annotations: RecordingAnnotation[];
}

export function AnnotationSidebar({ expanded, annotations }: Props) {
  const classes = useStyles();
  return (
    <Fade in={expanded}>
      <div className={classes.root}>{
        annotations.map((annotation, i) => (
          <Paper key={i} elevation={sidebarElevation} classes={{ root: classes.notification }}>
            <Typography variant="body1">{annotation.description}</Typography>
          </Paper>
        ))
      }</div>
    </Fade>
  );
}
