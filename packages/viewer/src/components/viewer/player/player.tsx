import { RecordedMutationGroup, SnapshotChunk, Asset } from "../../../../../common/src";
import React, { useEffect, useRef } from "react";
import { PlaybackManager } from "../../../playback/playback-manager";
import { UserInputGroup } from "../../utils/recording-data-utils";
import { FrameViewport } from "./resizeable-frame";
import { withDependencies } from "../../../../../common-frontend/src";

interface Props {
  snapshots: SnapshotChunk[];
  changes: RecordedMutationGroup[];
  inputs: UserInputGroup[];
  assets: Asset[];
  currentTime: number;
  isPlaying: boolean;
  error?: string;
  onError: (err: any) => void;
  playbackManager: PlaybackManager;
  lockUI: boolean;
}

function _RecordingPlayer(props: Props) {

  const iframe = useRef<HTMLIFrameElement>(null);

  const lastFrameInfo = useRef<LastFrameInfo>({ wasPlaying: false, time: 0 });
  const { isPlaying, lockUI, error, snapshots, changes, inputs, assets, currentTime, playbackManager } = props;

  useEffect(() => {
    if (iframe.current && iframe.current.contentDocument && snapshots.length > 0) {
      playbackManager.reset(iframe.current!.contentDocument, snapshots[0]);
    }
  }, []);

  useEffect(() => {
    playbackManager.togglePause(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (!iframe.current || !iframe.current.contentDocument || props.error) {
      return;
    }

    const lastFrame = lastFrameInfo.current;

    props.playbackManager.playUpdates(
      snapshots, changes, inputs, assets, lastFrame.time, currentTime, iframe.current.contentDocument
    );

    if (lastFrame.wasPlaying && !props.isPlaying) {
      props.playbackManager.togglePause(true);
    } else if (!lastFrame.wasPlaying && props.isPlaying) {
      props.playbackManager.togglePause(false);
    }

    lastFrameInfo.current = { time: props.currentTime, wasPlaying: props.isPlaying };
  }, [props.currentTime]);

  return (
    <FrameViewport
      blockInputs={(isPlaying || lockUI)}
      error={error}
      frameRef={iframe}
      inputs={props.inputs}
      snapshots={props.snapshots}
      time={props.currentTime} />
  );

}

interface LastFrameInfo {
  time: number;
  wasPlaying: boolean;
}

export const RecordingPlayer = withDependencies(_RecordingPlayer, {
  playbackManager: PlaybackManager
})
