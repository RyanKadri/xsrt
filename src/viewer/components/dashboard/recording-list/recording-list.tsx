import React from "react";
import { Link } from "react-router-dom";
import { StoredMetadata } from "../../../services/recording-service";
import { Typography, List, ListItem } from "@material-ui/core";
import { formatDate } from "../../utils/format-utils";

export const RecordingList = ({ recordings }: { recordings: StoredMetadata[] }) => 
    recordings.length === 0 
        ?   <Typography variant="body1">No recordings yet...</Typography>
        :   <List>{
                recordings.map(RecordingListItem)
            }</List>;

const RecordingListItem = (recording: StoredMetadata) =>
    <ListItem key={recording._id}>
        <Link to={`/recordings/${recording._id}`}>
            { formatDate(recording.metadata.startTime) }
        </Link>
        { recording.thumbnail ? <img src={ `/screenshots/${recording.thumbnail}` }></img> : null } 
    </ListItem>