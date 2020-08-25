import { makeStyles, Theme, Typography } from "@material-ui/core";
import c from "classnames";
import React, { RefObject, useRef } from "react";
import { Group, RecordedNavigationEvent, RecordedResize, RecordedUserInput, reverseFind, SnapshotChunk } from "../../../../../common/src";
import { UserInputGroup } from "../../utils/recording-data-utils";
import { useComponentSize } from "../../utils/useComponentSize";

const useStyles = makeStyles((_: Theme) => ({
  horizExpand: {
    width: "100%",
    height: "100%",
    flexGrow: 1,
    border: "none"
  },

  playerContainer: {
    display: "flex",
    position: "absolute",
    overflow: "hidden",
  },

  inputGuard: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 10
  },

  errorOverlay: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },

  player: {
    transformOrigin: "center",
    top: "50%",
    left: "50%",
    position: "absolute",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column"
  },
  urlBar: {
    width: "100%"
  },
  frame: {
    border: "none",
    width: "100%",
    flexGrow: 1
  }
}));

export function FrameViewport({ inputs, snapshots, time, blockInputs, error, frameRef }: Props) {

  const classes = useStyles();
  const viewPort = useRef<HTMLDivElement>(null);

  const viewportSize = useComponentSize(viewPort);

  const iframeDimensions = (): React.CSSProperties => {
    const target = sizeAtTime(inputs, snapshots, time);
    const horizScale = viewportSize.width / target.width;
    const vertScale = viewportSize.height / target.height;
    const scale = Math.min(horizScale, vertScale);

    return {
      height: target.height,
      width: target.width,
      transform: `translate(-50%, -50%) scale(${scale})`
    };
  };

  const url = urlAtTime(snapshots, inputs, time);

  return (
    <div className={c(classes.horizExpand, classes.playerContainer)} ref={viewPort}>
      {blockInputs
        && <div className={classes.inputGuard} />
      }
      {error &&
        <div className={classes.errorOverlay} >
          <Typography variant="h2" color="inherit">{error}</Typography>
        </div>
      }
      <div style={iframeDimensions()}
        className={c(classes.player, classes.horizExpand)}>
        <div className={classes.urlBar}>{url}</div>
        <iframe sandbox="allow-same-origin"
          ref={frameRef}
          src="about:blank"
          className={classes.frame} />
      </div>
    </div>
  );
}

function urlAtTime(snapshots: SnapshotChunk[], inputs: UserInputGroup[], time: number) {
  const source = infoSource<RecordedNavigationEvent>(inputs, snapshots, "soft-navigate", time);
  return !source
    ? ""
    : "snapshot" in source
      ? source.snapshot.documentMetadata.url.path
      : source.url;
}

function sizeAtTime(inputs: UserInputGroup[], snapshots: SnapshotChunk[], time: number) {
  const source = infoSource<RecordedResize>(inputs, snapshots, "resize", time);
  return source && "snapshot" in source
    ? {
      height: source.snapshot.documentMetadata.viewportHeight,
      width: source.snapshot.documentMetadata.viewportWidth
    }
    : !!source
      ? { height: source.height, width: source.width }
      : { height: 0, width: 0 };
}

function infoSource<T extends RecordedUserInput>(
  inputs: UserInputGroup[], snapshots: SnapshotChunk[], eventType: T["type"], time: number
) {
  const lastSnapshot = lastSnapshotBefore(snapshots, time);
  const lastEvent = lastEventBefore(inputs, eventType, time);
  if (lastSnapshot && !lastEvent) {
    return lastSnapshot;
  } else if (lastEvent && !lastSnapshot) {
    return lastEvent;
  } else if (lastEvent && lastSnapshot) {
    return lastEvent.timestamp > lastSnapshot.startTime
      ? lastEvent
      : lastSnapshot;
  } else {
    return undefined;
  }
}

function lastSnapshotBefore(snapshots: SnapshotChunk[], time: number) {
  return reverseFind(snapshots, snapshot => snapshot.startTime <= time);
}

function lastEventBefore<T extends RecordedUserInput>(
  inputs: UserInputGroup[], type: T["type"], time: number
): T | undefined {
  const eventGroup = inputs.find(group => group.name === type);
  return eventGroup
    ? reverseFind(eventGroup.elements, el => el.timestamp <= time) as T
    : undefined;
}

interface Props {
  error: string | undefined;
  blockInputs: boolean;
  frameRef: RefObject<HTMLIFrameElement>;
  snapshots: SnapshotChunk[];
  inputs: Group<RecordedUserInput>[];
  time: number;
}
