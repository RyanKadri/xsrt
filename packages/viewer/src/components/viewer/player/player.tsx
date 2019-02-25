import { RecordedMutationGroup, RecordingMetadata, SnapshotChunk } from "@xsrt/common";
import React, { useEffect, useRef } from "react";
import { PlaybackManager } from "../../../playback/playback-manager";
import { UserInputGroup } from "../../utils/recording-data-utils";
import { FrameViewport } from "./resizeable-frame";

export function RecordingPlayer(props: Props) {

    const iframe = useRef<HTMLIFrameElement>(null);

    const lastFrameInfo = useRef<LastFrameInfo>({ wasPlaying: false, time: 0 });
    const { isPlaying, lockUI, error, snapshots, changes, inputs, currentTime } = props;

    useEffect(() => {
        if (!iframe.current || !iframe.current.contentDocument) {
            return;
        }

        const lastFrame = lastFrameInfo.current;

        props.playbackManager.playUpdates(
            snapshots, changes, inputs, lastFrame.time, currentTime, iframe.current.contentDocument
        );

        if (lastFrame.wasPlaying && !props.isPlaying) {
            props.playbackManager.togglePause(true);
        } else if (!lastFrame.wasPlaying && props.isPlaying) {
            props.playbackManager.togglePause(false);
        }

        lastFrameInfo.current = { time: props.currentTime, wasPlaying: props.isPlaying };
    }, [ props.currentTime ]);

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

interface Props {
    recordingMetadata: RecordingMetadata;
    snapshots: SnapshotChunk[];
    changes: RecordedMutationGroup[];
    inputs: UserInputGroup[];
    currentTime: number;
    isPlaying: boolean;
    error?: string;
    playbackManager: PlaybackManager;
    lockUI: boolean;
}
