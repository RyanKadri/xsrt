import React from "react";
import { Link } from "react-router-dom";
import { StoredMetadata } from "../../../services/recording-service";

export const RecordingList = ({ recordings }: { recordings: StoredMetadata[] }) => 
    <ul>{
        recordings.length > 0 
            ? recordings.map(RecordingListItem)
            : <li>No recordings yet...</li>
    }</ul>;

const RecordingListItem = (recording: StoredMetadata) =>
    <li key={recording._id}>
        <Link to={`/recordings/${recording._id}`}>
            { new Date(recording.metadata.startTime).toLocaleDateString('en-US') }
        </Link>
        { recording.thumbnail ? <img src={ `/screenshots/${recording.thumbnail}` }></img> : null } 
    </li>